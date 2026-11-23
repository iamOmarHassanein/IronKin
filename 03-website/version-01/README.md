# IRONKIN website, version 01 (identity v6)

Premium one-page site for Collection 001 in the v6 identity: giant type behind the model, FRG codes with the red dot, the Forge Grade, steel-stamped drop plates and the Forge Floor.

Built with Vite + React, [GSAP](https://github.com/greensock/GSAP) (ScrollTrigger, SplitText), [Lenis](https://github.com/darkroomengineering/lenis) smooth scroll, and components from [React Bits](https://github.com/DavidHDev/react-bits) in `src/bits/` (MIT + Commons Clause).

## Run it

Double-click `../start-version-01.bat`, or:

```bash
npm install
npm run dev -- --port 5180
```

Then open http://localhost:5180. Build with `npm run build` (output in `dist/`).

## Sections

Hero, marquee, manifesto, the Forge Floor (pinned, live countdown to 12.12.26 20:00 Cairo), Collection 001 catalogue, spec sheet (pinned callouts), sessions (horizontal scroll), the Kin (number sign-up), footer.

## Not connected yet

- The Kin email form is front-end only; nothing is sent.
- Bag is a label, not a cart.
- Photos are AI stand-ins until the real shoot; drop date, cities and Forge Grades are placeholders.

## Latest update

- Opening animation (anime.js preloader, brought over from version 02).
- "The build" section after Spec: a pinned sketch-to-sample track for the hoodie (sketch, blueprint with measurements from the spec, tech pack, fabric, sample), a blueprint x-ray archive (hover shows the colour flat) and a fabric swatch library. Images in `public/assets/build/`.
