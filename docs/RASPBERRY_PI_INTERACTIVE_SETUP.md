# Raspberry Pi Interactive Sentinel Setup

This guide documents the safe manual path for privileged Raspberry Pi preparation after the confirmed automated prep stopped at the `sudo` boundary.

The previous command was intentionally non-interactive:

```bash
npm run platform:pi:install:prep -- --confirm --node-version 22
```

It stopped before completing Node installation because the Pi requires an interactive sudo password:

```text
sudo: a terminal is required to read the password
sudo: a password is required
```

That is the correct safety outcome. Do not add passwords to scripts, do not store sudo passwords in `.env`, and do not configure broad passwordless sudo just to make automation easier.

## Current State

- SSH works to `192.168.4.22`.
- The Raspberry Pi user is expected to be `matthew`, unless local configuration says otherwise.
- sudo requires an interactive password.
- Node.js is missing.
- npm is missing.
- `/srv/matthew-platform` is missing.
- The Sentinel API is not running.
- No repo has been cloned to the Pi.
- No systemd service or timer has been installed.

## 1. SSH Manually

From the local machine:

```bash
ssh matthew@192.168.4.22
```

If the Pi user is different, replace `matthew` with the configured SSH user.

## 2. Verify sudo Interactively

On the Pi:

```bash
sudo -v
```

Enter the sudo password when prompted. Do not paste the password into scripts, docs, terminal logs or committed files.

## 3. Install Node.js 22 LTS and npm

Node.js `22` is the current conservative target for the first Sentinel Raspberry Pi runtime. The command below uses the NodeSource Debian setup script for Node.js `22.x`, then installs the `nodejs` package.

On the Pi:

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x -o /tmp/nodesource_setup_22.x
sudo -E bash /tmp/nodesource_setup_22.x
sudo apt-get install -y nodejs
rm -f /tmp/nodesource_setup_22.x
```

Optional review step before running the setup script:

```bash
less /tmp/nodesource_setup_22.x
```

Do not install Node.js from an unreviewed third-party source if the command changes. If in doubt, stop and update the preparation plan first.

## 4. Verify Node and npm

On the Pi:

```bash
node -v
npm -v
```

Expected shape:

```text
v22.x.x
10.x.x or newer
```

Exact patch versions can vary.

## 5. Create Sentinel Directories

On the Pi:

```bash
sudo mkdir -p /srv/matthew-platform/apps/seo-ops
sudo mkdir -p /srv/matthew-platform/data/seo-ops/backups
sudo mkdir -p /srv/matthew-platform/data/seo-ops/reports
sudo mkdir -p /srv/matthew-platform/logs/seo-ops
```

These folders are only runtime scaffolding. Do not clone the repo yet, do not create service files yet and do not start the API yet.

## 6. Set Ownership

On the Pi:

```bash
sudo chown -R matthew:matthew /srv/matthew-platform
```

If the SSH user is not `matthew`, replace both ownership values with that user:

```bash
sudo chown -R <user>:<user> /srv/matthew-platform
```

Do not use broad permissions such as `chmod -R 777`.

## 7. Verify Directory State

On the Pi:

```bash
ls -ld /srv/matthew-platform
ls -ld /srv/matthew-platform/apps/seo-ops
ls -ld /srv/matthew-platform/data/seo-ops/backups
ls -ld /srv/matthew-platform/data/seo-ops/reports
ls -ld /srv/matthew-platform/logs/seo-ops
```

The owner should be the SSH user, for example `matthew matthew`.

## 8. Exit SSH

On the Pi:

```bash
exit
```

## 9. Verify From the Local Repo

From the local repo:

```bash
npm run platform:pi:install:preflight
npm run platform:pi:post-prep:verify
```

The post-prep verifier is read-only. It checks Node, npm, the expected directory layout, ownership metadata, read/write/execute permission bits for the SSH user, repo absence and Sentinel API port state. It does not install packages, create directories, write test files, clone the repo, start services or use sudo.

## Expected Result After Manual Setup

`npm run platform:pi:post-prep:verify` should report:

- Node.js present.
- npm present.
- `/srv/matthew-platform` present.
- Required child directories present.
- Directories owned by the SSH user.
- Read/write/execute access available for the SSH user.
- Repo still not cloned.
- Sentinel API port `4317` still closed.

## What Not To Do Yet

- Do not clone the repo.
- Do not copy `.env` secrets.
- Do not run `npm ci` on the Pi.
- Do not start `platform:api:serve` on the Pi.
- Do not install systemd services.
- Do not enable cadence timers.
- Do not expose the Sentinel API publicly.
- Do not configure a reverse proxy.

Those steps belong to later, separately approved deployment tasks.

## References

- Node.js release schedule: `https://github.com/nodejs/Release`
- NodeSource Debian Node.js 22 setup script: `https://github.com/nodesource/distributions/blob/master/scripts/deb/setup_22.x`
