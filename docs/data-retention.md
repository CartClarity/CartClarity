# Data retention

- Store minimal metadata needed for display (thread IDs/URLs, subreddit, timestamps)
- Cache raw comment bodies only long enough to compute summaries
- Routinely delete raw content (target <= 48 hours)
