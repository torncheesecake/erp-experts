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

CREATE TABLE IF NOT EXISTS plan_summaries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id TEXT NOT NULL,
  plan_id TEXT,
  title TEXT NOT NULL,
  plan_type TEXT,
  execution_priority TEXT,
  estimated_impact TEXT,
  estimated_effort TEXT,
  confidence TEXT,
  safety_level TEXT,
  required_human_review INTEGER,
  target_slug TEXT,
  target_path TEXT,
  state TEXT NOT NULL DEFAULT 'suggested',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (tenant_id) REFERENCES tenants (tenant_id)
);

CREATE TABLE IF NOT EXISTS plan_approvals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id TEXT NOT NULL,
  plan_id TEXT NOT NULL,
  approved_for TEXT,
  safety_level TEXT,
  required_human_review INTEGER,
  approval_note TEXT,
  source_plan_title TEXT,
  approved_at TEXT NOT NULL,
  expires_at TEXT,
  FOREIGN KEY (tenant_id) REFERENCES tenants (tenant_id)
);

CREATE TABLE IF NOT EXISTS plan_statuses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id TEXT NOT NULL,
  plan_id TEXT NOT NULL,
  title TEXT,
  current_status TEXT,
  safety_level TEXT,
  required_human_review INTEGER,
  next_recommended_step TEXT,
  validation_state TEXT,
  notes TEXT,
  last_updated TEXT NOT NULL,
  FOREIGN KEY (tenant_id) REFERENCES tenants (tenant_id)
);

CREATE TABLE IF NOT EXISTS inbox_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id TEXT NOT NULL,
  item_id TEXT,
  source TEXT,
  title TEXT NOT NULL,
  priority TEXT,
  status TEXT,
  recommended_next_step TEXT,
  command TEXT,
  target_slug TEXT,
  target_path TEXT,
  safety_level TEXT,
  requires_human_review INTEGER,
  related_ids TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (tenant_id) REFERENCES tenants (tenant_id)
);

CREATE TABLE IF NOT EXISTS action_results (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  run_id INTEGER,
  tenant_id TEXT NOT NULL,
  action_id TEXT NOT NULL,
  status TEXT NOT NULL,
  summary TEXT,
  output_excerpt TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (run_id) REFERENCES runs (id),
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

CREATE INDEX IF NOT EXISTS idx_plan_summaries_tenant
  ON plan_summaries (tenant_id);

CREATE INDEX IF NOT EXISTS idx_plan_summaries_plan
  ON plan_summaries (plan_id);

CREATE INDEX IF NOT EXISTS idx_plan_summaries_state
  ON plan_summaries (state);

CREATE INDEX IF NOT EXISTS idx_plan_summaries_safety
  ON plan_summaries (safety_level);

CREATE INDEX IF NOT EXISTS idx_plan_approvals_tenant
  ON plan_approvals (tenant_id);

CREATE INDEX IF NOT EXISTS idx_plan_approvals_plan
  ON plan_approvals (plan_id);

CREATE INDEX IF NOT EXISTS idx_plan_approvals_approved_for
  ON plan_approvals (approved_for);

CREATE INDEX IF NOT EXISTS idx_plan_statuses_tenant
  ON plan_statuses (tenant_id);

CREATE INDEX IF NOT EXISTS idx_plan_statuses_plan
  ON plan_statuses (plan_id);

CREATE INDEX IF NOT EXISTS idx_plan_statuses_current_status
  ON plan_statuses (current_status);

CREATE INDEX IF NOT EXISTS idx_inbox_items_tenant
  ON inbox_items (tenant_id);

CREATE INDEX IF NOT EXISTS idx_inbox_items_item
  ON inbox_items (item_id);

CREATE INDEX IF NOT EXISTS idx_inbox_items_status
  ON inbox_items (status);

CREATE INDEX IF NOT EXISTS idx_inbox_items_priority
  ON inbox_items (priority);

CREATE INDEX IF NOT EXISTS idx_action_results_run
  ON action_results (run_id);

CREATE INDEX IF NOT EXISTS idx_action_results_tenant
  ON action_results (tenant_id);

CREATE INDEX IF NOT EXISTS idx_action_results_action
  ON action_results (action_id);
