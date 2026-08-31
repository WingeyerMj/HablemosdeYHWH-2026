from pathlib import Path
import subprocess
import sys
from PIL import Image, ImageDraw, ImageFont, ImageEnhance

BASE = Path(r"C:\xampp\htdocs\HablemosdeYHWH-2026\video-output")
ROOT = BASE / "mejorado"
SHOTS = ROOT / "secciones"
sys.path.insert(0, str(BASE / "pydeps"))
import imageio_ffmpeg

W, H, FPS, DURATION = 1920, 1080, 12, 112
font_bold = ImageFont.truetype(r"C:\Windows\Fonts\segoeuib.ttf", 43)
font_sub = ImageFont.truetype(r"C:\Windows\Fonts\segoeui.ttf", 27)

scenes = [
    (0, 9, "01_inicio.png", "YHWH", "Yud • Hei • Vav • Hei"),
    (9, 22, "01_inicio.png", "BIENVENIDOS", "Descubrí las raíces hebreas de tu fe"),
    (22, 34, "02_quienes_somos.png", "QUIÉNES SOMOS", "Una comunidad de buscadores"),
    (34, 47, "03_torah_viviente.png", "TORAH VIVIENTE", "Fuentes textuales y estudio en tu dispositivo"),
    (47, 59, "04_calendario.png", "CALENDARIO LUNISOLAR", "Fiestas y tiempos señalados"),
    (59, 72, "05_parashot.png", "PARASHOT", "Las porciones semanales"),
    (72, 84, "06_ensenanzas.png", "ENSEÑANZAS", "Contexto, reflexión y vida cotidiana"),
    (84, 96, "07_semillas.png", "SEMILLAS DE TORAH", "Contenido para niños y familias"),
    (96, 99, "08_testimonios.png", "TESTIMONIOS", "Experiencias de la comunidad"),
    (99, 102, "09_comunidad.png", "COMUNIDAD", "Personas que comparten el camino"),
    (102, 106, "10_novedades.png", "NOVEDADES", "Publicaciones para seguir aprendiendo"),
    (106, 109, "11_contacto.png", "CONTACTO", "Tu mensaje también es parte"),
    (109, 112, "12_footer.png", "COMENCEMOS", "www.hablemosdeyhwh.com"),
]

cache = {p.name: Image.open(p).convert("RGB") for p in SHOTS.glob("*.png")}

def find_scene(t):
    for idx, s in enumerate(scenes):
        if s[0] <= t < s[1]:
            return idx, s
    return len(scenes) - 1, scenes[-1]

def styled_frame(scene, progress):
    start, end, filename, title, subtitle = scene
    src = cache[filename]
    # Zoom muy leve dentro de cada captura real, manteniendo visible la sección completa.
    z = 1.0 + 0.035 * progress
    cw, ch = int(W / z), int(H / z)
    x = max(0, (W - cw) // 2)
    y = max(0, int((H - ch) * (0.25 + 0.5 * progress)))
    frame = src.crop((x, y, x + cw, y + ch)).resize((W, H), Image.Resampling.LANCZOS)
    frame = ImageEnhance.Contrast(frame).enhance(1.04)
    draw = ImageDraw.Draw(frame, "RGBA")
    draw.rounded_rectangle((70, 790, 1410, 1015), radius=25, fill=(7, 13, 22, 214), outline=(212, 168, 83, 205), width=3)
    draw.text((118, 827), title, font=font_bold, fill=(255, 255, 255, 255))
    draw.text((118, 899), subtitle, font=font_sub, fill=(235, 207, 151, 255))
    draw.text((118, 955), "HABLEMOS DE YHWH", font=font_sub, fill=(205, 215, 224, 255))
    # Cursor visible, con movimiento corto sobre el contenido.
    cx, cy = int(1510 + 90 * progress), int(430 + 110 * progress)
    draw.ellipse((cx-28, cy-28, cx+28, cy+28), outline=(212,168,83,150), width=4)
    draw.ellipse((cx-12, cy-12, cx+12, cy+12), fill=(255,255,255,230), outline=(20,20,20,190), width=3)
    return frame

ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()
silent = ROOT / "recorrido_real_sin_audio.mp4"
proc = subprocess.Popen([
    ffmpeg, "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
    "-an", "-c:v", "libx264", "-preset", "veryfast", "-crf", "19", "-pix_fmt", "yuv420p", str(silent)
], stdin=subprocess.PIPE)

for n in range(DURATION * FPS):
    t = n / FPS
    idx, scene = find_scene(t)
    start, end, *_ = scene
    p = max(0, min(1, (t - start) / (end - start)))
    frame = styled_frame(scene, p)
    # Fundido breve entre capturas, para que el cambio de sección sea evidente y suave.
    transition = 0.55
    if p > 1 - transition / (end - start) and idx + 1 < len(scenes):
        q = (p - (1 - transition / (end - start))) / (transition / (end - start))
        frame = Image.blend(frame, styled_frame(scenes[idx + 1], 0), q)
    proc.stdin.write(frame.tobytes())

proc.stdin.close()
if proc.wait() != 0:
    raise SystemExit("Falló el render visual")

audio = ROOT / "narracion_mejorada.wav"
final = ROOT / "Hablemos-de-YHWH-recorrido-real.mp4"
filter_complex = (
    "sine=frequency=174:sample_rate=44100:duration=112,volume=0.012[a];"
    "sine=frequency=261.63:sample_rate=44100:duration=112,volume=0.006[b];"
    "[a][b]amix=inputs=2,afade=t=in:st=0:d=3,afade=t=out:st=108:d=4[bed];"
    "[1:a]aresample=44100[voice];[voice][bed]amix=inputs=2:duration=longest:weights='1 0.6'[mix]"
)
subprocess.run([
    ffmpeg, "-y", "-i", str(silent), "-i", str(audio), "-filter_complex", filter_complex,
    "-map", "0:v", "-map", "[mix]", "-c:v", "copy", "-c:a", "aac", "-b:a", "160k",
    "-t", str(DURATION), "-movflags", "+faststart", str(final)
], check=True)
print(final)
