# IRONKIN founders teaser: "Before the reveal"

Fight-week interview style (HBO Sports / UFC Embedded): a dark industrial studio, two cold practical lights behind, one black chair. Shot from the side so we see the **left side** of each founder's face and body. An interviewer sits off camera, never seen.

**Length:** about 27 s (three 8 s shots + a 3 s end card). Vertical cut for Reels/TikTok, wide for YouTube/X.
**Language:** Egyptian Arabic, with English subtitles burned in (like the HBO reference).
**Wardrobe:** all three in the IRONKIN black tee and black trousers. No logo shown yet; the reveal is the next post.

## The script

Each founder walks in from the right, sits, looks into the lens and says hi, then turns to the interviewer and says his line. The three lines are one sentence across three people.

| # | Founder | To camera | To the interviewer | Subtitle |
|---|---|---|---|---|
| 1 | **Omar** | "أهلاً." | "إحنا مش براند." | Hi. / *We're not a brand.* |
| 2 | **Nour** | "أهلاً." | "إحنا عيلة." | Hi. / *We're kin.* |
| 3 | **Ahmed** | "أهلاً." | "قريب… جداً." | Hi. / *Soon. Very soon.* |
| End card | | | | **IRONKIN** · قريباً · COMING SOON |

**Why this line:** "kin" means family, so the teaser says the brand's name without showing it. The full reveal opens where Ahmed stops: *"IRONKIN. Forged by those who train."*

### Alternatives (same structure, swap the lines)
- **B (English):** Omar "We trained together." · Nour "Built it together." · Ahmed "Now it's yours."
- **C (tension):** Omar "They asked why." · Nour "We said wait." · Ahmed "It's time."

## Shots

| Shot | Who | Action (8 s) | Notes |
|---|---|---|---|
| 1 | Omar (short curly fade, beard; athletic build) | 0–3 s walks in from frame right, sits. 3–4.5 s looks into the lens, small nod, "أهلاً". 4.5–8 s turns to the interviewer (frame left), says his line. | Ends on his left profile, as in the reference. |
| 2 | Nour (braided cornrows, fade, beard; heavier build) | Same moves. | Same chair, same light. |
| 3 | Ahmed (rimless glasses, curly hair, beard; slimmer build) | Same moves; a short pause before "جداً". | Hold 0.5 s on his profile, cut to black. |
| 4 | End card | Black, the IRONKIN wordmark fades in, "قريباً · COMING SOON". | Made in editing (no credits). |

## Voices

**Recommended:** the film is generated silent, with the lips moving to the lines, and each founder records his own two lines on his phone (quiet room, 30 seconds each). Real voices make the teaser feel like a real interview, and silent clips cost less. Room tone, a low drone and a cut to black are added in editing.

Alternative: AI voices generated with the clips (more credits, and the voices won't be theirs).

## Made (Higgsfield, 38 credits)

- `ironkin-founders-teaser-wide.mp4` (1280×720) and `ironkin-founders-teaser-vertical.mp4` (720×1280), 22.3 s, silent, with name tags, Arabic + English subtitles and the end card.
- `raw/`: the three Kling 3.0 clips (8 s each), the empty set, and each founder's seated frame (Nano Banana 2.1).
- `edit/`: `edit.py` and `cues.json` rebuild both cuts (subtitle timing, trims, vertical crop). Needs Pillow, arabic-reshaper, python-bidi and imageio-ffmpeg.

The video files stay out of git (the repo ignores raw footage); they live in this folder.

### Voice-over timing (record and lay these in)

| Founder | "أهلاً" at | Line at | Line |
|---|---|---|---|
| Omar | 0:04.3 | 0:05.7 | إحنا مش براند. |
| Nour | 0:10.1 | 0:11.3 | إحنا عيلة. |
| Ahmed | 0:16.2 | 0:17.3 | قريب… جداً. |

Add low room tone and a soft drone under everything, and a single low hit when the end card lands (0:19.2).

## References
- Faces and bodies: the founder sheets in this conversation (Omar: curly fade; Nour: cornrows; Ahmed: glasses).
- Look: the three interview sheets and the HBO frame (side-angle chair shots, dark studio, cold teal practical lights). Option: swap the teal practicals for warm burgundy to match the brand.
