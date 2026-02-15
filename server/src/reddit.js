// Minimal Reddit Data API client (dev only).
// Uses password grant for quick local testing.
// For production, switch to a more appropriate OAuth flow and secure secrets.

const TOKEN_URL = "https://www.reddit.com/api/v1/access_token";
const OAUTH_BASE = "https://oauth.reddit.com";

function env(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

export async function getAccessToken() {
  const clientId = env("REDDIT_CLIENT_ID");
  const clientSecret = env("REDDIT_CLIENT_SECRET");
  const username = env("REDDIT_USERNAME");
  const password = env("REDDIT_PASSWORD");
  const ua = env("USER_AGENT");

  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const body = new URLSearchParams({
    grant_type: "password",
    username,
    password
  });

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      "Authorization": `Basic ${basic}`,
      "User-Agent": ua,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Token request failed: ${res.status} ${text}`);
  }

  return res.json(); // { access_token, token_type, expires_in, scope }
}

export async function redditGet(path, token) {
  const ua = env("USER_AGENT");
  const url = `${OAUTH_BASE}${path}`;

  const res = await fetch(url, {
    headers: {
      "Authorization": `Bearer ${token}`,
      "User-Agent": ua
    }
  });

  // Capture rate-limit headers if present
  const rl = {
    used: res.headers.get("x-ratelimit-used"),
    remaining: res.headers.get("x-ratelimit-remaining"),
    reset: res.headers.get("x-ratelimit-reset")
  };

  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { json = { raw: text }; }

  if (!res.ok) {
    throw new Error(`Reddit GET failed: ${res.status} ${JSON.stringify(json)} | RL=${JSON.stringify(rl)}`);
  }

  return { data: json, rateLimit: rl };
}

export async function searchReddit(q, limit = 5, token) {
  const params = new URLSearchParams({
    q,
    limit: String(limit),
    sort: "relevance",
    t: "all",
    type: "link"
  });
  return redditGet(`/search?${params.toString()}`, token);
}

export async function fetchComments(permalink, token) {
  // permalink looks like: /r/sub/comments/postid/title/
  // Reddit comments endpoint returns an array (post + comments listing)
  const params = new URLSearchParams({ limit: "50", sort: "top" });
  return redditGet(`${permalink}.json?${params.toString()}`, token);
}
