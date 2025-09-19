// partes/pie.js — lógica do pie (versão + contadores)
(function(){
  // ===== versão automática =====
  async function setVersionBadge(){
    const el = document.querySelector('.version-badge');
    if(!el) return;
    try{
      const r = await fetch('/api/version', { cache:'no-store' });
      el.textContent = r.ok ? (await r.text()).trim() || 'v—' : 'v—';
    }catch{ el.textContent = 'v—'; }
  }

  // ===== util: esperar elementos existirem (caso pie seja injetado após load) =====
  function waitFor(sel, timeout = 10000){
    return new Promise((resolve, reject)=>{
      const found = document.querySelector(sel);
      if(found) return resolve(found);
      const obs = new MutationObserver(()=>{
        const el = document.querySelector(sel);
        if(el){ obs.disconnect(); resolve(el); }
      });
      obs.observe(document.documentElement, {childList:true, subtree:true});
      setTimeout(()=>{ obs.disconnect(); reject(new Error('timeout')); }, timeout);
    });
  }

  // ===== contadores =====
  const API = 'https://mellamollama-contadores.mellamollamacurso.workers.dev';
  const fmt = n => (n==null || isNaN(n)) ? '—' : new Intl.NumberFormat('es-ES').format(n);
  async function jget(path, opts){
    const r = await fetch(API + path, Object.assign({ cache:'no-store', mode:'cors' }, opts || {}));
    if(!r.ok) throw new Error('http ' + r.status);
    return await r.json();
  }

  async function start(){
    setVersionBadge();
    let totalEl, onlineEl;
    try{
      totalEl  = await waitFor('#stat-total');
      onlineEl = await waitFor('#stat-online');
    }catch{ return; }

    try{
      const t = await jget('/visits');
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

  window.addEventListener('load', start);
})();
