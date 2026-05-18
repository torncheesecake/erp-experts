# Sentinel Local Operator Launch

This guide explains how to open the standalone Sentinel operator shell locally while connecting it to the Raspberry Pi Sentinel API through a private SSH tunnel.

This workflow is local-only. It does not deploy `sentinel.artifexa.co.uk`, expose the Raspberry Pi API, change auth mode, install services or start any public reverse proxy.

## Purpose

Use this when you want the local `/sentinel` app shell to behave like the future Artifexa-owned operator frontend while reading live operational state from the Pi-backed Sentinel node.

The target local route is:

```text
http://localhost:5173/sentinel
```

## Prerequisites

- Raspberry Pi Sentinel API is healthy on the Pi at `127.0.0.1:4317`.
- SSH key access to the Pi works for `matthew@192.168.4.22`.
- The Pi API remains bound to localhost on the Pi.
- Remote authority is still disabled unless a later task explicitly enables it.

## Quick Check

From the local repo:

```bash
npm run sentinel:launch
```

The helper prints the two-terminal launch workflow and checks:

- whether local `http://127.0.0.1:4317/health` is reachable
- whether `/authority/status` is readable when the API is reachable
- whether the local Vite dev server appears to be running at `http://localhost:5173/sentinel`

It does not start SSH, does not start Vite and does not mutate the Pi.

## Terminal 1: SSH Tunnel

Keep this terminal open:

```bash
ssh -N -L 4317:127.0.0.1:4317 matthew@192.168.4.22
```

This maps local Mac port `4317` to the Pi's private localhost API. It does not expose the API to the wider network.

## Terminal 2: Frontend

In the repo root:

```bash
VITE_SENTINEL_API_BASE_URL=http://127.0.0.1:4317 npm run dev
```

Then open:

```text
http://localhost:5173/sentinel
```

## Expected State

- `/sentinel` opens as the standalone Sentinel by Artifexa operator shell.
- Content Workbench is the primary/default surface.
- Runtime context should report the Pi-backed Sentinel node when the tunnel and API are reachable.
- Authority state `local_bypass` is expected while auth remains disabled.
- `/seo-progress` remains stakeholder-safe and separate.

## Troubleshooting

### Failed to fetch

This usually means the frontend cannot reach `http://127.0.0.1:4317`.

Check:

- the SSH tunnel terminal is still open
- `sentinel-api.service` is active on the Pi
- the frontend was launched with `VITE_SENTINEL_API_BASE_URL=http://127.0.0.1:4317`

### Authority State Shows Local Bypass

This is expected while `SENTINEL_AUTHORITY_MODE=disabled`.

Do not enable auth or expose the API as part of this local launch workflow.

### Dev Server Not Running

Run the Terminal 2 command again:

```bash
VITE_SENTINEL_API_BASE_URL=http://127.0.0.1:4317 npm run dev
```

### API Must Stay Private

The Pi service should continue to bind to:

```text
127.0.0.1:4317
```

Do not change firewall rules, router settings, DNS, reverse proxy or Nginx for this workflow.
