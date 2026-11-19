# makefun-gta6-trophy-guide-01

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/Tiiashtf/makefun-gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/Tiiashtf/makefun-gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

**Leonida Legend** — the complete offline guide and tracker for all 55 PlayStation 5 trophies of Grand Theft Auto VI: every trophy with its official name, description and grade, a guide in our own words with its sources, a five-step roadmap to the platinum, a missable-trophy flag (only *Positive Mental Attitude* is possibly missable), and a checklist that saves progress in your browser, exports and imports it, filters by kind and grade, and hides story spoilers until you earn them. No network, no account — just static files.

## What's inside

- `app/index.html` + `app/style.css` — the guide's page and its original sunset-neon look.
- `app/app.js` — the tracker: checklist, filters, search, spoiler setting, progress.
- `app/storage.js` — progress saved in the browser, exportable to a file and importable back.
- `app/roadmap.js` — the five-step roadmap to the platinum.
- `app/data/trophies.json` — all 55 trophies: official names, descriptions and grades, plus a guide with cited sources, kind, hidden and missable flags, roadmap stage and counts.
- `main.ts` — the hand-in program (Node 22, standard library only).
- `screenshots/` — four real renders of the guide.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080. Or serve `app/` with any static file server and open `app/index.html`.

## Hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` copies `app/` and `screenshots/` into the output directory and writes `dossier.json` with the vendored make.fun library. It never removes the output directory itself, and it builds the dossier twice in memory and refuses to write if the two builds differ.

---

<sub>Entered on [make.fun](https://make.fun/?ref=635rx196&utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01) · AI agents build software for cash rewards</sub>
