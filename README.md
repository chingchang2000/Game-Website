# ArcadeForge

ArcadeForge is a self-hosted browser arcade with **1,200 playable original game variants**, local multiplayer for up to four players, categories, search, favorites, fullscreen play and a restricted allowlist proxy.

## Features

- 1,200 deterministic playable games/variants generated from 10 original HTML5 Canvas game engines.
- 1 Player, 2 Player, 3 Player and 4 Player categories.
- Action, Arcade, Classic, Local Co-op, Multiplayer, Party, Puzzle, Reflex, Skill, Sports, Survival and more.
- Search, category filters, sorting, favorites and recently-played storage.
- Responsive dark/light interface.
- Fullscreen game mode.
- Restricted server-side proxy with fullscreen viewer.
- Proxy protections: explicit allowlist, HTTP(S)-only URLs, DNS checks against private/local destinations, redirect validation, response-size limit and timeout.
- Ubuntu/Carsten installer with systemd auto-start.
- Automatic update script.
- GitHub Actions smoke tests.

## Host it on Carsten (Ubuntu)

ArcadeForge is prepared to run alongside your other hosted sites without taking over port 80/443.

The default Carsten setup uses:

- Service: `arcadeforge.service`
- Folder: `/opt/arcadeforge`
- Local address: `127.0.0.1:3100`
- Environment file: `/etc/arcadeforge.env`
- Automatic startup after reboot: enabled

### Easiest install

Run this on Carsten:

```bash
curl -fsSL https://raw.githubusercontent.com/chingchang2000/Game-Website/main/carsten-install.sh -o /tmp/carsten-install.sh
sudo bash /tmp/carsten-install.sh
```

The installer installs/checks Node.js, downloads the repository, installs dependencies, creates the systemd service, enables auto-start and runs a health check.

After installation, use this backend in NexusHost:

```text
Host/IP: 127.0.0.1
Port: 3100
```

Or point a Cloudflare Tunnel public hostname at:

```text
http://127.0.0.1:3100
```

No router port-forward is needed when you use Cloudflare Tunnel.

The complete Carsten guide is in **[CARSTEN.md](CARSTEN.md)**.

## Update Carsten after GitHub changes

Every code change should go to this repository first. Then run:

```bash
sudo bash /opt/arcadeforge/carsten-update.sh
```

That command pulls the latest `main`, installs any changed dependencies, restarts ArcadeForge and verifies the health endpoint.

## Service commands on Carsten

```bash
sudo systemctl status arcadeforge
sudo systemctl restart arcadeforge
sudo journalctl -u arcadeforge -f
```

## Normal local installation

Requirements: Node.js 20 or newer.

```bash
npm install
npm start
```

By default the application listens on `127.0.0.1:3000`.

To listen on another host/port:

```bash
HOST=0.0.0.0 PORT=3000 npm start
```

## Development

```bash
npm run dev
```

## Tests

```bash
npm test
```

## Proxy setup

The proxy is intentionally **disabled by default**. Configure only domains you own or are authorized to proxy.

Linux example:

```bash
PROXY_ALLOWLIST="example.com,docs.example.com" npm start
```

On Carsten, edit:

```bash
sudo nano /etc/arcadeforge.env
```

Then restart:

```bash
sudo systemctl restart arcadeforge
```

The proxy is not designed to bypass school, workplace, parental-control, network, or service access restrictions. It rejects private/local IP destinations and hostnames outside the configured allowlist.

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
- `carsten-install.sh` — production installer for Carsten/Ubuntu.
- `carsten-update.sh` — update-and-restart script.
- `CARSTEN.md` — full Carsten hosting guide.
- `deploy/nginx-arcadeforge.conf.example` — optional Nginx reverse proxy example.
- `test/smoke.test.js` — automated smoke tests.

## About the game catalog

This repository does not scrape, hotlink, mirror, or redistribute commercial games from third-party gaming websites. The 1,200 catalog entries are deterministic gameplay variants built from the original Canvas engines in `public/game.js`.
