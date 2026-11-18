# IRONKIN website v5: "Earn your Iron" (burgundy, black, cream, gold)

The MotionSites "Penthouse Rain" hero layout, rebuilt with IRONKIN's own scene and identity. No build step.

## Run it

Double-click `start-site-v5.bat` in `03-website`, or:

```bash
python -m http.server 4176 --directory 03-website/site-v5
```

Then open http://localhost:4176.

## The hero

1. **Doors**: burgundy lacquer doors with a gold seam. The gold split-anvil sits across the seam and splits along its crack as the doors open.
2. **Scene**: a rainy rooftop over Cairo at night (Nile, Cairo Tower), pushed in softly from a blur.
3. **"Earn your Iron"**: the giant word sits behind the athlete; his head covers the lower part of the letters. The word is sized and placed in `layout()` in `assets/v5.js` (`HEAD` is where his head starts in the image, `OVERLAP` how much of the letters it covers).
4. **The athlete** rises into frame, overshoots a touch and settles. He wears the Signature Hoodie with the IRONKIN back print.
5. **Rain** is drawn live on a canvas (gold and cream streaks). The layers shift slightly with the mouse.
6. Phones: the main links move to a glass bar at the bottom of the screen so the sky stays free for the word.
7. Reduced motion: no doors and no rain; the final frame shows at once.

Below the hero: Collection 001 (turn a piece to see the back, choose a size, add to bag), Our story, Talk to us, footer.

## Images

`media/layer-plate*.webp` (the scene without the athlete) and `media/layer-man*.webp` (the athlete, transparent) were generated with Higgsfield Nano Banana 2.1 from the hoodie's back photo: one scene, then the same scene with the athlete removed. The athlete was cut out locally, and his hands and reflection were added back from the difference between the two images. `-sm` versions are used on phones.

## Before launch

- "Email IRONKIN" points to a placeholder address (`hello@ironkin.example`) in `index.html`.
- Prices: `KIT` in `assets/v5.js` (`price: null` shows "Price at launch").
