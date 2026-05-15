PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS tenants (
  tenant_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  domain TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS runs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id TEXT NOT NULL,
  command TEXT NOT NULL,
  status TEXT NOT NULL,
  started_at TEXT NOT NULL,
  finished_at TEXT,
  FOREIGN KEY (tenant_id) REFERENCES tenants (tenant_id)
);

CREATE TABLE IF NOT EXISTS snapshots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id TEXT NOT NULL,
  pass_count INTEGER NOT NULL,
  review_count INTEGER NOT NULL,
  blocked_count INTEGER NOT NULL,
  monitor_status TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (tenant_id) REFERENCES tenants (tenant_id)
);

CREATE TABLE IF NOT EXISTS opportunity_summaries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id TEXT NOT NULL,
  opportunity_id TEXT,
  title TEXT NOT NULL,
  primary_type TEXT,
  score INTEGER,
  priority_label TEXT,
  action_theme TEXT,
  target_slug TEXT,
  target_path TEXT,
  state TEXT NOT NULL DEFAULT 'suggested',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (tenant_id) REFERENCES tenants (tenant_id)
);

CREATE INDEX IF NOT EXISTS idx_runs_tenant_started_at
  ON runs (tenant_id, started_at);

CREATE INDEX IF NOT EXISTS idx_snapshots_tenant_created_at
  ON snapshots (tenant_id, created_at);

CREATE INDEX IF NOT EXISTS idx_opportunity_summaries_tenant
  ON opportunity_summaries (tenant_id);

CREATE INDEX IF NOT EXISTS idx_opportunity_summaries_opportunity
  ON opportunity_summaries (opportunity_id);

CREATE INDEX IF NOT EXISTS idx_opportunity_summaries_state
  ON opportunity_summaries (state);
