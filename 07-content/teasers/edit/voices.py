# Placeholder voices for the founders teaser (Egyptian Arabic, Microsoft Shakir neural voice),
# one pitch and pace per founder so the three sound different. Real founder recordings replace these.
import asyncio, sys, os
import edge_tts

out = sys.argv[1]
V = "ar-EG-ShakirNeural"
LINES = [
    ("omar-hi", "أهلاً.", "+0Hz", "-5%"),
    ("omar-line", "إحنا مش براند.", "+0Hz", "-12%"),
    ("nour-hi", "أهلاً.", "-14Hz", "-8%"),
    ("nour-line", "إحنا عيلة.", "-14Hz", "-15%"),
    ("ahmed-hi", "أهلاً.", "+8Hz", "+0%"),
    ("ahmed-line", "قريب... جداً.", "+8Hz", "-20%"),
]

async def main():
    for name, text, pitch, rate in LINES:
        await edge_tts.Communicate(text, V, pitch=pitch, rate=rate).save(os.path.join(out, name + ".mp3"))
        print("ok", name)

asyncio.run(main())
