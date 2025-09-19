// partes/pie.js — versão + contadores (compatível com GitHub Pages em subpasta)
(function(){
  // Detecta base do projeto (ex.: '/lengua' em mellamollamacurso.github.io/lengua/...)
  const parts = location.pathname.split('/').filter(Boolean);
  const BASE = parts.length ? '/' + parts[0] : ''; // '/lengua' ou ''

  // ===== versão automática (usa /api/version se estiver no Cloudflare Pages; em GH Pages cai no fallback) =====
  async function setVersionBadge(){
    const el = document.querySelector('.version-badge');
    if(!el) return;
    try{
      const r = await fetch(BASE + '/api/version', { cache: 'no-store' });
      if (r.ok) {
        const v = (await r.text()).trim();
        if (v) { el.textContent = v; return; }
      }
    }catch{ /* ignora */ }
    // Fallback em GitHub Pages (sem Functions)
    el.textContent = 'v—';
  }

  // ===== contadores (Cloudflare Worker) =====
  const API = 'https://mellamollama-contadores.mellamollamacurso.workers.dev';
  const fmt = n => (n==null || isNaN(n)) ? '—' : new Intl.NumberFormat('es-ES').format(n);

  async function jget(path, opts){
    const r = await fetch(API + path, Object.assign({ cache:'no-store', mode:'cors' }, opts || {}));
    if(!r.ok) throw new Error('http ' + r.status);
    return await r.json();
  }

  async function start(){
    // Garante que os elementos existam
    const totalEl  = document.getElementById('stat-total');
    const onlineEl = document.getElementById('stat-online');
    if (!totalEl || !onlineEl) return;

    try{
      const t = await jget('/visits');         // únicos
      totalEl.textContent = fmt(t.value || 0);
    }catch{ totalEl.textContent = '—'; }

    try{
      await jget('/online/in', { method:'POST', keepalive:true });
      const on = await jget('/online');
      onlineEl.textContent = fmt(on.value || 0);
    }catch{ onlineEl.textContent = '—'; }

    setInterval(async ()=>{
      try{
        const on2 = await jget('/online');
        onlineEl.textContent = fmt(on2.value || 0);
      }catch{}
    }, 15000);
  }

  window.addEventListener('beforeunload', ()=>{
    try{ navigator.sendBeacon(API + '/online/out'); }catch{}
  });

  window.addEventListener('load', ()=>{ setVersionBadge(); start(); });
})();
