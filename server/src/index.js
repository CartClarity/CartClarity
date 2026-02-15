import express from "express";
import { getAccessToken, searchReddit, fetchComments } from "./reddit.js";

const app = express();
const PORT = process.env.PORT || 8787;

// Very small in-memory cache (dev). Replace with Redis later.
const cache = new Map();
// cache key -> { expiresAt, value }

function setCache(key, value, ttlMs) {
  cache.set(key, { value, expiresAt: Date.now() + ttlMs });
}
function getCache(key) {
  const hit = cache.get(key);
  if (!hit) return null;
  if (Date.now() > hit.expiresAt) { cache.delete(key); return null; }
  return hit.value;
}

app.get("/health", (_req, res) => res.json({ ok: true }));

// Dev endpoint: search + fetch top threads + top comments
app.get("/api/reddit/product", async (req, res) => {
  const query = req.query.q?.toString();
  if (!query) return res.status(400).json({ error: "Missing q param" });

  const cacheKey = `product:${query}`;
  const cached = getCache(cacheKey);
  if (cached) return res.json({ cached: true, ...cached });

  try {
    const tokenResp = await getAccessToken();
    const token = tokenResp.access_token;

    const search = await searchReddit(query, 5, token);

    const posts = (search.data?.data?.children || [])
      .map(c => c.data)
      .filter(Boolean)
      .map(p => ({
        id: p.id,
        title: p.title,
        subreddit: p.subreddit,
        permalink: p.permalink,
        url: p.url,
        created_utc: p.created_utc,
        num_comments: p.num_comments,
        score: p.score
      }));

    // Fetch top comments for each thread (lightweight)
    const threads = [];
    for (const p of posts) {
      const commentsResp = await fetchComments(p.permalink, token);
      threads.push({
        post: p,
        // keep raw for now; later you’ll extract top comments only and delete raw quickly
        commentsListing: commentsResp.data,
        rateLimit: commentsResp.rateLimit
      });
    }

    const payload = {
      cached: false,
      query,
      threads,
      rateLimit: search.rateLimit
    };

    // Cache for 24h in dev to reduce API calls
    setCache(cacheKey, payload, 24 * 60 * 60 * 1000);

    res.json(payload);
  } catch (e) {
    res.status(500).json({ error: e.message || String(e) });
  }
});

app.listen(PORT, () => {
  console.log(`CartClarity server listening on http://localhost:${PORT}`);
});
