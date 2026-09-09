from pathlib import Path
import subprocess
import sys
import wave

from PIL import Image

BASE = Path(r"C:\xampp\htdocs\HablemosdeYHWH-2026\video-output")
ROOT = BASE / "mejorado"
SHOTS = ROOT / "capturas-2026-09"
PCM = ROOT / "voz_argentina_pcm"
FIT = ROOT / "capturas-2026-09-ajustadas"
sys.path.insert(0, str(BASE / "pydeps"))
import imageio_ffmpeg

ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()
FIT.mkdir(exist_ok=True)

def fit(source, destination, background=(20, 20, 20)):
    image = Image.open(source).convert("RGB")
    ratio = min(1920 / image.width, 1080 / image.height)
    image = image.resize((round(image.width * ratio), round(image.height * ratio)), Image.Resampling.LANCZOS)
    canvas = Image.new("RGB", (1920, 1080), background)
    canvas.paste(image, ((1920 - image.width) // 2, (1080 - image.height) // 2))
    canvas.save(destination, quality=95, subsampling=0)

names = [
    "01_portada_fusion", "02_quienes_somos_redil", "03_torah_viviente", "04_calendario",
    "05_aliyot_superior", "06_aliyot_textos", "07_parashot", "08_ensenanzas", "09_semillas",
    "10_blog", "11_identidad", "12_contacto",
]
images = {}
for name in names:
    output = FIT / f"{name}.jpg"
    fit(SHOTS / f"{name}.png", output, (248, 246, 242))
    images[name] = output

durations = []
for audio in sorted(PCM.glob("*.wav")):
    with wave.open(str(audio), "rb") as stream:
        durations.append(stream.getnframes() / stream.getframerate() + 0.32)

sequence = [
    (images["01_portada_fusion"], durations[0]),
    (images["01_portada_fusion"], durations[1]),
    (images["02_quienes_somos_redil"], durations[2]),
    (images["03_torah_viviente"], durations[3]),
    (images["04_calendario"], durations[4]),
    (images["05_aliyot_superior"], durations[5] / 2),
    (images["06_aliyot_textos"], durations[5] / 2),
    (images["07_parashot"], durations[6]),
    (images["08_ensenanzas"], durations[7]),
    (images["09_semillas"], durations[8]),
    (images["10_blog"], durations[9]),
    (images["11_identidad"], durations[10]),
    (images["12_contacto"], durations[11]),
    (images["01_portada_fusion"], durations[12]),
]

timeline = ROOT / "linea_visual_fusion_redil.txt"
lines = []
for image, seconds in sequence:
    lines.extend([f"file '{image.as_posix()}'", f"duration {seconds:.6f}"])
lines.append(f"file '{sequence[-1][0].as_posix()}'")
timeline.write_text("\n".join(lines), encoding="utf-8")

silent = ROOT / "fusion_redil_sin_audio.mp4"
subprocess.run([
    ffmpeg, "-y", "-f", "concat", "-safe", "0", "-i", str(timeline),
    "-vf", "fps=12,format=yuv420p", "-c:v", "libx264", "-preset", "veryfast", "-crf", "19", str(silent),
], check=True)

final = ROOT / "Hablemos-de-YHWH-El-Redil-de-Yeshua.mp4"
audio = ROOT / "narracion_argentina_sincronizada.wav"
subprocess.run([
    ffmpeg, "-y", "-i", str(silent), "-i", str(audio),
    "-filter:a", "highpass=f=70,lowpass=f=14500,acompressor=threshold=-20dB:ratio=1.8:attack=15:release=180,loudnorm=I=-16:TP=-1.5:LRA=8",
    "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac", "-b:a", "160k", "-shortest", "-movflags", "+faststart", str(final),
], check=True)
print(final)
