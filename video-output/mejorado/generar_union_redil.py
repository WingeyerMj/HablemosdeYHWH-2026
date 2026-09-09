import asyncio
import sys
from pathlib import Path

ROOT = Path(r"C:\xampp\htdocs\HablemosdeYHWH-2026\video-output\mejorado")
sys.path.insert(0, str(ROOT.parent / "pydeps"))
import edge_tts

async def main():
    text = (
        "En Quiénes somos vas a conocer el propósito de la comunidad y esta nueva etapa junto a la congregación mesiánica "
        "El Redil de Yeshúa: un espacio de comunión, restauración y estudio fiel de la Torá y las Sagradas Escrituras."
    )
    output = ROOT / "voz_argentina" / "03.mp3"
    voice = edge_tts.Communicate(text, "es-AR-TomasNeural", rate="-4%", pitch="-8Hz", volume="+0%")
    await voice.save(str(output))
    print(output)

asyncio.run(main())
