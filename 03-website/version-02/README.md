# IRONKIN website, version 02 (night edition)

A second, darker take on the v6 identity: an inset cinematic hero with crossfading session photos, a colour-changing Collection 001 carousel with quick view and a working demo bag, a Film 001 storyboard player, the Forge Grade explainer and Kin sign-up.

Built with Vite + React, Tailwind CSS v4 and [shadcn/ui](https://github.com/shadcn-ui/ui) (sheet, dialog, tabs, accordion, toggle group, input, badge, toast), [anime.js](https://github.com/juliangarnier/anime) v4 (preloader anvil draw, headline, grade bars, film timeline, scroll observers), [Motion](https://github.com/motiondivision/motion) (crossfades, layout transitions, colour changes) and Lenis smooth scroll. Layout and motion rules follow the [MotionSites web-builder skill](https://github.com/Motionsites-AI/claude-skill).

## Run it

Double-click `../start-version-02.bat`, or:

```bash
npm install
npm run dev -- --port 5182
```

Then open http://localhost:5182. Build with `npm run build`.

## Film 001

`film/FILM-001_the-six-oclock.md` is the prompt package for a 30-second painterly brand film ("The Six O'Clock"), written with the animated-short-film skill: story, beat table and six plate prompts. The site plays an animated storyboard of the beats with campaign photos as stand-ins until the film is rendered.

## Not connected yet

- The bag and "Reserve for the drop" are front-end only; there is no checkout.
- The Kin form shows a demo number; nothing is sent.
- Photos are AI stand-ins; drop date and Forge Grades are placeholders.
