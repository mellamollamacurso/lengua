// functions/api/version.js
// Gera versão automática v0.xx baseada em deploys do Cloudflare Pages.
// Usa KV para guardar o último commit e o número da versão.

// Binding esperado em Settings > Functions > Bindings: COUNTERS -> mellamollama-contadores-kv
export async function onRequestGet(context) {
  const kv = context.env.COUNTERS;
  const sha = context.env.CF_PAGES_COMMIT_SHA || "dev";
  const keyLast = "version:last_sha";
  const keyMinor = "version:minor";

  // versão inicial (v0.30)
  let minorStr = await kv.get(keyMinor);
  let minor = Number.parseInt(minorStr || "30");

  const last = await kv.get(keyLast);

  if (!last) {
    // Primeiro deploy
    await kv.put(keyLast, sha);
    if (minorStr == null) await kv.put(keyMinor, String(minor));
  } else if (sha && sha !== last) {
    // Novo commit → incrementa versão
    minor = Number.isFinite(minor) ? (minor + 1) : 0;
    await kv.put(keyMinor, String(minor));
    await kv.put(keyLast, sha);
  }

  const version = `v0.${String(minor).padStart(2, "0")}`;
  return new Response(version, {
    headers: {
      "content-type": "text/plain; charset=UTF-8",
      "cache-control": "no-store"
    }
  });
}
