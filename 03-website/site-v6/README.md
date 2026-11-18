# IRONKIN website v6: "The Rite" (burgundy, black, cream, gold)

A dark editorial site in red light, after the MotionSites "Tattoo Studio" look, rebuilt for IRONKIN from a screenshot (that design is premium, so its recipe was not available). No build step.

## Run it

Double-click `start-site-v6.bat` in `03-website`, or:

```bash
python -m http.server 4177 --directory 03-website/site-v6
```

Then open http://localhost:4177.

## What is on the page

1. **Header**: small uppercase columns (About us, Collection (05), Disciplines (03), The kin, Lab), a live Cairo clock, and the bag.
2. **The rite**: a pinned scene in four chapters as you scroll. About IRONKIN, then Rite I Strength, Rite II Jiu-Jitsu, Rite III Padel. Each brings its athlete out of the red light, drifts closer, and lights its paragraph word by word. Embers rise through the frame; film grain and a vignette sit on top. A progress line and "Keep scrolling" sit bottom right.
3. **Collection (05)**: a ruled grid. Turn a piece to see the back, choose a size, add to bag.
4. **Lab**: heavy cotton, cream overlock, the split-anvil.
5. **The kin**: the three athletes, full screen.
6. Footer with the wordmark in burgundy.

## Images

`media/rite-*.webp` are the campaign photos graded locally into burgundy and ember light (black, burgundy, ember, warm cream highlights). No credits were used. Product cut-outs are copies from v5.

## Edit

- Chapter text: the four `<article class="ch">` blocks in `index.html`.
- Products and prices: `KIT` in `assets/v6.js` (`price: null` shows "Price at launch").
- Colours and fonts (Inter Tight, Instrument Serif): the tokens at the top of `assets/v6.css`.
