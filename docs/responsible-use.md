# Responsible use

CartClarity uses Reddit in a read-only manner for development/testing.

## What we do
- Search public Reddit posts relevant to a product query
- Fetch public comments for a limited number of threads
- Produce an aggregated summary and show prominent links back to sources

## What we do not do
- No posting/commenting/voting/messaging
- No moderation actions
- No user profiling or cross-site tracking
- No storing full comment bodies long-term

## Rate limits
- Honor Reddit rate-limit headers
- Use backoff + throttling
- Cache per product fingerprint to reduce repeated calls
