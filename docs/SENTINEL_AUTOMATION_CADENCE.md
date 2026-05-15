# Sentinel Automation Cadence

Sentinel now has a local cadence command for safe recurring operation. It is a command workflow, not a daemon, and it does not install cron jobs, deploy files, expose services or start the API.

## Command

```bash
npm run platform:cadence
```

Default cadence runs:

1. `seo:monitor`
2. `platform:state`
3. `platform:daily`
4. `platform:stakeholder`

It writes ignored output to:

- `reports/sentinel-state.json`
- `reports/sentinel-daily-operator-report.md`
- `reports/sentinel-stakeholder-weekly-report.md`
- `reports/sentinel-cadence-summary.json`

Notification payloads can be prepared separately with:

```bash
npm run platform:notify -- --all
```

This generates ignored Markdown and JSON payloads under `reports/notifications/` but sends nothing.

## Modes

```bash
npm run platform:cadence -- --dry-run
npm run platform:cadence -- --daily
npm run platform:cadence -- --operator-only
npm run platform:cadence -- --stakeholder-only
```

`--daily` is an explicit full-cadence alias. `--operator-only` refreshes state and the operator report. `--stakeholder-only` refreshes state and the stakeholder report. `--dry-run` prints what would run and creates nothing.

## Recommended Local Cadence

For Matthew's local machine:

```cron
# Daily health and operator report, Monday to Friday at 08:00
0 8 * * 1-5 cd "/path/to/erp-experts-pink" && npm run platform:cadence -- --operator-only >> logs/sentinel-cadence.log 2>&1

# Weekly stakeholder progress report, Friday at 08:30
30 8 * * 5 cd "/path/to/erp-experts-pink" && npm run platform:cadence -- --stakeholder-only >> logs/sentinel-cadence.log 2>&1
```

Keep cron logs outside Git. Do not commit generated reports or logs.

## Future Raspberry Pi Cadence

On the Raspberry Pi, use the same command after the repo, `.env`, data paths and backups are confirmed:

```cron
0 8 * * 1-5 cd /srv/matthew-platform/apps/seo-ops && npm run platform:cadence -- --operator-only >> /srv/matthew-platform/logs/seo-ops/cadence.log 2>&1
30 8 * * 5 cd /srv/matthew-platform/apps/seo-ops && npm run platform:cadence -- --stakeholder-only >> /srv/matthew-platform/logs/seo-ops/cadence.log 2>&1
```

Alternative future systemd timer approach:

- `sentinel-cadence.service`
- `sentinel-cadence.timer`
- `sentinel-stakeholder.service`
- `sentinel-stakeholder.timer`

Do not enable timers until auth, backup verification, data paths and log rotation are confirmed.

Template files are present under `deploy/systemd/`:

- `sentinel-cadence.service.example`
- `sentinel-cadence.timer.example`
- `sentinel-stakeholder.service.example`
- `sentinel-stakeholder.timer.example`

Dry-run the future systemd setup with:

```bash
npm run cadence:service:dry-run
```

This only checks templates and prints the future copy, enable and start commands. It does not modify `/etc/systemd/system`, reload systemd, enable timers or start jobs.

## Safety Rules

- Do not expose the Sentinel API publicly.
- Keep API binding to `127.0.0.1`.
- Keep operator reports private.
- Keep stakeholder reports business-facing and free of commands or private workflow details.
- Keep stakeholder notifications business-facing and run the built-in safety scan before any future sending integration.
- Monitor disk usage for reports, logs and SQLite history.
- Run `npm run platform:cleanup -- --dry-run` style checks before pruning history.
- Run `npm run backup:verify` and `npm run backup:restore:test` before trusting scheduled platform state.

## Practical Recommendation

- Monitor cadence: daily on weekdays.
- Operator report: every morning.
- Stakeholder report: weekly, before internal review.
- Full cadence: use manually when you want everything refreshed in one pass.
