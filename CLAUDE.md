# IronKin

IronKin is a gym fashion brand built and run from this repo, from first sketch to paid scale.
This is a new brand. Do not reuse names, positioning, colors or assets from Washly, `Desktop/Brand` or `Desktop/Clothes Gym Startup` unless the owner asks.

**Source of truth:** [01-brand/brand-brief.md](01-brand/brand-brief.md). Read it before any brand-facing work. Anything marked TBD is undecided: ask, do not invent it.

## Workstreams and skills

Find the task below, use the listed skills and agent, and save the output in that folder. Skill names are the repo copies in `.claude/skills/`, which work on the laptop and in the cloud.

| Folder | Covers | Skills | Team |
|---|---|---|---|
| `01-brand/` | Positioning, audience, naming, visual identity, voice | `brand`, `design`, `design-system`, `product-marketing`, `customer-research`, `competitor-profiling`, `competitors`, `ads-competitor` | `brand-studio` |
| `02-product/` | Tech packs, BOMs, size specs, samples, suppliers | `clothing-shop-studio` (garment intake to factory handoff pack), `pricing`, `xlsx`, `pdf` | `product-team` |
| `03-website/` | Store, landing pages, checkout, SEO | `brand-landingpage`, `ecom-landing-pages`, `frontend-design`, `ui-ux-pro-max`, `cro`, `ads-landing`, `seo-audit`, `schema`, all `shopify-*` skills, `stripe-integration` | `web-team` |
| `04-tracking/` | Pixels, server events, UTMs, KPIs, dashboards | `analytics`, `ads-server-side-tracking`, `ads-attribution`, `kpi-dashboard-design`, `data-storytelling` | `web-team` |
| `05-ads/` | Campaign structure, creative testing, offers, ad control | `ads` (routes to `ads-meta`, `ads-tiktok`, `ads-plan`, `ads-create`, `ads-launch`, `ads-optimize`), `ad-creative`, `ads-creative`, `ads-test`, `ads-math`, `offers` | `ads-team` |
| `06-video-ai/` | Higgsfield image and video, reels editing | Higgsfield connector, `video-editing`, `editing` (routes to `short-editing`, `broll`, `clips`, `steal`, `vox`), `video`, `image` | `production-team` |
| `07-content/` | Scripts, hooks, calendar, organic social, graphics, email | `studio-script`, `outliers`, `content-strategy`, `social`, `copywriting`, `banner-design`, `canvas-design`, `theme-factory`, `emails`, `publish` | `content-team` |
| `08-media-buying/` | Media buyer hiring, briefs, SOPs, budgets, reporting | `ads-plan`, `ads-budget`, `ads-monitor`, `ads-report`, `ads-audit`, `marketing-plan` | `ads-team` |
| `09-ugc/` | Creator sourcing, UGC briefs, photo and video shoots, usage rights | `ads-create` (briefs), `ads-photoshoot` (product photos), `ad-creative`, `video`, `community-marketing` | `production-team` |
| `10-ops/` | Launch plan, roadmap, decisions, finances | `launch`, `marketing-plan`, `xlsx` | owner |

## Brand teams

Six team agents in `.claude/agents/` do the work. The owner is brand director and approves anything that costs money or goes public.

- Give each task to the team that owns its folder in the table above. Work that spans teams is split: for example, a launch needs content-team scripts, production-team shoots, ads-team campaigns and web-team pages.
- Teams hand off to each other through files in their folders, not by redoing each other's work.
- The claude-ads specialist agents (`audit-*`, `copy-writer`, `creative-strategist`, `format-adapter`, `visual-designer` and the rest) work for ads-team.
- The laptop also has the owner's own `marketer`, `content-strategist`, `video-editor` and `web-developer` agents. They are for other projects; do not use them for IronKin.

For anything new or creative, start with `brainstorming`. For plans with several steps, use `writing-plans`.

## Working rules

- Generating with Higgsfield costs credits. Quote the cost and get approval before batches.
- Changing live ads, budgets, the live store, or publishing anything needs the owner's approval each time.
- Never commit secrets, API keys or customer data. Keys go in `.env`, which git ignores.
- Keep raw footage and large renders out of git. Commit briefs, prompts and links to the files.
- Record decisions that affect more than one workstream in `10-ops/decisions.md`.

- Agent notes go in `brain/`. Commit them with the work.

## Cloud sessions

GitHub is the source of truth. This work runs in cloud sessions, so the laptop can be off.

- Plugins do not load in the cloud. Their skills are copied into `.claude/skills/` without the plugin prefix, so `marketing-skills:ads` in the table above is `ads` there. The same applies to every prefixed name, including `superpowers:brainstorming`.
- `anthropic-skills:*` are not in the repo. They come from the skills enabled on the owner's claude.ai account.
- Nothing on the laptop exists in the cloud, including `Desktop` folders and `~/.claude`.
- A cloud session's work is not safe until it is pushed. Push before stopping.
- API keys go in the cloud environment's network secrets, never in the repo.
- `scripts/cloud-setup.sh` installs ffmpeg at session start and does nothing on a laptop.

## Skills in this repo

- `.claude/settings.json` turns on the owner's 11 plugins on the laptop.
- `.claude/skills/` and `.claude/agents/` hold copies for cloud sessions and other machines: the owner's personal skills and agents, plus everything from those plugins. `ats-resume-optimizer` is left out because it is for job applications.
- To refresh the plugin copies, run `node scripts/sync-plugins.mjs` on a machine with the plugins installed. Versions are in `.claude/vendored-plugins.json` and licenses in `.claude/licenses/`.
