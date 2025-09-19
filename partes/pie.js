// partes/pie.js — lógica del pie: versión + contadores
(function(){
  // ===== Versión automática (Pages Function /api/version) =====
  async function setVersionBadge(){
    const el = document.querySelector('.version-badge');
    if(!el) return;
    try{
      const r = await fetch('/api/version', { cache: 'no-store' });
      el.textContent = r.ok ? (await r.text()).trim() || 'v—' : 'v—';
    }catch{ el.textContent = 'v—'; }
  }

  // ===== Contadores (Cloudflare Worker) =====
  const API = 'https://mellamollama-contadores.mellamollamacurso.workers.dev';
  const elTotal  = () => document.getElementById('stat-total');
  const elOnline = () => document.getElementById('stat-online');
  const fmt = n => (n==null || isNaN(n)) ? '—' : new Intl.NumberFormat('es-ES').format(n);

  async function jget(path, opts){
    const r = await fetch(API + path, Object.assign({ cache:'no-store', mode:'cors' }, opts || {}));
    if(!r.ok) throw new Error('http ' + r.status);
    return await r.json();
  }

  async function initCounters(){
    const t = elTotal(), o = elOnline();
    if(!t || !o) return;

    try{
      const v = await jget('/visits'); // incrementa únicos
      t.textContent = fmt(v.value || 0);
    }catch{ t.textContent = '—'; }

    try{
      await jget('/online/in', { method:'POST', keepalive:true });
      const on = await jget('/online');
      o.textContent = fmt(on.value || 0);
    }catch{ o.textContent = '—'; }

    setInterval(async ()=>{
      try{
        const on2 = await jget('/online');
        const el = elOnline(); if (el) el.textContent = fmt(on2.value || 0);
      }catch{}
    }, 15000);
  }

  window.addEventListener('beforeunload', ()=>{
    try{ navigator.sendBeacon(API + '/online/out'); }catch{}
  });

  window.addEventListener('load', ()=>{
    setVersionBadge();
    setTimeout(initCounters, 200);
  });
})();
