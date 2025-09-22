/*! Auto-linker de menu — não altera layout, só injeta hrefs e impede sublinhado/azul */
(function(){
  var GUIAS_BASE = "https://mellamollamacurso.github.io/lengua/guias/";
  var customRoutes = {};

  function applyAlumnoMaterialesRule(el){
    try{
      var top = findTopLevelItem(el);
      if(!top) return false;
      var topLabel = getLabelText(top).toLowerCase().trim();
      var label = getLabelText(el).toLowerCase().trim();
      if(topLabel === "alumno" && label === "materiales"){
        setLabelText(el, "Archivos");
        setHref(el, GUIAS_BASE + "archivo.html");
        return true;
      }
    }catch(e){}
    return false;
  }

  function norm(s){ return (s||"").normalize("NFD").replace(/[\u0300-\u036f]/g,""); }
  function slugify(label){
    label = norm(label).toLowerCase().trim();
    label = label.replace(/[^a-z0-9\s_-]+/g,"");
    label = label.replace(/\s+/g,"_");
    return label + ".html";
  }

  function getLabelText(node){
    if(!node) return "";
    if(node.tagName === "A") return (node.textContent||"").trim();
    var clone = node.cloneNode(true);
    clone.querySelectorAll("svg, i, span.icon, .icon").forEach(function(n){ n.remove(); });
    return (clone.textContent||"").trim();
  }

  function setLabelText(node, newText){
    if(node.tagName === "A"){ node.textContent = newText; return; }
    var a = node.querySelector("a");
    if(a){ a.textContent = newText; return; }
    node.textContent = newText;
  }

  function findTopLevelItem(node){
    var menu = document.getElementById("menu") || document.querySelector("nav#menu, .menu, nav[role='navigation']");
    if(!menu) return null;
    var cur = node;
    while(cur && cur !== menu){
      if(cur.parentElement === menu) return cur;
      cur = cur.parentElement;
    }
    return null;
  }

  function setHref(node, href){
    var a = node.tagName === "A" ? node : node.querySelector("a");
    if(a){
      a.setAttribute("href", href);
      a.style.textDecoration = "none";
      a.style.color = "inherit";
      a.setAttribute("draggable","false");
      return a;
    }
    var wrap = document.createElement("a");
    wrap.href = href;
    wrap.style.textDecoration = "none";
    wrap.style.color = "inherit";
    wrap.draggable = false;
    wrap.className = node.className || "";
    while(node.firstChild){ wrap.appendChild(node.firstChild); }
    node.appendChild(wrap);
    return wrap;
  }

  function ensureLinks(){
    var menuRoot = document.getElementById("menu") || document.querySelector("nav#menu, .menu, nav[role='navigation']");
    if(!menuRoot) return;
    var candidates = menuRoot.querySelectorAll("li, .nav-item, .submenu li, .submenu .item, [data-item], a");
    if(!candidates.length){ candidates = menuRoot.querySelectorAll("*"); }

    candidates.forEach(function(el){
      if(el.dataset && el.dataset.linked === "1") return;
      var label = getLabelText(el);
      if(!label) return;
      var key = norm(label).toLowerCase().trim();
      if(key === "" || key === "|" || key === "·" || key === "—") return;

      if(applyAlumnoMaterialesRule(el)){ el.dataset.linked = "1"; return; }

      var a = el.tagName==="A" ? el : el.querySelector("a[href]");
      if(a && a.getAttribute("href")){
        a.style.textDecoration = "none";
        a.style.color = "inherit";
        el.dataset.linked = "1";
        return;
      }

      if(customRoutes[key]){
        setHref(el, GUIAS_BASE + customRoutes[key]);
        el.dataset.linked = "1";
        return;
      }

      setHref(el, GUIAS_BASE + slugify(label));
      el.dataset.linked = "1";
    });
  }

  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", ensureLinks);
  }else{
    ensureLinks();
  }

  window.MenuAutoLinker = {
    linkAll: ensureLinks,
    setCustom: function(label, file){ customRoutes[norm(label).toLowerCase().trim()] = file; },
    setBase: function(url){ GUIAS_BASE = url.replace(/\/+$/,'') + '/'; }
  };
})();