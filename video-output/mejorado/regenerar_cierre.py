import asyncio
import sys
from pathlib import Path

ROOT = Path(r"C:\xampp\htdocs\HablemosdeYHWH-2026\video-output\mejorado")
sys.path.insert(0, str(ROOT.parent / "pydeps"))
import edge_tts

async def main():
    text = ("Te invitamos a recorrer: doble ve, doble ve, doble ve, punto, "
            "Hablemos de Iúd, Jéi, Vav, Jéi, punto com. Comencemos.")
    output = ROOT / "voz_argentina" / "13.mp3"
    voice = edge_tts.Communicate(text, "es-AR-TomasNeural", rate="-4%", pitch="-8Hz", volume="+0%")
    await voice.save(str(output))
    print(output)

asyncio.run(main())
