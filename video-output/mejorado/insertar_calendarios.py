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

def fit_1080(source, destination, background):
    img = Image.open(source).convert("RGB")
    ratio = min(1920 / img.width, 1080 / img.height)
    size = (round(img.width * ratio), round(img.height * ratio))
    img = img.resize(size, Image.Resampling.LANCZOS)
    canvas = Image.new("RGB", (1920, 1080), background)
    canvas.paste(img, ((1920 - size[0]) // 2, (1080 - size[1]) // 2))
    canvas.save(destination, quality=95, subsampling=0)

cal_light = CARDS / "05_calendario_claro.jpg"
cal_dark = CARDS / "05_calendario_oscuro.jpg"
fit_1080(ROOT / "calendario-claro.png", cal_light, (79, 60, 45))
fit_1080(ROOT / "calendario-oscuro.png", cal_dark, (15, 17, 21))

durations = []
for p in sorted(PCM.glob("*.wav")):
    with wave.open(str(p), "rb") as w:
        durations.append(w.getnframes() / w.getframerate() + 0.32)

sequence = []
for i in range(1, 5):
    sequence.append((CARDS / f"{i:02d}.jpg", durations[i-1]))

# El bloque Calendario se divide entre las dos imágenes aportadas por el usuario.
half = durations[4] / 2
sequence.append((cal_light, half))
sequence.append((cal_dark, durations[4] - half))

for i in range(6, 14):
    sequence.append((CARDS / f"{i:02d}.jpg", durations[i-1]))

timeline = ROOT / "escenas_con_calendarios.txt"
lines = []
for image, seconds in sequence:
    lines += [f"file '{image.as_posix()}'", f"duration {seconds:.6f}"]
lines.append(f"file '{sequence[-1][0].as_posix()}'")
timeline.write_text("\n".join(lines), encoding="utf-8")

silent = ROOT / "video_con_calendarios_sin_audio.mp4"
subprocess.run([ffmpeg, "-y", "-f", "concat", "-safe", "0", "-i", str(timeline),
                "-vf", "fps=12,format=yuv420p", "-c:v", "libx264", "-preset", "veryfast", "-crf", "19", str(silent)], check=True)

final = ROOT / "Hablemos-de-YHWH-calendario-corregido.mp4"
audio = ROOT / "narracion_argentina_sincronizada.wav"
subprocess.run([ffmpeg, "-y", "-i", str(silent), "-i", str(audio),
                "-filter:a", "highpass=f=70,lowpass=f=14500,acompressor=threshold=-20dB:ratio=1.8:attack=15:release=180,loudnorm=I=-16:TP=-1.5:LRA=8",
                "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac", "-b:a", "160k", "-shortest", "-movflags", "+faststart", str(final)], check=True)
print(final)
