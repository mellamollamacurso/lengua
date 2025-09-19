// Common helpers for Upstash REST
export const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET,POST,OPTIONS",
  "access-control-allow-headers": "content-type",
  "cache-control": "no-store"
};

export function json(res, obj, status = 200) {
  res.status(status).setHeader("content-type", "application/json; charset=utf-8");
  for (const [k,v] of Object.entries(CORS)) res.setHeader(k, v);
  res.end(JSON.stringify(obj));
}

export function ok(res, obj) { return json(res, obj, 200); }
export function bad(res, obj) { return json(res, obj, 400); }

export function isOptions(req) { return req.method === "OPTIONS"; }

export async function upstash(path) {
  const url = `${process.env.UPSTASH_REDIS_REST_URL}/${path}`;
  const r = await fetch(url, { headers: { "Authorization": `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}` }, cache: "no-store" });
  if (!r.ok) throw new Error("upstash error");
  return await r.json();
}
