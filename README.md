# ArcadeForge

A self-hosted browser arcade with **1,200 playable original game variants**, local multiplayer for up to four players, categories, search, favorites, sorting, fullscreen play, and a restricted allowlist proxy.

## Features

- 1,200 deterministic playable games/variants generated from 10 original HTML5 Canvas game engines.
- 1 Player, 2 Player, 3 Player and 4 Player categories.
- Action, Arcade, Classic, Local Co-op, Multiplayer, Party, Puzzle, Reflex, Skill, Sports, Survival and more.
- Search, category filters, sorting, favorites and recently-played storage.
- Responsive dark/light interface.
- Fullscreen game mode.
- Restricted server-side proxy with fullscreen viewer.
- Proxy protections: explicit allowlist, HTTP(S)-only URLs, DNS checks against private/local destinations, redirect validation, response-size limit and timeout.
- Node test suite for catalog and proxy validation.

## Why the games are original

This repository does **not** scrape, hotlink, mirror, or redistribute commercial games from third-party gaming websites. Instead, the catalog contains 1,200 deterministic gameplay variants built from original Canvas engines in `public/game.js`. This keeps the project self-contained and avoids depending on games that can disappear, block embedding, or have incompatible licenses.

## Install

Requirements: Node.js 20 or newer.

```bash
npm install
npm start
```

Open `http://localhost:3000`.

### Development

```bash
npm run dev
```

### Tests

```bash
npm test
```

## Proxy setup

The proxy is intentionally **disabled by default**. Configure only domains you own or are authorized to proxy.

### Windows PowerShell

```powershell
$env:PROXY_ALLOWLIST="example.com,docs.example.com"
npm start
```

### Linux/macOS

```bash
PROXY_ALLOWLIST="example.com,docs.example.com" npm start
```

Then open `http://localhost:3000/proxy.html`.

The proxy is not designed to bypass school, workplace, parental-control, network, or service access restrictions. It rejects private/local IP destinations and any hostname outside the configured allowlist.

## Multiplayer controls

| Player | Movement | Action |
|---|---|---|
| P1 | W A S D | Space |
| P2 | Arrow keys | Enter |
| P3 | T F G H | R |
| P4 | I J K L | O |

Some game types use only part of the control set; instructions are shown inside each game.

## Structure

- `server.js` — Express server and restricted proxy endpoint.
- `public/game-catalog.js` — deterministic 1,200-game catalog.
- `public/game.js` — Canvas game runtime and engines.
- `public/app.js` — arcade browsing UI.
- `public/proxy.html` / `public/proxy.js` — proxy interface and fullscreen viewer.
- `test/smoke.test.js` — automated smoke tests.
