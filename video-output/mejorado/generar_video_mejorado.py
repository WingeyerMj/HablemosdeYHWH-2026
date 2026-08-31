from pathlib import Path
import subprocess
import sys
from PIL import Image, ImageDraw, ImageFont, ImageEnhance, ImageFilter

BASE = Path(r"C:\xampp\htdocs\HablemosdeYHWH-2026\video-output")
ROOT = BASE / "mejorado"
sys.path.insert(0, str(BASE / "pydeps"))
import imageio_ffmpeg

W, H, FPS, DURATION = 1920, 1080, 24, 112
source = Image.open(ROOT / "web-publica.png").convert("RGB")
sw, sh = source.size
font_bold = ImageFont.truetype(r"C:\Windows\Fonts\segoeuib.ttf", 48)
font_sub = ImageFont.truetype(r"C:\Windows\Fonts\segoeui.ttf", 28)
font_brand = ImageFont.truetype(r"C:\Windows\Fonts\segoeuib.ttf", 31)

# Tiempo, posición vertical aproximada de la sección y rótulos.
scenes = [
    (0, 9, 0.000, 0.035, "YHWH", "Yud • Hei • Vav • Hei"),
    (9, 22, 0.030, 0.115, "BIENVENIDOS", "Raíces hebreas de nuestra fe"),
    (22, 34, 0.100, 0.200, "QUIÉNES SOMOS", "Una comunidad de buscadores"),
    (34, 47, 0.160, 0.285, "TORAH VIVIENTE", "Estudio y fuentes textuales en tu dispositivo"),
    (47, 59, 0.260, 0.390, "CALENDARIO LUNISOLAR", "Fiestas y tiempos señalados"),
    (59, 72, 0.380, 0.540, "PARASHOT", "Las porciones semanales, paso a paso"),
    (72, 84, 0.520, 0.650, "ENSEÑANZAS", "Contexto, reflexión y vida cotidiana"),
    (84, 96, 0.630, 0.755, "SEMILLAS DE TORAH", "Contenido para niños y familias"),
    (96, 104, 0.750, 0.890, "COMUNIDAD", "Identidad, testimonios y novedades"),
    (104, 112, 0.880, 1.000, "COMENCEMOS", "www.hablemosdeyhwh.com"),
]

def current_scene(t):
    return next((s for s in scenes if s[0] <= t < s[1]), scenes[-1])

ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()
silent = ROOT / "video_mejorado_sin_audio.mp4"
cmd = [ffmpeg, "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}",
       "-r", str(FPS), "-i", "-", "-an", "-c:v", "libx264", "-preset", "veryfast",
       "-crf", "19", "-pix_fmt", "yuv420p", str(silent)]
proc = subprocess.Popen(cmd, stdin=subprocess.PIPE)

for n in range(DURATION * FPS):
    t = n / FPS
    start, end, y0, y1, title, subtitle = current_scene(t)
    p = min(1, max(0, (t - start) / (end - start)))
    ease = p * p * (3 - 2 * p)
    zoom = 1.0 + 0.045 * ease
    crop_w, crop_h = int(W / zoom), int(H / zoom)
    max_y = max(0, sh - crop_h)
    y = int((y0 + (y1 - y0) * ease) * max_y)
    x = max(0, (sw - crop_w) // 2)
    frame = source.crop((x, y, min(sw, x + crop_w), min(sh, y + crop_h))).resize((W, H), Image.Resampling.LANCZOS)
    frame = ImageEnhance.Contrast(frame).enhance(1.05)

    draw = ImageDraw.Draw(frame, "RGBA")
    fade = min(1.0, p * 4, (1 - p) * 5)
    alpha = int(218 * max(0, fade))
    draw.rounded_rectangle((82, 760, 1420, 1010), radius=26, fill=(7, 13, 22, alpha), outline=(212, 168, 83, alpha), width=3)
    draw.text((128, 804), title, font=font_bold, fill=(255, 255, 255, alpha))
    draw.text((128, 882), subtitle, font=font_sub, fill=(235, 207, 151, alpha))
    draw.text((128, 942), "HABLEMOS DE YHWH", font=font_brand, fill=(205, 215, 224, alpha))

    # Cursor suave para reforzar la sensación de recorrido real.
    cx = int(1500 + 120 * (0.5 - abs(0.5 - p)) * 2)
    cy = int(420 + 130 * ease)
    draw.ellipse((cx-15, cy-15, cx+15, cy+15), fill=(255,255,255,220), outline=(25,25,25,180), width=3)
    draw.ellipse((cx-30, cy-30, cx+30, cy+30), outline=(212,168,83,130), width=4)
    proc.stdin.write(frame.tobytes())

proc.stdin.close()
if proc.wait() != 0:
    raise SystemExit("Falló la codificación visual")

audio = ROOT / "narracion_mejorada.wav"
final = ROOT / "Hablemos-de-YHWH-video-mejorado.mp4"
# Cama ambiental original y muy sutil, creada con tonos suaves; la voz queda al frente.
filter_complex = (
    "sine=frequency=174:sample_rate=44100:duration=112,volume=0.018[a];"
    "sine=frequency=261.63:sample_rate=44100:duration=112,volume=0.010[b];"
    "[a][b]amix=inputs=2,afade=t=in:st=0:d=3,afade=t=out:st=106:d=4[bed];"
    "[1:a]aresample=44100,volume=1.0[voice];[voice][bed]amix=inputs=2:duration=longest:weights='1 0.7'[mix]"
)
subprocess.run([ffmpeg, "-y", "-i", str(silent), "-i", str(audio), "-filter_complex", filter_complex,
                "-map", "0:v", "-map", "[mix]", "-c:v", "copy", "-c:a", "aac", "-b:a", "160k",
                "-t", str(DURATION), "-movflags", "+faststart", str(final)], check=True)
print(final)
