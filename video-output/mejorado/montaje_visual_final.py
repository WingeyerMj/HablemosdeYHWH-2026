from pathlib import Path
import subprocess, sys, wave
from PIL import Image

BASE = Path(r"C:\xampp\htdocs\HablemosdeYHWH-2026\video-output")
ROOT = BASE / "mejorado"
CARDS = ROOT / "escenas_guion_usuario"
PCM = ROOT / "voz_argentina_pcm"
sys.path.insert(0, str(BASE / "pydeps"))
import imageio_ffmpeg

ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()

def fit(source, destination, background):
    img = Image.open(source).convert("RGB")
    ratio = min(1920 / img.width, 1080 / img.height)
    img = img.resize((round(img.width * ratio), round(img.height * ratio)), Image.Resampling.LANCZOS)
    canvas = Image.new("RGB", (1920, 1080), background)
    canvas.paste(img, ((1920-img.width)//2, (1080-img.height)//2))
    canvas.save(destination, quality=95, subsampling=0)

presentation = CARDS / "00_presentacion.jpg"
aliyot_audio = CARDS / "06a_aliyot_audios.jpg"
aliyot_text = CARDS / "06b_aliyot_texto.jpg"
identity = CARDS / "10_identidad_detalle.jpg"
blog_news = CARDS / "08b_blog_noticias.jpg"
fit(ROOT / "presentacion-portada.png", presentation, (25, 25, 25))
fit(ROOT / "aliyot-audios.png", aliyot_audio, (245, 243, 239))
fit(ROOT / "aliyot-hebreo-fonetica.png", aliyot_text, (245, 243, 239))
fit(ROOT / "identidad-detalle.png", identity, (255, 255, 255))
fit(ROOT / "blog-noticias-detalle.png", blog_news, (250, 248, 244))

durations = []
for p in sorted(PCM.glob("*.wav")):
    with wave.open(str(p), "rb") as w:
        durations.append(w.getnframes()/w.getframerate() + 0.32)

sequence = [
    (presentation, durations[0]),
    (presentation, durations[1]),
    (CARDS/"03.jpg", durations[2]),
    (CARDS/"04.jpg", durations[3]),
]

# Calendario: dos vistas aportadas.
sequence += [(CARDS/"05_calendario_claro.jpg", durations[4]/2),
             (CARDS/"05_calendario_oscuro.jpg", durations[4]/2)]

# Aliyot: reproductores y luego texto hebreo/fonética.
sequence += [(aliyot_audio, durations[5]/2),
             (aliyot_text, durations[5]/2)]

# Parashot y las demás secciones ya corregidas.
for i in range(7, 14):
    image = identity if i in (10, 11) else CARDS/f"{i:02d}.jpg"
    sequence.append((image, durations[i-1]))

timeline = ROOT / "linea_visual_final.txt"
lines=[]
for image, seconds in sequence:
    lines += [f"file '{image.as_posix()}'", f"duration {seconds:.6f}"]
lines.append(f"file '{sequence[-1][0].as_posix()}'")
timeline.write_text("\n".join(lines), encoding="utf-8")

silent = ROOT / "montaje_visual_final_sin_audio.mp4"
subprocess.run([ffmpeg,"-y","-f","concat","-safe","0","-i",str(timeline),
                "-vf","fps=12,format=yuv420p","-c:v","libx264","-preset","veryfast","-crf","19",str(silent)],check=True)

final = ROOT / "Hablemos-de-YHWH-presentacion-y-aliyot-corregidos.mp4"
audio = ROOT / "narracion_argentina_sincronizada.wav"
subprocess.run([ffmpeg,"-y","-i",str(silent),"-i",str(audio),
                "-filter:a","highpass=f=70,lowpass=f=14500,acompressor=threshold=-20dB:ratio=1.8:attack=15:release=180,loudnorm=I=-16:TP=-1.5:LRA=8",
                "-map","0:v","-map","1:a","-c:v","copy","-c:a","aac","-b:a","160k","-shortest","-movflags","+faststart",str(final)],check=True)
print(final)
