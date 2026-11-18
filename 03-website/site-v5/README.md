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
2. **Opening film** (`media/intro-film.mp4`, 10 s): the model faces the camera holding the IRONKIN flag, walks to the gold stand, plants the flag, walks back to the railing and looks out over Cairo. On screens narrower than the scene, the view follows him across the frame in step with the film (`TRACK` in `assets/v5.js`). A **Skip intro** button sits bottom right.
3. **Hand-off**: the film's last frame is the layered scene, so it dissolves into the layers without a jump.
4. **"Earn your Iron"**: the giant word rises in behind the athlete; his head covers the lower part of the letters. The word is sized and placed in `layout()` (`HEAD` is where his head starts in the image, `OVERLAP` how much of the letters it covers).
5. **Rain** is drawn live on a canvas (gold and cream streaks). The layers shift slightly with the mouse.
6. Phones: the main links move to a glass bar at the bottom of the screen so the sky stays free for the word.
7. Reduced motion, or if the film cannot play: no film, no doors and no rain; the final frame shows at once.

Below the hero: Collection 001 (turn a piece to see the back, choose a size, add to bag), Our story, Talk to us, footer.

## Images and film

All generated with Higgsfield from IRONKIN's own references (the model's 9-angle face sheet, the hoodie front and back photos, and the flag photo):

- Start frame: the model facing the camera with the flag (Nano Banana 2.1).
- End frame: the model from behind at the railing, the flag on its stand (Nano Banana 2.1). This is the hero scene.
- `media/layer-plate*.webp`: the end frame with the model removed (Nano Banana 2.1).
- `media/layer-man*.webp`: the model cut out of the end frame locally; his hands on the rail come from the difference between the two images.
- `media/intro-film.mp4`: Kling 3.0, 10 s, from the start frame to the end frame. `intro-film-poster.webp` is its first frame.

`-sm` versions are used on phones. The model's likeness is used with his permission (confirm before launch).

## Before launch

- "Email IRONKIN" points to a placeholder address (`hello@ironkin.example`) in `index.html`.
- Prices: `KIT` in `assets/v5.js` (`price: null` shows "Price at launch").
