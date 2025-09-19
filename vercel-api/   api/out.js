import { ok, bad, isOptions, json, upstash, CORS } from "../_utils.js";

export default async function handler(req, res) {
  if (isOptions(req)) { for (const [k,v] of Object.entries(CORS)) res.setHeader(k, v); return res.status(204).end(); }
  if (req.method !== "POST") return bad(res, { error: "Use POST" });
  try {
    // Decrement but clamp at 0
    const dec = await upstash("decr/online");
    let val = Number(dec.result || dec.result === 0 ? dec.result : dec);
    if (val < 0) {
      await upstash("set/online/0");
      val = 0;
    }
    return ok(res, { value: val });
  } catch (e) {
    return bad(res, { error: "upstash" });
  }
}
