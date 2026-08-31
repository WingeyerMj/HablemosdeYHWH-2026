from pathlib import Path
import subprocess, sys, wave
from PIL import Image, ImageDraw, ImageFont

BASE = Path(r"C:\xampp\htdocs\HablemosdeYHWH-2026\video-output")
ROOT = BASE / "mejorado"
SHOTS = ROOT / "secciones"
VOICE = ROOT / "voz_guion_usuario"
sys.path.insert(0, str(BASE / "pydeps"))
import imageio_ffmpeg

scenes = [
    ("01_inicio.png", "YHWH", "Yud • Hei • Vav • Hei"),
    ("01_inicio.png", "BIENVENIDOS", "Raíces hebreas de nuestra fe"),
    ("02_quienes_somos.png", "QUIÉNES SOMOS", "Una comunidad, no una denominación"),
    ("03_torah_viviente.png", "TORÁ VIVIENTE", "El estudio también en tu dispositivo"),
    ("04_calendario.png", "CALENDARIO LUNISOLAR", "Shavuot • Yom Teruaj • Yom Kipur • Sucot"),
    ("05a_aliyot.png", "ALIYOT", "Audio, reseña, hebreo, español y fonética"),
    ("05_parashot.png", "PARASHOT", "Las porciones semanales"),
    ("06_ensenanzas.png", "ENSEÑANZAS", "Estudios para vivir el Shabat"),
    ("07_semillas.png", "SEMILLAS DE TORÁ", "Materiales para niños y familias"),
    ("10_novedades.png", "UNA MANERA DE VIVIR", "Identidad, testimonios y novedades"),
    ("10a_identidad.png", "IDENTIDAD", "Lo que Yud • Hei • Vav • Hei declara"),
    ("11_contacto.png", "CONTACTO", "Mensajes, suscripción y publicaciones"),
    ("12_footer.png", "COMENCEMOS", "www.hablemosdeyhwh.com"),
]

font_bold = ImageFont.truetype(r"C:\Windows\Fonts\segoeuib.ttf", 43)
font_sub = ImageFont.truetype(r"C:\Windows\Fonts\segoeui.ttf", 27)
cards = ROOT / "escenas_guion_usuario"
cards.mkdir(exist_ok=True)

durations = []
audio_files = sorted(VOICE.glob("*.wav"))
for wav_path in audio_files:
    with wave.open(str(wav_path), "rb") as w:
        durations.append(w.getnframes() / w.getframerate() + 0.45)

for idx, ((filename, title, subtitle), duration) in enumerate(zip(scenes, durations), 1):
    img = Image.open(SHOTS / filename).convert("RGB")
    draw = ImageDraw.Draw(img, "RGBA")
    draw.rounded_rectangle((70, 790, 1500, 1015), radius=25, fill=(7,13,22,218), outline=(212,168,83,210), width=3)
    draw.text((118, 827), title, font=font_bold, fill=(255,255,255,255))
    draw.text((118, 899), subtitle, font=font_sub, fill=(235,207,151,255))
    draw.text((118, 955), "HABLEMOS DE YHWH", font=font_sub, fill=(205,215,224,255))
    img.save(cards / f"{idx:02d}.jpg", quality=94, subsampling=0)

# Une las locuciones PCM e inserta una pausa breve entre bloques.
master = ROOT / "narracion_guion_usuario.wav"
with wave.open(str(audio_files[0]), "rb") as first:
    params = first.getparams()
with wave.open(str(master), "wb") as out:
    out.setparams(params)
    silence = b"\x00" * int(params.framerate * 0.45 * params.nchannels * params.sampwidth)
    for p in audio_files:
        with wave.open(str(p), "rb") as src:
            out.writeframes(src.readframes(src.getnframes()))
        out.writeframes(silence)

concat = ROOT / "escenas_guion_usuario.txt"
lines = []
for i, duration in enumerate(durations, 1):
    lines += [f"file '{(cards / f'{i:02d}.jpg').as_posix()}'", f"duration {duration:.3f}"]
lines.append(f"file '{(cards / f'{len(durations):02d}.jpg').as_posix()}'")
concat.write_text("\n".join(lines), encoding="utf-8")

ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()
video = ROOT / "video_guion_usuario_sin_audio.mp4"
subprocess.run([ffmpeg, "-y", "-f", "concat", "-safe", "0", "-i", str(concat), "-vf", "fps=12,format=yuv420p",
                "-c:v", "libx264", "-preset", "veryfast", "-crf", "19", str(video)], check=True)

total = sum(durations)
final = ROOT / "Hablemos-de-YHWH-guion-personalizado.mp4"
music = f"sine=frequency=174:sample_rate=44100:duration={total:.3f},volume=0.007,afade=t=in:st=0:d=3,afade=t=out:st={max(0,total-4):.3f}:d=4[bed];[1:a]aresample=44100,acompressor=threshold=-18dB:ratio=2[voice];[voice][bed]amix=inputs=2:duration=longest:weights='1 0.4'[mix]"
subprocess.run([ffmpeg, "-y", "-i", str(video), "-i", str(master), "-filter_complex", music,
                "-map", "0:v", "-map", "[mix]", "-c:v", "copy", "-c:a", "aac", "-b:a", "160k",
                "-t", f"{total:.3f}", "-movflags", "+faststart", str(final)], check=True)
print(f"{final}\nDuración: {total:.2f} segundos")
