# Raspberry Pi Local Environment Setup

This guide explains how to configure local environment variables for Sentinel Raspberry Pi discovery. It is local setup only. It does not deploy, SSH, create directories, copy files, install packages or start services.

## Purpose

`npm run platform:pi:discover` can run without secrets and uses `192.168.4.22` as the default Raspberry Pi host. SSH discovery requires local SSH details, but those details must stay outside Git.

Use this guide when you want to prepare your own machine for read-only discovery.

## 1. Create a local `.env`

Copy the example file locally:

```bash
cp .env.example .env
```

`.env` is ignored by Git. Do not commit it.

## 2. Set Raspberry Pi discovery variables

Add or update these local values in `.env`:

```text
RASPBERRY_PI_HOST=192.168.4.22
RASPBERRY_PI_USER=<your-pi-user>
RASPBERRY_PI_SSH_PORT=22
RASPBERRY_PI_DEPLOY_ROOT=/srv/matthew-platform
RASPBERRY_PI_APP_PATH=/srv/matthew-platform/apps/seo-ops
```

Replace `<your-pi-user>` with the real Raspberry Pi SSH user on your machine only.

## 3. Do not store passwords

Do not put passwords in `.env`.

Use one of these instead:

- SSH keys already configured on your machine.
- Existing SSH config in `~/.ssh/config`.
- A local SSH agent.

The discovery command uses non-interactive SSH settings and will not prompt for passwords.

## 4. Run discovery without SSH first

```bash
npm run platform:pi:discover
```

This prints the target summary and writes ignored local reports:

```text
reports/sentinel-pi-discovery.json
reports/sentinel-pi-discovery.md
```

## 5. Locate the Pi if DHCP changes the IP

If the Pi moves away from the configured host, run the safe local-network scan:

```bash
npm run platform:pi:discover -- --scan
```

By default this checks `192.168.4.1-254` for open SSH port `22` and the Sentinel API prototype port `4317`. It does not authenticate, prompt for passwords, deploy, copy files or mutate hosts.

Use a different local prefix or CIDR only when you know the LAN range:

```bash
npm run platform:pi:discover -- --scan --subnet 192.168.4
npm run platform:pi:discover -- --scan --subnet 192.168.4.0/24
```

If a candidate is found, confirm it is the Raspberry Pi before updating local `.env`:

```text
RASPBERRY_PI_HOST=<candidate-ip>
```

The long-term fix is a DHCP reservation or static lease for the Pi so Sentinel discovery does not depend on changing addresses.

## 6. Run read-only SSH discovery only when ready

Only after local SSH access is already configured, run:

```bash
npm run platform:pi:discover -- --ssh
```

SSH mode uses `BatchMode=yes` and `PasswordAuthentication=no`. It runs read-only checks only:

- `hostname`
- `uname -a`
- `node -v || true`
- `npm -v || true`
- `git --version || true`
- `df -h /`
- `free -h || true`
- `ls -ld /srv /srv/matthew-platform || true`
- `systemctl --version || true`

## Safety Rules

- Do not commit `.env`.
- Do not commit credentials, SSH keys, tokens or passwords.
- Do not put passwords in `.env`.
- Do not deploy from discovery.
- Do not create Raspberry Pi directories from discovery.
- Do not expose the Sentinel API publicly.
- Keep Sentinel API authority Matthew-controlled.

## Expected Missing-User Behaviour

If `RASPBERRY_PI_USER` is missing, discovery should warn and exit safely. That is expected until your local environment is configured.
