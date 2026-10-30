(function () {
  'use strict';

  var sharedAudioCtx = null;
  var connectedElements = new WeakMap();

  function getAudioContext() {
    var AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;
    if (!sharedAudioCtx) {
      sharedAudioCtx = new AudioCtx();
    }
    if (sharedAudioCtx.state === 'suspended') {
      sharedAudioCtx.resume().catch(function () {});
    }
    return sharedAudioCtx;
  }

  function dbToLinear(db) {
    var n = Number(db) || 0;
    return Math.pow(10, n / 20);
  }

  /**
   * Conecta un elemento <audio> a un GainNode + DynamicsCompressorNode (limitador suave)
   * para amplificar decibeles sin saturar ni recortar la voz.
   */
  function attachAudioGain(audioEl, initialDb) {
    if (!audioEl) return null;
    var existing = connectedElements.get(audioEl);
    if (existing) {
      existing.setDb(initialDb);
      return existing;
    }

    var state = {
      db: Number(initialDb) || 0,
      source: null,
      gainNode: null,
      compressor: null,
      connected: false,
      setDb: function (newDb) {
        state.db = Math.max(0, Math.min(24, Number(newDb) || 0));
        audioEl.setAttribute('data-gain-db', String(state.db));
        if (state.gainNode && sharedAudioCtx) {
          var lin = dbToLinear(state.db);
          state.gainNode.gain.setValueAtTime(lin, sharedAudioCtx.currentTime);
        } else if (state.db > 0 && !audioEl.paused) {
          ensureGraph();
        }
      }
    };

    function ensureGraph() {
      if (state.connected) {
        var ctxNow = getAudioContext();
        if (ctxNow && state.gainNode) {
          state.gainNode.gain.setValueAtTime(dbToLinear(state.db), ctxNow.currentTime);
        }
        return;
      }
      var ctx = getAudioContext();
      if (!ctx) return;
      try {
        var source = ctx.createMediaElementSource(audioEl);
        var gainNode = ctx.createGain();
        var compressor = ctx.createDynamicsCompressor();

        // Limitador suave para evitar distorsión al subir muchos decibeles
        compressor.threshold.setValueAtTime(-3.0, ctx.currentTime);
        compressor.knee.setValueAtTime(6.0, ctx.currentTime);
        compressor.ratio.setValueAtTime(12.0, ctx.currentTime);
        compressor.attack.setValueAtTime(0.003, ctx.currentTime);
        compressor.release.setValueAtTime(0.15, ctx.currentTime);

        gainNode.gain.setValueAtTime(dbToLinear(state.db), ctx.currentTime);

        source.connect(gainNode);
        gainNode.connect(compressor);
        compressor.connect(ctx.destination);

        state.source = source;
        state.gainNode = gainNode;
        state.compressor = compressor;
        state.connected = true;
      } catch (err) {
        console.warn('No se pudo conectar amplificador WebAudio:', err);
      }
    }

    audioEl.addEventListener('play', function () {
      var currentAttrDb = Number(audioEl.getAttribute('data-gain-db') || state.db) || 0;
      state.db = currentAttrDb;
      if (state.db > 0 || state.connected) {
        ensureGraph();
      }
    });

    connectedElements.set(audioEl, state);
    return state;
  }

  /**
   * Analiza un archivo de audio (File) o URL para detectar su pico máximo y sugerir cuántos dB subir
   * para llevar el volumen a un nivel óptimo (-1 dB pico).
   */
  async function analyzeOptimalGainDb(fileOrUrl) {
    var AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) throw new Error('Navegador sin soporte de análisis de audio');

    var arrayBuffer;
    if (fileOrUrl instanceof Blob) {
      arrayBuffer = await fileOrUrl.arrayBuffer();
    } else if (typeof fileOrUrl === 'string') {
      var resp = await fetch(fileOrUrl);
      arrayBuffer = await resp.arrayBuffer();
    } else {
      throw new Error('Archivo no válido');
    }

    var tempCtx = new AudioCtx();
    try {
      var audioBuffer = await tempCtx.decodeAudioData(arrayBuffer);
      var maxPeak = 0;
      for (var ch = 0; ch < audioBuffer.numberOfChannels; ch++) {
        var data = audioBuffer.getChannelData(ch);
        // Muestreo rápido cada 8 samples
        for (var i = 0; i < data.length; i += 8) {
          var abs = Math.abs(data[i]);
          if (abs > maxPeak) maxPeak = abs;
        }
      }
      if (maxPeak <= 0.0001) return 12;
      var targetPeak = 0.89; // ~ -1 dB
      var neededLinear = targetPeak / maxPeak;
      var neededDb = Math.round(20 * Math.log10(neededLinear));
      // Si incluso con pico alto la voz promedio es baja, sugerir al menos +4 dB si estaba en 0
      if (neededDb < 0) neededDb = 0;
      if (neededDb > 20) neededDb = 20;
      return neededDb;
    } finally {
      if (tempCtx.close) tempCtx.close().catch(function () {});
    }
  }

  /**
   * Inicializa los controles de amplificación dB dentro de una fila de carga o tarjeta de edición
   */
  function initAudioRowBooster(container) {
    if (!container || container.dataset.boosterInitialized === '1') return;
    container.dataset.boosterInitialized = '1';

    var slider = container.querySelector('.audio-gain-slider');
    var badge = container.querySelector('.audio-gain-badge');
    var hint = container.querySelector('.audio-gain-hint');
    var fileInput = container.querySelector('input[type="file"]');
    var previewAudio = container.querySelector('.audio-live-preview') || container.querySelector('audio');
    var presetBtns = container.querySelectorAll('.btn-gain-preset');
    var autoBtn = container.querySelector('.btn-gain-autolevel');

    var gainController = previewAudio ? attachAudioGain(previewAudio, slider ? slider.value : 0) : null;
    var currentObjectUrl = null;

    function updateUiDb(dbVal, customNote) {
      var clean = Math.max(0, Math.min(20, Math.round(Number(dbVal) || 0)));
      if (slider) slider.value = String(clean);
      if (badge) {
        badge.textContent = '+' + clean + ' dB';
        badge.className = 'badge audio-gain-badge ' + (clean === 0 ? 'bg-secondary' : (clean <= 8 ? 'bg-success' : (clean <= 14 ? 'bg-warning text-dark' : 'bg-danger')));
      }
      if (gainController) {
        gainController.setDb(clean);
      }
      if (hint && customNote) {
        hint.textContent = customNote;
      } else if (hint && clean > 0) {
        var factor = dbToLinear(clean).toFixed(1);
        hint.textContent = 'Volumen aumentado +' + clean + ' dB (×' + factor + ')';
      } else if (hint && previewAudio && !previewAudio.classList.contains('d-none')) {
        hint.textContent = 'Volumen original (0 dB)';
      }
    }

    if (slider) {
      slider.addEventListener('input', function () {
        updateUiDb(this.value);
      });
      updateUiDb(slider.value);
    }

    presetBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var db = Number(this.getAttribute('data-db')) || 0;
        updateUiDb(db);
      });
    });

    if (fileInput && previewAudio) {
      fileInput.addEventListener('change', function () {
        if (currentObjectUrl) {
          URL.revokeObjectURL(currentObjectUrl);
          currentObjectUrl = null;
        }
        if (this.files && this.files[0]) {
          currentObjectUrl = URL.createObjectURL(this.files[0]);
          previewAudio.src = currentObjectUrl;
          previewAudio.classList.remove('d-none');
          if (!gainController) {
            gainController = attachAudioGain(previewAudio, slider ? slider.value : 0);
          }
          if (hint) {
            hint.textContent = 'Reproducí para probar el volumen en vivo';
          }
        } else {
          previewAudio.pause();
          previewAudio.removeAttribute('src');
          previewAudio.classList.add('d-none');
        }
      });
    }

    if (autoBtn) {
      autoBtn.addEventListener('click', async function () {
        var sourceFile = (fileInput && fileInput.files && fileInput.files[0]) ? fileInput.files[0] : null;
        var existingSrc = (!sourceFile && previewAudio) ? (previewAudio.currentSrc || (previewAudio.querySelector('source') && previewAudio.querySelector('source').src) || previewAudio.src) : null;
        var target = sourceFile || existingSrc;
        if (!target) {
          if (hint) hint.textContent = 'Primero seleccioná un archivo de audio';
          return;
        }
        var origHtml = autoBtn.innerHTML;
        autoBtn.disabled = true;
        autoBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Analizando...';
        try {
          var suggestedDb = await analyzeOptimalGainDb(target);
          if (suggestedDb === 0) suggestedDb = 6; // Si ya tenía algún pico pero el usuario pidió nivelar, subir +6 dB
          updateUiDb(suggestedDb, 'Auto-nivelado sugerido: +' + suggestedDb + ' dB');
        } catch (err) {
          updateUiDb(10, 'Nivelado aplicado: +10 dB');
        } finally {
          autoBtn.disabled = false;
          autoBtn.innerHTML = origHtml;
        }
      });
    }
  }

  function initAllAudioPlayersAndBoosters() {
    // 1. Inicializar filas del modal o formulario de edición
    document.querySelectorAll('.audio-input-row, .existing-audio-card').forEach(function (row) {
      if (row.querySelector('.audio-gain-slider')) {
        initAudioRowBooster(row);
      }
    });

    // 2. Inicializar todos los reproductores <audio data-gain-db="..."> en frontend y backend
    document.querySelectorAll('audio[data-gain-db]').forEach(function (audioEl) {
      var db = Number(audioEl.getAttribute('data-gain-db')) || 0;
      if (db > 0) {
        attachAudioGain(audioEl, db);
      }
    });
  }

  window.initAudioRowBooster = initAudioRowBooster;
  window.attachAudioGain = attachAudioGain;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAllAudioPlayersAndBoosters);
  } else {
    initAllAudioPlayersAndBoosters();
  }
})();

