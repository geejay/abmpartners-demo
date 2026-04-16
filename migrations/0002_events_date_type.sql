-- Change events.date column type from TEXT to DATE
-- SQLite requires table recreation to change column affinity

ALTER TABLE events RENAME TO events_old;

CREATE TABLE IF NOT EXISTS events (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    slug        TEXT    NOT NULL UNIQUE,
    name        TEXT    NOT NULL,
    description TEXT,
    date        DATE,
    location    TEXT,
    active      INTEGER NOT NULL DEFAULT 1,
    created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

INSERT INTO events SELECT * FROM events_old;

DROP TABLE events_old;
