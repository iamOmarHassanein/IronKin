# IRONKIN website, version 04 (The Vault)

Identity v6. You open on a closed garage shutter. Scrolling rolls it up, the camera walks into the vault and glides along the rail, stopping at each of the five Collection 001 pieces with its spec panel. The pieces are real cut-out layers that swing from their hangers when you hover, with the bracket cursor and a label; click one to walk to it. After the vault: the manifesto, the collection cards, "The build" (sketch-to-sample track, blueprint x-ray archive, fabric swatches), the vaults (doors open on hover) and the Kin Register.

Built with Vite + React, Tailwind v4 + shadcn/ui (bag sheet), GSAP ScrollTrigger (one pinned timeline for the shutter, walk-in and rail), Lenis, anime.js (04:59 to 05:00 preloader), Motion (card tilt) and React Bits (`src/bits/`, MIT + Commons Clause: TargetCursor, ScrollReveal, ScrollVelocity, DecryptedText, Magnet).

## Run it

Double-click `../start-version-04.bat` (installs once, opens http://localhost:5184), or `npm install` then `npm run dev -- --port 5184`.

## Where things are

- Camera stops: `RAIL` in `src/App.jsx` (garment centres in `vault-inside.webp` pixels). Cut-out boxes: `GAR`.
- Images: `public/assets/` (vault renders, garment cut-outs `g-XX.webp` + shadows, `vault-inside-empty.webp`), `public/assets/build/` (blueprints, colour flats, tech pack pages, swatches).
- "The build": `src/Build.jsx` + `src/build.css`.

## Not connected yet

The bag and checkout are front-end only (nothing is sent or charged); prices are not set; the vault cities and 05:00 to 08:00 hours are placeholders; the swatches are generated textures, not fabric photos; the renders are AI images.
