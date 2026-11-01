# IronKin

IronKin is a gym fashion brand built and run from this repo, from first sketch to paid scale.
This is a new brand. Do not reuse names, positioning, colors or assets from Washly, `Desktop/Brand` or `Desktop/Clothes Gym Startup` unless the owner asks.

**Source of truth:** [01-brand/brand-brief.md](01-brand/brand-brief.md). Read it before any brand-facing work. Anything marked TBD is undecided: ask, do not invent it.

## Workstreams and skills

Find the task below, use the listed skills and agent, and save the output in that folder.

| Folder | Covers | Skills | Agent |
|---|---|---|---|
| `01-brand/` | Positioning, audience, naming, visual identity, voice | `ui-ux-pro-max:brand`, `ui-ux-pro-max:design-system`, `marketing-skills:product-marketing`, `marketing-skills:customer-research`, `marketing-skills:competitors`, `marketing-skills:competitor-profiling` | `marketer` |
| `02-product/` | Tech packs, BOMs, size specs, samples, suppliers | `anthropic-skills:xlsx`, `anthropic-skills:pdf`, `anthropic-skills:canvas-design`, `marketing-skills:pricing` | none |
| `03-website/` | Store, landing pages, checkout, SEO | `brand-landingpage:brand-landingpage`, `ecom-landing-pages`, `ui-ux-pro-max:ui-ux-pro-max`, `marketing-skills:cro`, `marketing-skills:seo-audit`, `marketing-skills:schema`, all `shopify-*` skills, `payment-processing:stripe-integration` | `web-developer` |
| `04-tracking/` | Pixels, server events, UTMs, KPIs, dashboards | `marketing-skills:analytics`, `business-analytics:kpi-dashboard-design`, `business-analytics:data-storytelling`, `dataviz` | `web-developer` |
| `05-ads/` | Campaign structure, creative testing, offers, ad control | `marketing-skills:ads`, `marketing-skills:ad-creative`, `marketing-skills:ab-testing`, `marketing-skills:offers`, `marketing-skills:marketing-psychology` | `marketer` |
| `06-video-ai/` | Higgsfield image and video generation, editing | Higgsfield connector, `video-editing`, `marketing-skills:video`, `marketing-skills:image` | `video-editor` |
| `07-content/` | Scripts, hooks, calendar, organic social, email | `marketing-skills:content-strategy`, `marketing-skills:social`, `marketing-skills:copywriting`, `marketing-skills:copy-editing`, `marketing-skills:emails`, `social-publishing:social-publishing` | `content-strategist` |
| `08-media-buying/` | Media buyer hiring, briefs, SOPs, reporting | `marketing-skills:ads`, `marketing-skills:marketing-plan`, `business-analytics:data-storytelling` | `marketer` |
| `09-ugc/` | Creator sourcing, UGC briefs, shoot plans, usage rights | `marketing-skills:ad-creative`, `marketing-skills:video`, `marketing-skills:community-marketing` | `content-strategist` |
| `10-ops/` | Launch plan, roadmap, decisions, finances | `marketing-skills:launch`, `marketing-skills:marketing-plan`, `anthropic-skills:xlsx` | `marketer` |

For anything new or creative, start with `superpowers:brainstorming`. For plans with several steps, use `superpowers:writing-plans`.

## Working rules

- Generating with Higgsfield costs credits. Quote the cost and get approval before batches.
- Changing live ads, budgets, the live store, or publishing anything needs the owner's approval each time.
- Never commit secrets, API keys or customer data. Keys go in `.env`, which git ignores.
- Keep raw footage and large renders out of git. Commit briefs, prompts and links to the files.
- Record decisions that affect more than one workstream in `10-ops/decisions.md`.

## Skills in this repo

- `.claude/settings.json` turns on the owner's 11 plugins for this project.
- `.claude/skills/` holds copies of the owner's personal skills, so cloud sessions and other machines have them. `ats-resume-optimizer` is left out because it is for job applications.
- `.claude/agents/` holds IronKin versions of the owner's four agents.
