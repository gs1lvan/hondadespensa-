// HondaDespensa · selección de paneles para la futura versión DEV.
// No modifica alimentos, permisos, Supabase ni transfiere código.
(function () {
  "use strict";
  const STORAGE_KEY = "hondadespensa:seleccion-dev:v1";
  const routes = {
    "pagina de inicio":"admin_inicio",
    "estilos":"admin_estilos",
    "anadir alimento":"admin_anadir",
    "alimentos de vuestra despensa":"admin_alimentos",
    "anadir catalogo de alimentos secos":"admin_catalogo_secos",
    "anadir desde el catalogo de alimentos frescos":"admin_catalogo_frescos",
    "administrar catalogo":"admin_catalogo_gestion",
    "compartir despensa":"admin_compartir",
    "despensa actual":"admin_despensa"
  };
  const choices = [
    ["pasar","Incluir en DEV"],
    ["optimizar","Incluir, pero optimizar"],
    ["no","Quitar de DEV"]
  ];
  let host, observer;
  const normalize = text => text.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/^[^a-z0-9]+/,"").trim().replace(/\s+/g," ");
  function read() {
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      return data && typeof data === "object" && !Array.isArray(data) ? data : {};
    } catch {
      return {};
    }
  }
  function write(id, decision) {
    const data = read();
    data[id] = decision;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return true;
    } catch { return false; }
  }
  function close(except) {
    host.querySelectorAll(".dev-picker-wrap").forEach(wrapper => {
      if(wrapper === except) return;
      wrapper.querySelector(".dev-picker").hidden = true;
      wrapper.querySelector(".dev-picker-trigger").setAttribute("aria-expanded","false");
    });
  }
  function update(wrapper) {
    const id = wrapper.dataset.devId;
    const value = read()[id] || "pendiente";
    const trigger = wrapper.querySelector(".dev-picker-trigger");
    trigger.dataset.devStatus = value;
    trigger.title = value === "pasar" ? "Marcado para incluir en DEV"
      : value === "optimizar" ? "Marcado para optimizar en DEV"
      : value === "no" ? "Excluido de DEV" : "Seleccionar para DEV";
    wrapper.querySelectorAll("button[data-decision]").forEach(option => {
      option.setAttribute("aria-pressed", String(option.dataset.decision === value));
    });
    wrapper.querySelector(".dev-picker-status").textContent =
      value === "pasar" ? "Incluido en selección DEV"
      : value === "optimizar" ? "Pendiente de optimización para DEV"
      : value === "no" ? "Excluido de selección DEV"
      : "Pendiente de decisión";
  }
  function mount(section) {
    if(section.dataset.devPanel !== undefined) return;
    const heading = section.querySelector(":scope > summary, :scope > h2");
    if(!heading) return;
    const title = heading.textContent.trim().replace(/\s+/g," ");
    const normalized = normalize(title);
    const id = routes[normalized] || "admin_extra_" + normalized.replace(/[^a-z0-9]+/g,"_").slice(0,48);
    section.dataset.devPanel = id;
    const wrapper = document.createElement("span");
    wrapper.className = "dev-picker-wrap";
    wrapper.dataset.devId = id;
    const trigger = document.createElement("button");
    trigger.type = "button";
    trigger.className = "dev-picker-trigger";
    trigger.textContent = "⋮";
    trigger.setAttribute("aria-label", "Opciones de DEV: " + title);
    trigger.setAttribute("aria-expanded","false");
    trigger.setAttribute("aria-haspopup","true");
    const menu = document.createElement("span");
    menu.className = "dev-picker";
    menu.hidden = true;
    const titleLine = document.createElement("strong");
    titleLine.className = "dev-picker-name";
    titleLine.textContent = title;
    menu.append(titleLine);
    for(const [value,label] of choices) {
      const button = document.createElement("button");
      button.type = "button";
      button.dataset.decision = value;
      button.textContent = label;
      button.addEventListener("click", event => {
        event.preventDefault(); event.stopPropagation();
        if (!write(id,value)) {
          wrapper.querySelector(".dev-picker-status").textContent = "No se pudo guardar en este navegador.";
          return;
        }
        update(wrapper);
        close();
        wrapper.querySelector(".dev-picker").hidden = true;
        trigger.setAttribute("aria-expanded","false");
        trigger.focus();
      });
      menu.append(button);
    }
    const stateLine = document.createElement("small");
    stateLine.className = "dev-picker-status";
    stateLine.setAttribute("role","status");
    menu.append(stateLine);
    const link = document.createElement("a");
    link.href = "./panel-versiones.html";
    link.textContent = "Abrir Centro de versiones";
    menu.append(link);
    const caution = document.createElement("small");
    caution.className = "dev-picker-note";
    caution.textContent = "Solo guarda tu decisión; no cambia PROD ni DEV.";
    menu.append(caution);
    wrapper.append(trigger,menu);
    // Los elementos de un <details> cerrado solo se ven si están en su <summary>.
    if(section.tagName === "DETAILS") heading.append(wrapper);
    else section.insertBefore(wrapper,heading);
    trigger.addEventListener("click", event => {
      event.preventDefault();
      event.stopPropagation();
      const willOpen = menu.hidden;
      close();
      update(wrapper);
      menu.hidden = !willOpen;
      trigger.setAttribute("aria-expanded",String(willOpen));
    });
    // Evita que <summary> se expanda/cierre al pulsar en la selección.
    wrapper.addEventListener("click", event => event.stopPropagation());
    update(wrapper);
  }
  function scan() {
    if(!host) return;
    host.querySelectorAll(":scope > .admin-section").forEach(mount);
  }
  function init() {
    host = document.getElementById("adminPanel");
    if(!host) return;
    const style = document.createElement("style");
    style.textContent = `
#adminPanel > .admin-section[data-dev-panel]{position:relative}
#adminPanel > .admin-section[data-dev-panel]:has(.dev-picker:not([hidden])){z-index:20}
#adminPanel > section.admin-section[data-dev-panel] > h2{padding-right:44px}
#adminPanel > details.admin-section[data-dev-panel] > summary{position:relative;padding-right:49px}
#adminPanel .dev-picker-wrap{position:absolute;right:8px;top:8px;display:block;z-index:6;line-height:1;font:normal 14px/1.4 system-ui,sans-serif}
#adminPanel details > summary > .dev-picker-wrap{top:50%;transform:translateY(-50%)}
#adminPanel .dev-picker-trigger{display:grid;place-items:center;min-height:34px;min-width:34px;width:34px;padding:0;border:1px solid var(--card-edge,#7196b6);border-radius:9px;color:var(--ink,#fff);background:var(--card-dark,#173047);font:700 22px/1 system-ui,sans-serif;box-shadow:none;cursor:pointer}
#adminPanel .dev-picker-trigger[data-dev-status="pasar"]{border-color:#77cb9c;box-shadow:inset 0 0 0 1px #77cb9c}
#adminPanel .dev-picker-trigger[data-dev-status="optimizar"]{border-color:#f0c373;box-shadow:inset 0 0 0 1px #f0c373}
#adminPanel .dev-picker-trigger[data-dev-status="no"]{opacity:.72}
#adminPanel .dev-picker{position:absolute;z-index:30;right:0;top:calc(100% + 5px);width:min(250px,calc(100vw - 40px));padding:11px;display:flex;flex-direction:column;gap:6px;background:#14283b;color:#eef5fa;border:1px solid #7a99b6;box-shadow:0 14px 35px #0008;border-radius:13px;text-align:left}
#adminPanel details > summary .dev-picker{top:calc(100% + 8px)}
#adminPanel .dev-picker[hidden]{display:none!important}
#adminPanel .dev-picker-name{font-size:13px;white-space:normal;line-height:1.35;padding:0 2px 4px}
#adminPanel .dev-picker button{padding:9px 10px;min-height:38px;width:100%;border:1px solid #496682;border-radius:8px;background:#263f54;color:#edf5fc;text-align:left;font:600 12px/1.3 system-ui,sans-serif;box-shadow:none}
#adminPanel .dev-picker button[aria-pressed="true"]{background:#305c4e;border-color:#80c8a3}
#adminPanel .dev-picker-status{color:#d1e0ec;font-size:11px;line-height:1.4;padding:3px 2px}
#adminPanel .dev-picker a{color:#acd3f6;text-decoration:underline;font:600 12px/1.4 system-ui,sans-serif;padding:2px}
#adminPanel .dev-picker-note{color:#a9c1d0;font-size:10px;line-height:1.35}
`;
    document.head.append(style);
    scan();
    observer = new MutationObserver(scan);
    observer.observe(host,{childList:true,subtree:true});
    document.addEventListener("click",event => {
      if(!event.target.closest(".dev-picker-wrap")) close();
    });
    document.addEventListener("keydown",event => {if(event.key === "Escape") close();});
    window.addEventListener("storage",event => {
      if(event.key === STORAGE_KEY) host.querySelectorAll(".dev-picker-wrap").forEach(update);
    });
    window.addEventListener("focus",() => host.querySelectorAll(".dev-picker-wrap").forEach(update));
  }
  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded",init,{once:true});
  else init();
})();
