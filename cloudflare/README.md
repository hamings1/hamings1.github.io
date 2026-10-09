# Cloudflare visitor map

The website remains on GitHub Pages. A separate Worker exposes `POST /visit` and public `GET /stats`, backed by D1 country totals. The browser shows dots on the existing world map and an accessible country list.

## Deploy

Use Cloudflare's official Wrangler CLI. Authorize account/user read, Workers scripts write, and D1 write scopes. Keep credentials in Wrangler's local store, never in this repository.

```sh
wrangler login --scopes account:read user:read workers_scripts:write d1:write
wrangler d1 create hamings1-visitors
```

Put the returned database ID in `wrangler.jsonc`, then run from this directory:

```sh
wrangler d1 execute hamings1-visitors --remote --file=schema.sql
wrangler deploy
```

Set `apiBase` in `../assets/visitor-config.json` to the deployed HTTPS Worker origin. Run `node ../scripts/update-homepage.cjs` and publish the static repository to GitHub Pages. No paid plan or custom domain is required by this implementation; applicable Cloudflare account limits still apply.

## Validate

```sh
node --test worker.test.mjs
```

The tests run actual SQLite queries against an in-memory database: upsert/aggregation, empty data, origin checks, methods, privacy opt-out, bots, rate limits, unknown country values, and unavailable storage. Production counts must never be seeded with test fixtures. Confirm `/stats` returns zero initially, then visit the real homepage to generate a legitimate first visit.

## Counting and privacy

- One visit per browser tab per fixed 30-minute period; a tab-local timestamp reduces refresh duplication. These are not unique visitor counts. With browser storage disabled, refresh deduplication is unavailable.
- Only homepage loads are counted. Eager iframe loading records a visit without requiring a scroll.
- D1 contains country code, cumulative visits, and first-seen timestamp. No raw IPs, session IDs, individual records, or precise locations are retained in D1.
- The Worker derives country from Cloudflare metadata, never caller-supplied JSON. Short-lived hashed keys protect the public endpoints with rate limiting. Origin checks discourage browser misuse but cannot authenticate an arbitrary HTTP client.
- GPC/DNT opt-outs and basic known-bot filtering are honored. Browser blockers and network failures can undercount.
- Public data contains country totals only. API failures produce an unavailable state rather than zero or made-up dots.
- Rate-limit namespace IDs are dedicated to this service. Observability logging is disabled.
