# IRONKIN website v3 (burgundy, cream, black)

A one-page site built from two MotionSites designs (Clothing Rail and Peculiar Atelier), redone with IRONKIN's own garments, logo and photos. No build step.

## Run it

Double-click `start-site-v3.bat` in `03-website`, or:

```bash
python -m http.server 4174 --directory 03-website/site-v3
```

Then open http://localhost:4174.

## What is on the page

1. **Flag hero**: a burgundy IRONKIN flag simulated in real time (WebGL). Grab it and pull it; it falls back and settles. The flag artwork is drawn from the brand marks in `brand/`, so it always matches the logo. Without WebGL, a still image of the flag shows instead.
2. **Band**: scrolling wine-coloured strip.
3. **The rail**: ten pieces (front and back of each garment) hang edge-on on a brass rail. Point at one (or swipe on a phone) to turn it to face you. Click it (tap twice on a phone) to lift it off the rail: size, Add to bag, previous and next, Close. Keyboard: arrows, Enter, Escape.
   - **Motion is physical, not keyframed.** Each hanger has a spring for its place and its turn (a soft overshoot as it faces you) and a pendulum that swings when its hook moves, when the whole rail glides, or when the pointer brushes past. The garment body trails the swing slightly like cloth.
   - **Light on the fabric.** A shading layer, masked to each garment's own outline, darkens the piece as it turns away, moves a soft highlight across it, and adds the hanger's shadow on the shoulders and weight at the hem.
   - The lifted piece keeps hanging: it sways as it arrives and turns a little toward the pointer.
   - With reduced motion turned on, everything jumps straight to rest.
4. **Disciplines**: Strength, Jiu-Jitsu, Padel. The wide photo reveals and drifts on scroll; each tile lifts its piece on the rail.
5. **Story**: the words light up as you scroll.
6. **Bag**: kept in this browser only. Checkout opens with the live store.

## Edit

- Products, sizes and prices: `PRODUCTS` and `ITEMS` at the top of `assets/v3.js` (`price: null` shows "Price at launch").
- Colours and fonts: the tokens at the top of `assets/v3.css`.
- How the hangers move: the `SP`, `GRAV`, `SWING_DAMP` and `COUPLE` settings in the rail physics block of `assets/v3.js`.
- Flag artwork and how the cloth moves: `assets/cloth.js` (`drawFlag` and the `S` settings).
- Images in `media/` are copies of the v2 site's images.
