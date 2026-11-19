# IRONKIN site versions: where everything is

All versions are merged into `main` (`iamOmarHassanein/IronKin`), each in its own folder, so one checkout of `main` has everything.

| Version | Folder | Local address | What it is |
|---|---|---|---|
| v2 | `03-website/site` | http://localhost:4173 | Athlete opening screen, then Collection 001 on the hanger rail (the main site folder) |
| v3 | `03-website/site-v3` | http://localhost:4174 | Grab-able cloth flag, physical hanger rail, lift-off detail (burgundy, cream, black) |
| v4 | `03-website/site-v4` | http://localhost:4175 | "Train in it": Kling gym film hero, citrus lemon |
| v5 | `03-website/site-v5` | http://localhost:4176 | "Earn your Iron": doors, model plants the flag (Kling film), giant word behind him, rain (gold) |
| v6 | `03-website/site-v6` | http://localhost:4177 | "The Rite": red-light editorial version |

Hub page linking them all: http://localhost:4170

The original site from before v2 (v1) was replaced in `03-website/site` by v2. It is still in git history: `git checkout d07a55f -- 03-website/site` brings it back.

## Run them all

Double-click `start-all-sites.bat` in this folder. It starts the hub and one server per version straight from this checkout and opens the hub. Needs Python.

## Also in main

- `07-content/teasers/`: the founders teaser script, edit and voice-mix scripts. The video files are kept locally, not on GitHub (the repo ignores `.mp4` except website media).
- Each site folder has its own `README.md` explaining how it is built and what to edit.
