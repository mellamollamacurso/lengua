/*! menu_links.js — cria hrefs no menu sem mudar o estilo/layout */
(function () {
  var GUIAS_BASE = "https://mellamollamacurso.github.io/lengua/guias/";
  var customRoutes = {
    "conoce el curso": "conoce_el_curso.html", // regra fixa
  };

  function norm(s){ return (s||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().trim(); }
  function slugify(label){
    label = norm(label).replace(/[^a-z0-9\s_-]+/g,"").replace(/\s+/g,"_");
    return label + ".html";
  }
  function getLabelText(node){
    if(!node) return "";
    var a = node.tagName==="A" ? node : node.querySelector("a");
    var base = a || node.cloneNode(true);
    if(base!==a){ base.querySelectorAll("svg,i,span.icon,.icon").forEach(function(n){ n.remove(); }); }
    return (base.textContent||"").trim();
  }
  function setLabelText(node, txt){
    var a = node.tagName==="A" ? node : node.querySelector("a");
    (a||node).textContent = txt;
  }
  function findMenuRoots(){
    var roots = Array.from(document.querySelectorAll("#menu, nav#menu, nav[role='navigation'], nav, .menu"));
    return roots.filter((el,i,arr)=>arr.indexOf(el)===i);
  }
  function topLevelOf(node, menuRoot){
    var cur = node;
    while(cur && cur!==menuRoot){
      if(cur.parentElement===menuRoot) return cur;
      cur = cur.parentElement;
    }
    return null;
  }
  function setHref(node, href){
    var a = node.tagName==="A" ? node : node.querySelector("a");
    if(!a){
      a = document.createElement("a");
      a.draggable = false;
      a.style.textDecoration = "none";
      a.style.color = "inherit";
      while(node.firstChild){ a.appendChild(node.firstChild); }
      node.appendChild(a);
    }
    a.href = href;
    a.style.textDecoration = "none";
    a.style.color = "inherit";
    a.addEventListener("click", function(e){ e.stopImmediatePropagation(); }, true);
    return a;
  }

  function applyRulesIn(menuRoot){
    var candidates = menuRoot.querySelectorAll("a, li, .nav-item, .submenu *, [data-item]");
    if(!candidates.length) candidates = menuRoot.querySelectorAll("*");
    candidates.forEach(function (el) {
      if(el.dataset && el.dataset.linked==="1") return;

      var label = getLabelText(el);
      var key   = norm(label);
      if(!key || key==="|" || key==="·" || key==="—") return;

      // Regra especial: Alumno > Materiales -> Archivos + archivos.html
      var top = topLevelOf(el, menuRoot);
      var topLabel = top ? norm(getLabelText(top)) : "";
      if(topLabel==="alumno" && key==="materiales"){
        setLabelText(el, "Archivos");
        setHref(el, GUIAS_BASE + "archivos.html");
        el.dataset.linked="1";
        return;
      }

      // Se já tem href, só normaliza a aparência
      var a = el.tagName==="A" ? el : el.querySelector("a[href]");
      if(a && a.getAttribute("href")){
        a.style.textDecoration="none";
        a.style.color="inherit";
        a.addEventListener("click", function(e){ e.stopImmediatePropagation(); }, true);
        el.dataset.linked="1";
        return;
      }

      // Custom route primeiro
      if(customRoutes[key]){
        setHref(el, GUIAS_BASE + customRoutes[key]);
        el.dataset.linked="1";
        return;
      }

      // Padrão
      setHref(el, GUIAS_BASE + slugify(label));
      el.dataset.linked="1";
    });
  }

  function ensureLinks(){
    findMenuRoots().forEach(applyRulesIn);
  }

  if(document.readyState==="loading"){
    document.addEventListener("DOMContentLoaded", ensureLinks);
  } else {
    ensureLinks();
  }

  var obs = new MutationObserver(function(){ ensureLinks(); });
  obs.observe(document.documentElement, {subtree:true, childList:true});

  window.MenuAutoLinker = {
    linkAll: ensureLinks,
    setCustom: function(label, file){ customRoutes[norm(label)] = file; },
    setBase: function(url){ GUIAS_BASE = url.replace(/\/+$/,'') + '/'; }
  };
})();
