import { ok, bad, isOptions, json, upstash, CORS } from "./_utils.js";

export default async function handler(req, res) {
  if (isOptions(req)) { for (const [k,v] of Object.entries(CORS)) res.setHeader(k, v); return res.status(204).end(); }
  if (req.method !== "GET") return bad(res, { error: "Use GET" });
  try {
    const r = await upstash("get/online");
    const val = r.result == null ? 0 : Number(r.result);
    return ok(res, { value: isNaN(val) ? 0 : val });
  } catch (e) {
    return bad(res, { error: "upstash" });
  }
}
