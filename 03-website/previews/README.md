# IRONKIN site versions: where everything is

Every version is on GitHub (`iamOmarHassanein/IronKin`), each on its own branch. None is merged into `main` yet; merging needs the owner's approval.

| Version | Branch | Folder | Local address | What it is |
|---|---|---|---|---|
| v1 | `main` | `03-website/site` | http://localhost:4172 | The current live site |
| v2 | `feat/site-v2` | `03-website/site` | http://localhost:4173 | Athlete opening screen, then Collection 001 on the hanger rail |
| v3 | `feat/site-v3` | `03-website/site-v3` | http://localhost:4174 | Grab-able cloth flag, physical hanger rail, lift-off detail (burgundy, cream, black) |
| v4 | `feat/site-v4` | `03-website/site-v4` | http://localhost:4175 | "Train in it": Kling gym film hero, citrus lemon |
| v5 | `feat/site-v5` | `03-website/site-v5` | http://localhost:4176 | "Earn your Iron": doors, model plants the flag (Kling film), giant word behind him, rain (gold) |
| v6 | `feat/site-v6` | `03-website/site-v6` | http://localhost:4177 | "The Rite": red-light editorial version |

Hub page linking them all: http://localhost:4170

## Run them all

Double-click `start-all-sites.bat` in this folder. The first time, it checks out each branch side by side into `IronKin-previews` next to the repo (git worktrees, so your main checkout is untouched). After that it pulls updates, starts all seven servers and opens the hub. Needs Git and Python.

## Other work in progress

- `feat/founders-teaser`: founders teaser video script, edit and voice-mix scripts (`07-content/teasers/`). The video files are kept locally, not on GitHub (the repo ignores `.mp4` except website media).
- Each site folder has its own `README.md` explaining how it is built and what to edit.
