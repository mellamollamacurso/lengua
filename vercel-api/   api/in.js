import { ok, bad, isOptions, json, upstash, CORS } from "../_utils.js";

export default async function handler(req, res) {
  if (isOptions(req)) { for (const [k,v] of Object.entries(CORS)) res.setHeader(k, v); return res.status(204).end(); }
  if (req.method !== "POST") return bad(res, { error: "Use POST" });
  try {
    const r = await upstash("incr/online");
    return ok(res, { value: Number(r.result || r.result === 0 ? r.result : r) });
  } catch (e) {
    return bad(res, { error: "upstash" });
  }
}
