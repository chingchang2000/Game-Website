# Host ArcadeForge på Carsten

Denne guide er lavet til Carsten, din Ubuntu-server.

ArcadeForge installeres som en rigtig systemd-service og starter automatisk efter en genstart. Den bruger som standard:

- App-mappe: `/opt/arcadeforge`
- Service: `arcadeforge.service`
- Intern port: `3100`
- Intern bind-adresse: `127.0.0.1`
- Konfiguration: `/etc/arcadeforge.env`

Det betyder, at den ikke overtager port 80/443 og derfor ikke bør ødelægge andre hjemmesider, du allerede hoster.

## Nem installation

På Carsten:

```bash
cd ~/Downloads
git clone https://github.com/chingchang2000/Game-Website.git
cd Game-Website
sudo bash carsten-install.sh
```

Når installeren er færdig, skal denne adresse virke **inde på Carsten**:

```text
http://127.0.0.1:3100
```

## Hvis du bruger NexusHost

Opret en ny side/backend i dashboardet og brug:

```text
Host/IP: 127.0.0.1
Port: 3100
```

Lad derefter NexusHost håndtere domænet eller Cloudflare-delen.

## Hvis du bruger Cloudflare Tunnel direkte

ArcadeForge skal være tunnelens lokale service:

```text
http://127.0.0.1:3100
```

Til en midlertidig test-tunnel kan du køre:

```bash
cloudflared tunnel --url http://127.0.0.1:3100
```

Hvis du allerede har en permanent Cloudflare Tunnel på Carsten, skal du blot tilføje en ny public hostname, der peger på `http://127.0.0.1:3100`.

Du behøver ikke åbne porte i routeren, når du bruger Cloudflare Tunnel.

## Opdater hjemmesiden senere

Alle ændringer bør først ligge på GitHub. På Carsten kører du derefter:

```bash
sudo bash /opt/arcadeforge/carsten-update.sh
```

Updateren:

1. henter nyeste `main` fra GitHub,
2. opdaterer dependencies,
3. genstarter servicen,
4. tester health-endpointet.

## Start, stop og status

```bash
sudo systemctl status arcadeforge
sudo systemctl restart arcadeforge
sudo systemctl stop arcadeforge
sudo systemctl start arcadeforge
```

Live logs:

```bash
sudo journalctl -u arcadeforge -f
```

## Skift port eller proxy-allowlist

Rediger:

```bash
sudo nano /etc/arcadeforge.env
```

Eksempel:

```env
NODE_ENV=production
HOST=127.0.0.1
PORT=3100
PROXY_ALLOWLIST=example.com,docs.example.com
```

Genstart bagefter:

```bash
sudo systemctl restart arcadeforge
```

Proxyen er fortsat begrænset til domæner, du ejer eller har tilladelse til at proxy'e.

## Hvis du vil åbne den direkte på dit LAN

Den sikre standard er `127.0.0.1`, fordi NexusHost/Cloudflare kan komme ind lokalt uden at eksponere Node-porten.

Hvis du specifikt vil gøre port 3100 tilgængelig direkte på dit lokale netværk, ændr:

```env
HOST=0.0.0.0
```

og genstart servicen. Derefter kan den normalt åbnes på:

```text
http://CARSTENS-LAN-IP:3100
```

Brug stadig reverse proxy eller Cloudflare til offentlig adgang.
