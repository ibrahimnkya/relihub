# Deploy ReliHub frontend on Ubuntu (bare metal)

Production **main** branch: static SPA only. API is external (`https://mafuta.mysafari.co.tz/api` by default).

| Item | Value |
|------|--------|
| Domain | `relihub.co.tz` |
| Web root | `/var/www/projects/relihub` |
| Nginx site | `deploy/nginx/relihub.co.tz.conf` |

---

## 1. Server preparation

Ubuntu 22.04 or 24.04, with DNS **A records** for `relihub.co.tz` and `www.relihub.co.tz` pointing to this server.

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y nginx git curl
```

Open firewall if enabled:

```bash
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw enable
```

---

## 2. Build the app

Build on the server **or** on your laptop and copy `dist/` (see step 4).

### Option A — Build on the server

```bash
# Node 20 (NodeSource)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

cd ~
git clone https://github.com/ibrahimnkya/relihub.git
cd relihub
git checkout main

# API URL is baked in at build time
export VITE_API_BASE_URL=https://mafuta.mysafari.co.tz/api
export VITE_USE_MOCK=false

npm ci
npm run build
```

### Option B — Build locally, upload

On your machine:

```bash
git clone https://github.com/ibrahimnkya/relihub.git
cd relihub
git checkout main
export VITE_API_BASE_URL=https://mafuta.mysafari.co.tz/api
npm ci && npm run build
```

Upload to server:

```bash
rsync -avz --delete dist/ user@YOUR_SERVER_IP:/var/www/projects/relihub/
```

---

## 3. Install files on the server

```bash
sudo mkdir -p /var/www/projects/relihub
sudo chown -R $USER:www-data /var/www/projects/relihub
```

If you built on the server:

```bash
rsync -av --delete ~/relihub/dist/ /var/www/projects/relihub/
```

Verify:

```bash
ls -la /var/www/projects/relihub/index.html
```

Set permissions:

```bash
sudo find /var/www/projects/relihub -type d -exec chmod 755 {} \;
sudo find /var/www/projects/relihub -type f -exec chmod 644 {} \;
sudo chown -R www-data:www-data /var/www/projects/relihub
```

---

## 4. Nginx site config

From the repo on the server (or copy the file manually):

```bash
cd ~/relihub   # or wherever you cloned
sudo cp deploy/nginx/relihub.co.tz.conf /etc/nginx/sites-available/relihub.co.tz
sudo ln -sf /etc/nginx/sites-available/relihub.co.tz /etc/nginx/sites-enabled/

# Remove default site if it conflicts on port 80
sudo rm -f /etc/nginx/sites-enabled/default

sudo nginx -t
```

**Before SSL:** temporarily comment out the `ssl_*` lines and the `listen 443 ssl` block’s cert paths, or use Certbot’s nginx plugin (step 5) which edits the config for you.

---

## 5. TLS with Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d relihub.co.tz -d www.relihub.co.tz
```

Follow prompts (email, agree, redirect HTTP→HTTPS: **Yes**).

Certbot will merge certificates into your site. Re-apply our clean config if Certbot overwrote it:

```bash
sudo cp deploy/nginx/relihub.co.tz.conf /etc/nginx/sites-available/relihub.co.tz
sudo nginx -t && sudo systemctl reload nginx
```

Renewal is automatic via `certbot.timer`.

---

## 6. Go live

```bash
sudo systemctl enable nginx
sudo systemctl reload nginx
```

Open **https://relihub.co.tz**

---

## 7. Updating after code changes

```bash
cd ~/relihub
git pull origin main
export VITE_API_BASE_URL=https://mafuta.mysafari.co.tz/api
npm ci && npm run build
sudo rsync -av --delete dist/ /var/www/projects/relihub/
sudo systemctl reload nginx
```

Hard-refresh the browser (or clear cache) if you still see an old UI.

---

## 8. Checks

```bash
# Nginx syntax
sudo nginx -t

# Site responds
curl -I https://relihub.co.tz

# SPA route (should be 200, not 404)
curl -I https://relihub.co.tz/dashboard
```

**API / login issues:** confirm `VITE_API_BASE_URL` at build time and that the API allows CORS from `https://relihub.co.tz`.

**502 / blank page:** `sudo tail -f /var/log/nginx/error.log`

---

## Docker alternative

On the same server you can use Docker instead of copying `dist/`:

```bash
cp .env.example .env
docker compose up -d --build
```

Map container port 80 to host 80, or put host nginx in front as a reverse proxy. See root `DEPLOY.md`.
