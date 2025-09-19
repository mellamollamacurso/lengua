<!-- /partes/pie.js -->
<script>
(function () {
  // ===== versão do deploy (Pages Function) =====
  async function setVersionBadge() {
    const el = document.querySelector('.version-badge');
    if (!el) return;
    try {
      const r = await fetch('/api/version', { cache: 'no-store' });
      el.textContent = r.ok ? (await r.text()).trim() || 'v—' : 'v—';
    } catch { el.textContent = 'v—'; }
  }

  // ===== util: esperar elemento aparecer =====
  function waitFor(sel, timeout = 10000) {
    return new Promise((resolve, reject) => {
      const found = document.querySelector(sel);
      if (found) return resolve(found);
      const obs = new MutationObserver(() => {
        const el = document.querySelector(sel);
        if (el) { obs.disconnect(); resolve(el); }
      });
      obs.observe(document.documentElement, { childList: true, subtree: true });
      setTimeout(() => { obs.disconnect(); reject(new Error('timeout')); }, timeout);
    });
  }

  // ===== contadores =====
  const API = 'https://mellamollama-contadores.mellamollamacurso.workers.dev';
  const fmt = n => (n == null || isNaN(n)) ? '—' : new Intl.NumberFormat('es-ES').format(n);
  async function jget(path, opts) {
    const r = await fetch(API + path, Object.assign({ cache: 'no-store', mode: 'cors' }, opts || {}));
    if (!r.ok) throw new Error('http ' + r.status);
    return r.headers.get('content-type')?.includes('json') ? r.json() : r.text();
  }

  async function startCounters(totalEl, onlineEl) {
    try {
      const v = await jget('/visits');              // únicos
      const vv = typeof v === 'string' ? JSON.parse(v) : v;
      totalEl.textContent = fmt(vv.value || 0);
    } catch { totalEl.textContent = '—'; }

    try {
      await jget('/online/in', { method: 'POST', keepalive: true });
      const on = await jget('/online');
      const oo = typeof on === 'string' ? JSON.parse(on) : on;
      onlineEl.textContent = fmt(oo.value || 0);
    } catch { onlineEl.textContent = '—'; }

    // refresh periódico
    setInterval(async () => {
      try {
        const on = await jget('/online');
        const oo = typeof on === 'string' ? JSON.parse(on) : on;
        onlineEl.textContent = fmt(oo.value || 0);
      } catch {}
    }, 15000);
  }

  // ===== boot =====
  window.addEventListener('beforeunload', () => {
    try { navigator.sendBeacon(API + '/online/out'); } catch {}
  });

  window.addEventListener('load', async () => {
    setVersionBadge();
    try {
      const totalEl  = await waitFor('#stat-total');
      const onlineEl = await waitFor('#stat-online');
      startCounters(totalEl, onlineEl);
    } catch {
      // se o pie não existir nesta página, apenas ignore
    }
  });
})();
</script>
