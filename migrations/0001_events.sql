CREATE TABLE IF NOT EXISTS events (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    slug        TEXT    NOT NULL UNIQUE,
    name        TEXT    NOT NULL,
    description TEXT,
    date        TEXT,
    location    TEXT,
    active      INTEGER NOT NULL DEFAULT 1,
    created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- Example seed rows (remove or adjust before production)
INSERT OR IGNORE INTO events (slug, name, description, date, location) VALUES
    ('event-abc', 'ABM Executive Roundtable — Sydney 2025', 'An invite-only session for C-suite leaders.', '2025-09-15', 'Sydney, NSW'),
    ('event-xyz', 'ABM Strategy Forum — Melbourne 2025', 'Strategic insights for growth-focused executives.', '2025-10-22', 'Melbourne, VIC');
