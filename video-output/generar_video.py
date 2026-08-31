from pathlib import Path
import subprocess
import sys

ROOT = Path(r"C:\xampp\htdocs\HablemosdeYHWH-2026\video-output")
sys.path.insert(0, str(ROOT / "pydeps"))
import imageio_ffmpeg
from PIL import Image, ImageDraw, ImageFont, ImageEnhance

W, H, FPS, DURATION = 1920, 1080, 30, 90
source = Image.open(ROOT / "fullpage.png").convert("RGB")
sw, sh = source.size

font_paths = [
    Path(r"C:\Windows\Fonts\segoeuib.ttf"),
    Path(r"C:\Windows\Fonts\arialbd.ttf"),
]
font = ImageFont.truetype(str(next(p for p in font_paths if p.exists())), 46)
small = ImageFont.truetype(str(next(p for p in font_paths if p.exists())), 27)

scenes = [
    (0, 10, 0.00, 0.08, "DESCUBRÍ LAS RAÍCES HEBREAS DE TU FE", "Hablemos de YHWH"),
    (10, 22, 0.08, 0.19, "UNA COMUNIDAD DE BUSCADORES", "Fe, conciencia y compromiso"),
    (22, 35, 0.19, 0.35, "CALENDARIO LUNISOLAR BÍBLICO", "Los tiempos señalados"),
    (35, 48, 0.35, 0.55, "PARASHOT Y ENSEÑANZAS", "Estudiar, comprender y vivir"),
    (48, 60, 0.55, 0.72, "SEMILLAS DE TORAH", "Un espacio para niños y familias"),
    (60, 75, 0.12, 0.27, "TORAH VIVIENTE", "Las Escrituras también en tu dispositivo"),
    (75, 90, 0.78, 1.00, "HABLEMOS DE YHWH", "Caucete, San Juan, Argentina  •  hablemosdeyhwh.com"),
]

def scene_for(t):
    for item in scenes:
        if item[0] <= t < item[1]:
            return item
    return scenes[-1]

ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()
silent = ROOT / "video_sin_audio.mp4"
cmd = [ffmpeg, "-y", "-f", "rawvideo", "-vcodec", "rawvideo", "-pix_fmt", "rgb24",
       "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-", "-an", "-c:v", "libx264",
       "-preset", "medium", "-crf", "20", "-pix_fmt", "yuv420p", str(silent)]
proc = subprocess.Popen(cmd, stdin=subprocess.PIPE)

for n in range(DURATION * FPS):
    t = n / FPS
    start, end, y0, y1, title, subtitle = scene_for(t)
    p = (t - start) / max(end - start, 0.001)
    ease = p * p * (3 - 2 * p)
    max_y = max(0, sh - H)
    y = int((y0 + (y1 - y0) * ease) * max_y)
    frame = source.crop((0, y, min(sw, W), min(y + H, sh)))
    if frame.size != (W, H):
        canvas = Image.new("RGB", (W, H), "black")
        canvas.paste(frame, (0, 0))
        frame = canvas
    frame = ImageEnhance.Contrast(frame).enhance(1.03)
    draw = ImageDraw.Draw(frame, "RGBA")
    box_y = 790
    draw.rounded_rectangle((110, box_y, 1810, 1015), radius=28, fill=(8, 15, 25, 205), outline=(212, 168, 83, 190), width=3)
    draw.text((165, box_y + 38), title, font=font, fill=(255, 255, 255, 255))
    draw.text((165, box_y + 113), subtitle, font=small, fill=(235, 207, 151, 255))
    draw.text((165, box_y + 163), "hablemosdeyhwh.com", font=small, fill=(205, 213, 220, 255))
    proc.stdin.write(frame.tobytes())

proc.stdin.close()
if proc.wait() != 0:
    raise SystemExit("Falló la codificación del video")

audio = ROOT / "narracion.wav"
final = ROOT / "Hablemos-de-YHWH-recorrido-90s.mp4"
subprocess.run([ffmpeg, "-y", "-i", str(silent), "-i", str(audio), "-c:v", "copy",
                "-c:a", "aac", "-b:a", "192k", "-af", "apad", "-t", str(DURATION),
                "-movflags", "+faststart", str(final)], check=True)
print(final)
