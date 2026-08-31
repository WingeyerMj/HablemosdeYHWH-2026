import asyncio
from pathlib import Path
import re
import subprocess
import sys

BASE = Path(r"C:\xampp\htdocs\HablemosdeYHWH-2026\video-output")
ROOT = BASE / "mejorado"
DEPS = BASE / "pydeps"
sys.path.insert(0, str(DEPS))
import edge_tts
import imageio_ffmpeg

VOICE = "es-AR-TomasNeural"
texts = [
    "Iúd... Jéi... Vav... Jéi. El nombre que inspira este espacio.",
    "¿Sentís, a veces, que el ruido cotidiano te aleja de lo esencial? Bienvenidos a Hablemos de Iúd Jéi Vav Jéi: una comunidad para redescubrir las raíces hebreas de nuestra fe.",
    "En Quiénes somos, vas a conocer el propósito de la comunidad. No somos una institución ni una denominación. Somos personas que buscan acercarse al Creador con sinceridad.",
    "Torá Viviente lleva el estudio a tu dispositivo. La aplicación reúne fuentes textuales, contenidos de la Torá y del Brit Hadayá, y herramientas para acompañar la lectura cotidiana.",
    "El calendario lunisolar bíblico permite consultar los tiempos señalados, y comprender celebraciones como Yavuot, Yom Teruaj, Yom Kipur y Sucot.",
    "En Aliyot encontrarás las lecturas diarias de la Parayá de la semana en audios, junto con una breve reseña y un análisis de la lectura. También vas a encontrar los versículos en español, en hebreo y con su fonética, para descargar y compartir.",
    "En Parayot podés seguir las porciones semanales, abrir cada lectura y profundizar en su contexto.",
    "La sección Enseñanzas amplía ese recorrido con estudios y recursos para vivir el Yabat y aplicar la Torá cada día.",
    "Semillas de Torá es el espacio infantil. Materiales visuales, alegres y pedagógicos, para que los niños y las familias conozcan los valores bíblicos y las fiestas del Creador.",
    "La página también reúne contenido sobre identidad, testimonios, novedades y formas de participar. Cada sección está pensada para que el aprendizaje no quede solamente en palabras, sino que se transforme en una manera de vivir.",
    "Tenés, también, un área dedicada a la Identidad. La serie completa enseña que la identidad del creyente no se construye desde emociones, cultura, religión o experiencias personales, sino desde lo que Iúd Jéi Vav Jéi declara en Su Palabra.",
    "Desde el área de contacto podés enviar tu mensaje, suscribirte y mantenerte al tanto de las nuevas publicaciones.",
    "Te invitamos a recorrer: www punto hablemos de i griega, hache, doble ve, hache, punto com. Hablemos de Iúd Jéi Vav Jéi... Comencemos.",
]

async def synthesize():
    out = ROOT / "voz_argentina"
    out.mkdir(exist_ok=True)
    for i, text in enumerate(texts, 1):
        communicate = edge_tts.Communicate(text, VOICE, rate="-8%", pitch="-8Hz", volume="+0%")
        await communicate.save(str(out / f"{i:02d}.mp3"))
    return out

voice_dir = asyncio.run(synthesize())
ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()

def duration(path):
    p = subprocess.run([ffmpeg, "-i", str(path), "-f", "null", "-"], text=True, capture_output=True)
    m = re.search(r"Duration: (\d+):(\d+):(\d+\.\d+)", p.stderr)
    if not m:
        raise RuntimeError(f"No se pudo leer la duración de {path}")
    return int(m.group(1))*3600 + int(m.group(2))*60 + float(m.group(3))

clips = sorted(voice_dir.glob("*.mp3"))
durations = [duration(p) + 0.28 for p in clips]

audio_list = ROOT / "voz_argentina_concat.txt"
audio_list.write_text("\n".join(f"file '{p.as_posix()}'" for p in clips), encoding="utf-8")
master = ROOT / "narracion_argentina.mp3"
subprocess.run([ffmpeg, "-y", "-f", "concat", "-safe", "0", "-i", str(audio_list), "-c:a", "copy", str(master)], check=True)

cards = ROOT / "escenas_guion_usuario"
scene_list = ROOT / "escenas_argentina.txt"
lines = []
for i, seconds in enumerate(durations, 1):
    lines += [f"file '{(cards / f'{i:02d}.jpg').as_posix()}'", f"duration {seconds:.3f}"]
lines.append(f"file '{(cards / f'{len(durations):02d}.jpg').as_posix()}'")
scene_list.write_text("\n".join(lines), encoding="utf-8")

silent = ROOT / "video_argentino_sin_audio.mp4"
subprocess.run([ffmpeg, "-y", "-f", "concat", "-safe", "0", "-i", str(scene_list),
                "-vf", "fps=12,format=yuv420p", "-c:v", "libx264", "-preset", "veryfast", "-crf", "19", str(silent)], check=True)

final = ROOT / "Hablemos-de-YHWH-voz-argentina-natural.mp4"
subprocess.run([ffmpeg, "-y", "-i", str(silent), "-i", str(master),
                "-filter:a", "highpass=f=70,lowpass=f=14500,acompressor=threshold=-20dB:ratio=1.8:attack=15:release=180,loudnorm=I=-16:TP=-1.5:LRA=8,afade=t=in:st=0:d=0.08",
                "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac", "-b:a", "160k", "-shortest", "-movflags", "+faststart", str(final)], check=True)
print(f"{final}\nDuración aproximada: {sum(durations):.2f} segundos")
