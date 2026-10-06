-- Promift: incoming free-quote requests (the site's one backend need).
-- Additive only.
CREATE TABLE IF NOT EXISTS quote_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  project TEXT NOT NULL,
  details TEXT,
  source TEXT
);
