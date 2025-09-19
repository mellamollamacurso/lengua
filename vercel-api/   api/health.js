import { ok, isOptions, CORS } from "./_utils.js";
export default async function handler(req, res) {
  if (isOptions(req)) { for (const [k,v] of Object.entries(CORS)) res.setHeader(k, v); return res.status(204).end(); }
  return ok(res, { ok: true });
}
