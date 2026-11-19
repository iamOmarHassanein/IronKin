# IRONKIN website v4: "Train in it" (black, burgundy, citrus lemon)

A one-page site that opens on a film of the collection in the gym. No build step.

## Run it

Double-click `start-site-v4.bat` in `03-website`, or:

```bash
python -m http.server 4175 --directory 03-website/site-v4
```

Then open http://localhost:4175.

## What is on the page

1. **Film hero**: the film plays full screen, muted, on a loop. As you scroll it shrinks into a framed panel and "Five pieces. Three disciplines. One kin." comes in on burgundy. Phones get a portrait cut. A pause button sits bottom left; with reduced motion turned on, the film starts paused.
2. **Ticker**: a tilted lemon band that runs with your scroll.
3. **The kit**: five cards. Turn a piece to see the back, pick a size, add to bag. Cards tilt slightly toward the pointer.
4. **Disciplines**: Strength, Jiu-Jitsu, Padel as big outlined rows. On a computer the athlete photo follows your pointer; on a phone the photos sit in the rows. Each row jumps to its piece.
5. **Numbers**: 001 / 5 / 3 / 1 count up on a lemon strip.
6. **Story**, then a footer with the wordmark in lemon.
7. **Bag**: kept in this browser only. Checkout opens with the live store.

## The film

`media/hero-film.mp4` is a 5-second Kling 3.0 clip (Higgsfield, image-to-video from the gym photo `c-strength.webp`), cut into a seamless 4.3-second loop: the last 0.8 s dissolves into the start. Phones show its centre crop. `hero-film-poster.webp` is its first frame and shows while it loads. To replace it, keep the same file names, keep it muted and under about 4 MB.

## Edit

- Products, sizes, prices: `KIT` at the top of `assets/v4.js` (`price: null` shows "Price at launch").
- Colours and fonts: the tokens at the top of `assets/v4.css` (Anton, Barlow Condensed, Barlow).
