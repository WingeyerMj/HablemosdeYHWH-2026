from pathlib import Path
import subprocess, sys, wave

BASE = Path(r"C:\xampp\htdocs\HablemosdeYHWH-2026\video-output")
ROOT = BASE / "mejorado"
VOICE_MP3 = ROOT / "voz_argentina"
VOICE_WAV = ROOT / "voz_argentina_pcm"
CARDS = ROOT / "escenas_guion_usuario"
sys.path.insert(0, str(BASE / "pydeps"))
import imageio_ffmpeg

ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()
VOICE_WAV.mkdir(exist_ok=True)

# Decodificación PCM: elimina las estimaciones variables de duración de MP3.
mp3_files = sorted(VOICE_MP3.glob("*.mp3"))
wav_files = []
for mp3 in mp3_files:
    wav_path = VOICE_WAV / f"{mp3.stem}.wav"
    subprocess.run([ffmpeg, "-y", "-i", str(mp3), "-ar", "48000", "-ac", "1", "-c:a", "pcm_s16le", str(wav_path)],
                   check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    wav_files.append(wav_path)

pause_seconds = 0.32
durations = []
master = ROOT / "narracion_argentina_sincronizada.wav"
with wave.open(str(wav_files[0]), "rb") as first:
    params = first.getparams()
silence = b"\x00" * int(params.framerate * pause_seconds * params.nchannels * params.sampwidth)

with wave.open(str(master), "wb") as output:
    output.setparams(params)
    for wav_path in wav_files:
        with wave.open(str(wav_path), "rb") as clip:
            frames = clip.readframes(clip.getnframes())
            seconds = clip.getnframes() / clip.getframerate()
        output.writeframes(frames)
        output.writeframes(silence)
        durations.append(seconds + pause_seconds)

# Cada escena dura exactamente lo mismo que su párrafo de audio.
scene_list = ROOT / "escenas_sincronizadas.txt"
lines = []
for i, seconds in enumerate(durations, 1):
    lines.append(f"file '{(CARDS / f'{i:02d}.jpg').as_posix()}'")
    lines.append(f"duration {seconds:.6f}")
lines.append(f"file '{(CARDS / f'{len(durations):02d}.jpg').as_posix()}'")
scene_list.write_text("\n".join(lines), encoding="utf-8")

silent_video = ROOT / "video_sincronizado_sin_audio.mp4"
subprocess.run([ffmpeg, "-y", "-f", "concat", "-safe", "0", "-i", str(scene_list),
                "-vf", "fps=12,format=yuv420p", "-c:v", "libx264", "-preset", "veryfast", "-crf", "19", str(silent_video)], check=True)

final = ROOT / "Hablemos-de-YHWH-sincronizacion-corregida.mp4"
subprocess.run([ffmpeg, "-y", "-i", str(silent_video), "-i", str(master),
                "-filter:a", "highpass=f=70,lowpass=f=14500,acompressor=threshold=-20dB:ratio=1.8:attack=15:release=180,loudnorm=I=-16:TP=-1.5:LRA=8",
                "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac", "-b:a", "160k", "-shortest", "-movflags", "+faststart", str(final)], check=True)

print(final)
for i, seconds in enumerate(durations, 1):
    print(f"Escena {i:02d}: {seconds:.3f}s")
