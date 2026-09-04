# ArcadeForge

ArcadeForge is a browser arcade with **1,200 playable game variants**, local multiplayer for up to four players, categories, search, favorites, fullscreen play and a restricted allowlist proxy.

## Features

- 1,200 deterministic playable games/variants generated from 10 original HTML5 Canvas game engines.
- 1 Player, 2 Player, 3 Player and 4 Player categories.
- Action, Arcade, Classic, Local Co-op, Multiplayer, Party, Puzzle, Reflex, Skill, Sports, Survival and more.
- Featured games, trending shelf, category discovery and full game library.
- Search, filters, sorting, favorites and recently-played storage.
- Responsive gaming-focused interface.
- Fullscreen game mode.
- Restricted server-side proxy with fullscreen viewer.
- Health endpoint and graceful process shutdown.
- Node test suite for catalog and proxy validation.

## Run

Requirements: Node.js 20 or newer.

```bash
npm install
npm start
```

Default address:

```text
http://127.0.0.1:3000
```

Custom bind address and port:

```bash
HOST=0.0.0.0 PORT=3100 npm start
```

## Development

```bash
npm run dev
```

## Tests

```bash
npm test
```

## Proxy configuration

The proxy is disabled until `PROXY_ALLOWLIST` contains one or more permitted domains.

```bash
PROXY_ALLOWLIST="example.com,docs.example.com" npm start
```

The proxy accepts HTTP(S), checks DNS results, blocks private/local destinations, validates redirects, limits response size and applies an upstream timeout.

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
- `public/index.html` — main arcade interface.
- `public/game-catalog.js` — deterministic 1,200-game catalog.
- `public/game.js` — Canvas game runtime and engines.
- `public/app.js` — discovery, search, categories, trending and favorites.
- `public/styles.css` — responsive visual system.
- `public/proxy.html` / `public/proxy.js` — proxy interface and fullscreen viewer.
- `test/smoke.test.js` — automated smoke tests.

## Game catalog

The 1,200 catalog entries are deterministic gameplay variants built from the original Canvas engines in `public/game.js`.
