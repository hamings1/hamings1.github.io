CREATE TABLE IF NOT EXISTS country_visits (
  country TEXT PRIMARY KEY CHECK(length(country) = 2),
  visits INTEGER NOT NULL DEFAULT 0 CHECK(visits >= 0),
  first_seen TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);
