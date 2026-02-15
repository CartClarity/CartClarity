# CartClarity (development)

CartClarity is a **read-only** research tool that helps users find relevant public Reddit discussions about consumer products and summarize common pros/cons with links back to source threads.

## Architecture (important)
The **Chrome extension does not call Reddit directly**.
All Reddit Data API requests are made server-side by a backend service to keep OAuth credentials private and to centralize caching + rate-limiting.

- Extension (MV3) -> CartClarity backend -> Reddit Data API

## Responsible use
- Read-only: no posting, voting, messaging, or moderation actions
- Rate-limit aware: uses Reddit rate-limit headers + backoff
- Caching to deduplicate requests across users/products
- Minimal retention: raw comment bodies cached short-term for processing and routinely deleted (target <= 48 hours)
- Attribution: links back to original threads; not affiliated with Reddit

See:
- docs/architecture.md
- docs/responsible-use.md
- docs/data-retention.md

## Dev server
A minimal Node server exists in `/server` to demonstrate OAuth + search + comments retrieval.

**No secrets are committed.** Copy `server/.env.example` to `server/.env` and fill locally (after approval).

Not affiliated with Reddit.
