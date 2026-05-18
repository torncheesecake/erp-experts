# Raspberry Pi Interactive DB Migration

This guide documents the safe manual path for moving Sentinel's Raspberry Pi SQLite database from the repo-local path to the canonical runtime data path when non-interactive sudo is unavailable.

The current repo-local DB is:

```text
/srv/sentinel/apps/seo-ops/platform/persistence/platform.db
```

The canonical runtime DB is:

```text
/srv/sentinel/data/seo-ops/platform.db
```

Do not store sudo passwords in scripts, `.env` files, shell history snippets or committed documentation. Do not add broad passwordless sudo. Keep the Sentinel API bound to `127.0.0.1` only.

## Manual Migration Steps

1. SSH to the Pi:

```bash
ssh matthew@192.168.4.22
```

2. Confirm the service state:

```bash
sudo systemctl status sentinel-api --no-pager
```

3. Stop the service:

```bash
sudo systemctl stop sentinel-api
```

4. Create and own the canonical data directory:

```bash
sudo mkdir -p /srv/sentinel/data/seo-ops
sudo chown -R matthew:matthew /srv/sentinel/data/seo-ops
```

5. Back up the repo-local DB:

```bash
cp /srv/sentinel/apps/seo-ops/platform/persistence/platform.db \
   /srv/sentinel/data/seo-ops/platform.db.backup-$(date +%Y%m%d-%H%M%S)
```

6. Copy the active DB to the canonical runtime path:

```bash
cp /srv/sentinel/apps/seo-ops/platform/persistence/platform.db \
   /srv/sentinel/data/seo-ops/platform.db
```

7. Update the Pi `.env`:

Edit:

```bash
nano /srv/sentinel/apps/seo-ops/.env
```

Add or set:

```bash
PLATFORM_DB_PATH=/srv/sentinel/data/seo-ops/platform.db
PLATFORM_REPORT_OUTPUT_PATH=/srv/sentinel/data/seo-ops/reports
PLATFORM_BACKUP_PATH=/srv/sentinel/data/seo-ops/backups
PLATFORM_LOG_PATH=/srv/sentinel/logs/seo-ops
```

8. Verify the canonical DB file:

```bash
ls -lh /srv/sentinel/data/seo-ops/platform.db
```

9. Start the service:

```bash
sudo systemctl start sentinel-api
```

10. Verify the service and local API:

```bash
sudo systemctl status sentinel-api --no-pager
curl -s http://127.0.0.1:4317/health
```

11. Exit SSH:

```bash
exit
```

12. From the Mac/local repo, run:

```bash
npm run platform:pi:data:path:verify
npm run platform:pi:service:verify
npm run seo:monitor
```

## Rollback Notes

The repo-local DB is intentionally left in place during migration. If the service fails after migration:

1. SSH to the Pi.
2. Stop `sentinel-api.service`.
3. Restore the previous Pi `.env` DB path or remove the canonical path override.
4. Start `sentinel-api.service`.
5. Verify `/health`, `/tenant` and `/state` locally on the Pi.
6. Do not delete either DB copy until the failure is understood.
