(function(){var c=document.getElementById("cargando");if(c)c.remove();document.body.insertAdjacentHTML("beforeend","<header>\n  <div class=\"wrap\">\n    <div class=\"top\">\n      <h1>Reparto entre hermanos</h1>\n      <div class=\"who\" role=\"group\" aria-label=\"Qui\u00e9n est\u00e1 eligiendo\">\n        <span>Soy:</span>\n        <button class=\"pbtn\" data-p=\"Ric\" id=\"who-Ric\">Ric</button>\n        <button class=\"pbtn\" data-p=\"Win\" id=\"who-Win\">Win</button>\n        <button class=\"pbtn\" data-p=\"San\" id=\"who-San\">San</button>\n        <button class=\"pbtn\" data-p=\"Jac\" id=\"who-Jac\">Jac</button>\n      </div>\n    </div>\n    <div class=\"tot\" id=\"tot\"></div>\n    <nav role=\"tablist\" id=\"tabs\">\n      <button role=\"tab\" data-t=\"cat\" aria-selected=\"true\" id=\"tab-cat\">Cat\u00e1logo</button>\n      <button role=\"tab\" data-t=\"mine\" id=\"tab-mine\">Mis elecciones</button>\n      <button role=\"tab\" data-t=\"disp\" id=\"tab-disp\">En disputa <span class=\"badge\" id=\"nd\" hidden></span></button>\n      <button role=\"tab\" data-t=\"sum\" id=\"tab-sum\">Resumen</button>\n    </nav>\n  </div>\n</header>\n\n<main class=\"wrap\" id=\"main\">\n  <div class=\"empty\" id=\"loading\">Cargando el cat\u00e1logo\u2026</div>\n</main>\n\n<dialog id=\"dlg\"></dialog>\n<div class=\"toast\" id=\"toast\" hidden></div>\n\n");})();
const PEOPLE=["Ric","Win","San","Jac"];
const PC={Ric:"var(--ric)",Win:"var(--win)",San:"var(--san)",Jac:"var(--jac)"};
const CATS=["Joyas y relojes","Platería y bronce","Porcelana y figuras","Cristalería","Vajilla y cerámica","Cuadros y grabados","Fotos familiares","Muebles","Lámparas y relojes","Decoración y objetos","Galpón y campo","Para regalar"];
const GIFT="Para regalar";
const PIX="data:image/gif;base64,R0lGODlhAQABAAAAACw=";
const S={base:{},items:{},picks:{Ric:{},Win:{},San:{},Jac:{}},cambios:{},me:null,tab:"cat",cat:"",q:"",room:"",sort:"o",hideTaken:false,showHidden:false,api:null,key:null,loaded:false};
const $=s=>document.querySelector(s);
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const usd=n=>"US$ "+Math.round(+n||0).toLocaleString("es-AR");
try{const m=localStorage.getItem("reparto_me");if(PEOPLE.includes(m))S.me=m;}catch(e){}

/* ---------- cifrado: la clave viene en el link (#k=...) ---------- */
function b64u(s){s=s.replace(/-/g,"+").replace(/_/g,"/");while(s.length%4)s+="=";return Uint8Array.from(atob(s),c=>c.charCodeAt(0));}
const R=window.REPARTO||{};
const BASEURL=R.base||"";
async function getKey(){
  const k=R.k;if(!k)return null;
  return crypto.subtle.importKey("raw",b64u(k),"AES-GCM",false,["decrypt"]);
}
/* llamadas al script de Google (google.script.run) */
function gs(fn,arg){return new Promise((ok,ko)=>{const r=google.script.run.withSuccessHandler(ok).withFailureHandler(ko);arg===undefined?r[fn]():r[fn](arg);});}
async function dec(buf){const u=new Uint8Array(buf);return crypto.subtle.decrypt({name:"AES-GCM",iv:u.slice(0,12)},S.key,u.slice(12));}
const imgCache={};
function loadImg(f){
  if(!imgCache[f])imgCache[f]=fetch(BASEURL+"i/"+f.replace(/\.jpg$/,".bin")+"?v=1795193539").then(r=>r.arrayBuffer()).then(dec).then(b=>URL.createObjectURL(new Blob([b],{type:"image/jpeg"})));
  return imgCache[f];
}
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){io.unobserve(e.target);hydrate(e.target);}}),{rootMargin:"400px"});
function hydrate(el){const f=el.dataset.f;if(!f)return;loadImg(f).then(u=>{el.src=u;el.removeAttribute("data-f");}).catch(()=>{});}
function watchImgs(root){(root||document).querySelectorAll("img[data-f]").forEach(el=>io.observe(el));}
function fileOf(i,k=0){return i.ph&&i.ph.length?i.ph[k]:"";}

function toast(t){const el=$("#toast");el.textContent=t;el.hidden=false;clearTimeout(toast.t);toast.t=setTimeout(()=>el.hidden=true,2600);}
function merge(){const o={};for(const id in S.base)o[id]={...S.base[id],...(S.cambios[id]||{})};S.items=o;}
function list(){return Object.values(S.items).sort((a,b)=>(a.o??0)-(b.o??0));}
function visible(){return list().filter(i=>!i.h);}
function pickers(id){return PEOPLE.filter(p=>S.picks[p][id]);}
function imgTag(i,cls=""){const f=fileOf(i);return f?`<img ${cls?`class="${cls}"`:""} src="${PIX}" data-f="${esc(f)}" alt="">`:"";}

function setMe(p){S.me=p;try{localStorage.setItem("reparto_me",p)}catch(e){}render();}
document.querySelectorAll(".pbtn").forEach(b=>{b.style.setProperty("--pc",PC[b.dataset.p]);b.onclick=()=>setMe(b.dataset.p);});
document.querySelectorAll("#tabs button").forEach(b=>b.onclick=()=>{S.tab=b.dataset.t;render();});

function totals(){
  const t={};PEOPLE.forEach(p=>t[p]={n:0,v:0});
  for(const i of visible())for(const p of pickers(i.id)){t[p].n++;t[p].v+=+i.p||0;}
  return t;
}
function disputed(){return visible().filter(i=>pickers(i.id).length>1);}

function render(){
  document.querySelectorAll(".pbtn").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.p===S.me)));
  document.documentElement.style.setProperty("--me",S.me?PC[S.me]:"var(--accent)");
  document.querySelectorAll("#tabs button").forEach(b=>b.setAttribute("aria-selected",String(b.dataset.t===S.tab)));
  const t=totals();
  $("#tot").innerHTML=PEOPLE.map(p=>`<div class="tbox" style="--pc:${PC[p]}"><b>${p}${p===S.me?" · vos":""}</b>${t[p].n} artículos · ${usd(t[p].v)}</div>`).join("");
  const nd=disputed().length;$("#nd").hidden=!nd;$("#nd").textContent=nd;
  if(!S.loaded)return;
  const m=$("#main");
  if(S.tab==="cat")m.innerHTML=viewCat();
  else if(S.tab==="mine")m.innerHTML=viewMine();
  else if(S.tab==="disp")m.innerHTML=viewDisp();
  else m.innerHTML=viewSum();
  bind();watchImgs(m);
}

function priceTag(i,style=""){return `<div class="price${i.ps==="foto"?"":" est"}"${style?` style="${style}"`:""}>${usd(i.p)}</div>`;}
function card(i){
  const ps=pickers(i.id),mine=S.me&&ps.includes(S.me);
  return `<article class="card${mine?" mine":""}">
    <button class="ph" data-open="${esc(i.id)}" aria-label="Ver ${esc(i.n)}">${imgTag(i)}${i.ph&&i.ph.length>1?`<span class="n">${i.ph.length} fotos</span>`:""}</button>
    <div class="body">
      <div class="meta"><span>${esc(i.c)}</span><span>${esc(i.r||"")}</span></div>
      <div class="name">${esc(i.n)}${i.h?" <small>(oculto)</small>":""}</div>
      ${priceTag(i)}
      <div class="row">
        <div class="dots">${ps.map(p=>`<span class="dot" style="--pc:${PC[p]}" title="${p}">${p}</span>`).join("")}</div>
        <button class="pick" data-pick="${esc(i.id)}" aria-pressed="${mine}" ${S.me?"":"disabled"}>${mine?"✓ Elegido":"Lo quiero"}</button>
      </div>
    </div></article>`;
}

function viewCat(){
  const rooms=[...new Set(list().map(i=>i.r).filter(Boolean))].sort();
  let xs=(S.showHidden?list():visible()).filter(i=>(!S.cat||i.c===S.cat)&&(!S.room||i.r===S.room));
  if(S.q){const q=S.q.toLowerCase();xs=xs.filter(i=>(i.n+" "+i.d+" "+i.r).toLowerCase().includes(q));}
  if(S.hideTaken)xs=xs.filter(i=>!pickers(i.id).some(p=>p!==S.me));
  if(S.sort==="pd")xs.sort((a,b)=>(b.p||0)-(a.p||0));else if(S.sort==="pa")xs.sort((a,b)=>(a.p||0)-(b.p||0));
  const counts={};visible().forEach(i=>counts[i.c]=(counts[i.c]||0)+1);
  return `${S.me?"":`<div class="note"><b>Primero elegí quién sos</b> arriba (Ric, Win, San o Jac). Después tocá «Lo quiero» en lo que te interese. Pueden elegir lo mismo varios; eso se resuelve en «En disputa».</div>`}
  <div class="bar">
    <input type="search" id="q" placeholder="Buscar (ej. plata, cuadro, mesa)" value="${esc(S.q)}" aria-label="Buscar">
    <select id="room" aria-label="Ambiente"><option value="">Todos los ambientes</option>${rooms.map(r=>`<option ${r===S.room?"selected":""}>${esc(r)}</option>`).join("")}</select>
    <select id="sort" aria-label="Ordenar"><option value="o">Orden por tipo</option><option value="pd" ${S.sort==="pd"?"selected":""}>Precio mayor a menor</option><option value="pa" ${S.sort==="pa"?"selected":""}>Precio menor a mayor</option></select>
    <label class="chip"><input type="checkbox" id="ht" ${S.hideTaken?"checked":""}> Ocultar lo que ya eligió otro</label>
    <label class="chip"><input type="checkbox" id="sh" ${S.showHidden?"checked":""}> Ver ocultos</label>
  </div>
  <div class="legend"><span class="price">US$ 100</span><span>precio que estaba escrito en la foto o lista</span><span class="price est">US$ 100</span><span>precio estimado, sin tasar</span></div>
  <div class="chips" style="margin-bottom:14px">
    <button class="chip" data-cat="" aria-pressed="${!S.cat}">Todo (${visible().length})</button>
    ${CATS.filter(c=>counts[c]||c===GIFT).map(c=>`<button class="chip" data-cat="${esc(c)}" aria-pressed="${S.cat===c}">${c===GIFT?"🎁 ":""}${esc(c)} (${counts[c]||0})</button>`).join("")}
  </div>
  ${xs.length?`<div class="grid">${xs.map(card).join("")}</div>`:`<div class="empty">No hay artículos con ese filtro.</div>`}`;
}

function viewMine(){
  if(!S.me)return `<div class="note"><b>Elegí quién sos</b> arriba para ver tus elecciones.</div>`;
  const xs=visible().filter(i=>S.picks[S.me][i.id]);
  const tot=xs.reduce((s,i)=>s+(+i.p||0),0);
  return `<div class="note"><b>${S.me}: ${xs.length} artículos · ${usd(tot)}</b>. Los que también eligió otro hermano están marcados con sus iniciales.</div>
  ${xs.length?`<div class="grid">${xs.map(card).join("")}</div>`:`<div class="empty">Todavía no elegiste nada. Andá al Catálogo y tocá «Lo quiero».</div>`}`;
}

function viewDisp(){
  const xs=disputed();
  if(!xs.length)return `<div class="empty">No hay artículos elegidos por más de un hermano.</div>`;
  const opt=i=>`<select data-asg="${esc(i.id)}" aria-label="Queda para"><option value="">Sin resolver</option>${pickers(i.id).concat(PEOPLE.filter(p=>!pickers(i.id).includes(p))).map(p=>`<option value="${p}" ${i.a===p?"selected":""}>Queda para ${p}</option>`).join("")}<option value="sorteo" ${i.a==="sorteo"?"selected":""}>Va a sorteo</option></select>`;
  const pend=xs.filter(i=>!i.a).length;
  return `<div class="note"><b>${xs.length} artículos elegidos por más de uno</b> · ${pend} sin resolver. Cuando lo decidan, marquen para quién queda.</div>
  ${xs.map(i=>`<div class="disp"><button class="ph" style="background:none" data-open="${esc(i.id)}" aria-label="Ver ${esc(i.n)}">${imgTag(i)}</button>
    <div style="min-width:0"><div class="name">${esc(i.n)}</div>${priceTag(i)}
    <div class="dots" style="margin-top:4px">${pickers(i.id).map(p=>`<span class="dot" style="--pc:${PC[p]}">${p}</span>`).join("")}</div></div>
    ${opt(i)}</div>`).join("")}`;
}

function viewSum(){
  const t=totals(),all=visible();
  const total=all.reduce((s,i)=>s+(+i.p||0),0);
  const none=all.filter(i=>!pickers(i.id).length);
  const solo=p=>all.filter(i=>{const ps=pickers(i.id);return ps.length===1&&ps[0]===p;});
  const fin=p=>solo(p).concat(all.filter(i=>i.a===p&&pickers(i.id).length>1));
  return `<div class="note">Valor total del catálogo: <b>${usd(total)}</b> en ${all.length} artículos. Una cuarta parte serían <b>${usd(total/4)}</b> por hermano. La mayoría de los precios son estimados.</div>
  <div class="sum">${PEOPLE.map(p=>{const f=fin(p),fv=f.reduce((s,i)=>s+(+i.p||0),0);return `<div class="sbox" style="--pc:${PC[p]}"><h3>${p}</h3><dl>
    <dt>Eligió</dt><dd>${t[p].n} · ${usd(t[p].v)}</dd>
    <dt>Solo él/ella lo quiere</dt><dd>${solo(p).length}</dd>
    <dt>Le queda (sin disputas + resueltas)</dt><dd>${f.length} · ${usd(fv)}</dd>
    <dt>Diferencia con ¼</dt><dd style="color:${fv-total/4>0?"var(--warn)":"var(--ok)"}">${fv-total/4>0?"+":""}${usd(fv-total/4)}</dd></dl></div>`}).join("")}</div>
  <h2>Nadie lo eligió (${none.length})</h2>
  ${none.length?`<div class="tw"><table><thead><tr><th></th><th>Artículo</th><th>Tipo</th><th class="r">Precio</th></tr></thead><tbody>
  ${none.map(i=>`<tr><td>${imgTag(i,"thumb")}</td><td><button class="chip" data-open="${esc(i.id)}">${esc(i.n)}</button></td><td>${esc(i.c)}</td><td class="r">${usd(i.p)}${i.ps==="foto"?"":" <small>estimado</small>"}</td></tr>`).join("")}
  </tbody></table></div>`:`<div class="empty">Todo tiene al menos un interesado.</div>`}`;
}

function bind(){
  document.querySelectorAll("[data-open]").forEach(b=>b.onclick=()=>openItem(b.dataset.open));
  document.querySelectorAll("[data-pick]").forEach(b=>b.onclick=()=>togglePick(b.dataset.pick));
  document.querySelectorAll("[data-cat]").forEach(b=>b.onclick=()=>{S.cat=b.dataset.cat;render();});
  document.querySelectorAll("[data-asg]").forEach(s=>s.onchange=()=>saveItem(s.dataset.asg,{a:s.value||null},"Guardado"));
  const q=$("#q");if(q){q.oninput=()=>{S.q=q.value;clearTimeout(bind.t);bind.t=setTimeout(()=>{const pos=q.selectionStart;render();const n=$("#q");n.focus();n.setSelectionRange(pos,pos);},250);};}
  const r=$("#room");if(r)r.onchange=()=>{S.room=r.value;render();};
  const so=$("#sort");if(so)so.onchange=()=>{S.sort=so.value;render();};
  const ht=$("#ht");if(ht)ht.onchange=()=>{S.hideTaken=ht.checked;render();};
  const sh=$("#sh");if(sh)sh.onchange=()=>{S.showHidden=sh.checked;render();};
}

/* ---------- datos (planilla de Google vía Apps Script) ---------- */
let pending=0;
function applyState(st){if(!st||pending)return;S.picks={Ric:{},Win:{},San:{},Jac:{},...(st.picks||{})};S.cambios=st.cambios||{};merge();}
async function pull(){
  try{applyState(JSON.parse(await gs("apiEstado")));if(!$("#dlg").open)render();}catch(e){}
}
async function post(body){
  pending++;
  try{
    const st=JSON.parse(await gs("apiGuardar",JSON.stringify(body)));pending--;
    applyState(st);return true;
  }catch(e){pending=Math.max(0,pending-1);toast("No se pudo guardar, revisá la conexión y probá de nuevo.");return false;}
}
async function togglePick(id){
  if(!S.me){toast("Primero elegí quién sos");return;}
  const now=!S.picks[S.me][id];
  S.picks[S.me]={...S.picks[S.me],[id]:now};render();
  if(!await post({accion:"elegir",persona:S.me,id,valor:now})){S.picks[S.me]={...S.picks[S.me],[id]:!now};}
  render();
}
async function saveItem(id,patch,msg){
  S.cambios[id]={...(S.cambios[id]||{}),...patch};merge();render();
  if(await post({accion:"editar",id,cambios:patch})&&msg)toast(msg);
  render();
}

/* ---------- ficha ---------- */
function openItem(id){
  const i=S.items[id];if(!i)return;const d=$("#dlg");let k=0;
  const ps=pickers(id),mine=S.me&&ps.includes(S.me);
  d.innerHTML=`<button class="x" id="dx" aria-label="Cerrar">×</button><div class="dlg">
   <div class="gal"><div class="big">${i.ph&&i.ph.length?`<img id="big" src="${PIX}" data-f="${esc(i.ph[0])}" alt="${esc(i.n)}">`:`<span class="empty">Sin foto</span>`}</div>
   ${i.ph&&i.ph.length>1?`<div class="strip">${i.ph.map((f,j)=>`<button data-k="${j}" aria-current="${j===0}" aria-label="Foto ${j+1}"><img src="${PIX}" data-f="${esc(f)}" alt=""></button>`).join("")}</div>`:""}</div>
   <div class="info">
     <h3>${esc(i.n)}</h3>
     ${priceTag(i,"font-size:18px")}
     <div>${esc(i.d)}</div>
     ${i.ref?`<div class="ref"><b>De dónde sale el precio:</b> ${esc(i.ref)}${i.refu?` <a href="${esc(i.refu)}" target="_blank" rel="noopener noreferrer">Ver referencia ↗</a>`:""}</div>`:""}
     <div class="meta"><span>${esc(i.c)}</span><span>${esc(i.r||"")}</span></div>
     <div class="dots">${ps.map(p=>`<span class="dot" style="--pc:${PC[p]}">${p}</span>`).join("")||`<small style="color:var(--muted)">Nadie lo eligió todavía</small>`}</div>
     <button class="pick" id="dpick" aria-pressed="${mine}" ${S.me?"":"disabled"}>${mine?"✓ Elegido":"Lo quiero"}</button>
     <button class="btn ghost" id="dgift" type="button">${i.c===GIFT?"Sacar de «Para regalar»":"🎁 Pasar a «Para regalar»"}</button>
     <details><summary style="cursor:pointer;color:var(--muted)">Editar datos del artículo</summary>
      <form id="ef" style="display:flex;flex-direction:column;gap:8px;margin-top:8px">
       <label>Nombre<input id="e-n" value="${esc(i.n)}"></label>
       <label>Descripción<textarea id="e-d">${esc(i.d)}</textarea></label>
       <label>Categoría<select id="e-c">${CATS.map(c=>`<option ${c===i.c?"selected":""}>${esc(c)}</option>`).join("")}</select></label>
       <label>Ambiente<input id="e-r" value="${esc(i.r||"")}"></label>
       <label>Precio (US$)<input id="e-p" type="number" min="0" step="10" value="${+i.p||0}"></label>
       <label>Origen del precio<select id="e-ps"><option value="est" ${i.ps!=="foto"?"selected":""}>Estimado</option><option value="foto" ${i.ps==="foto"?"selected":""}>Escrito / tasado</option></select></label>
       <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn" type="submit">Guardar cambios</button>
       <button class="btn danger" type="button" id="e-h">${i.h?"Volver a mostrar":"Ocultar del catálogo"}</button></div>
      </form></details>
   </div></div>`;
  d.showModal();watchImgs(d);
  $("#dx").onclick=()=>d.close();
  d.onclick=e=>{if(e.target===d)d.close();};
  d.querySelectorAll("[data-k]").forEach(b=>b.onclick=()=>{k=+b.dataset.k;loadImg(i.ph[k]).then(u=>$("#big").src=u);d.querySelectorAll("[data-k]").forEach(x=>x.setAttribute("aria-current",String(+x.dataset.k===k)));});
  $("#dpick").onclick=async()=>{await togglePick(id);openItem(id);};
  $("#dgift").onclick=()=>{const toGift=i.c!==GIFT;saveItem(id,toGift?{c:GIFT,pc:i.c}:{c:i.pc&&i.pc!==GIFT?i.pc:"Decoración y objetos"},toGift?"Pasado a «Para regalar»":"Sacado de «Para regalar»");d.close();};
  $("#ef").onsubmit=e=>{e.preventDefault();saveItem(id,{n:$("#e-n").value.trim()||i.n,d:$("#e-d").value.trim(),c:$("#e-c").value,r:$("#e-r").value.trim(),p:Math.max(0,+$("#e-p").value||0),ps:$("#e-ps").value},"Cambios guardados");d.close();};
  $("#e-h").onclick=()=>{saveItem(id,{h:!i.h},i.h?"Visible otra vez":"Oculto del catálogo");d.close();};
}

/* ---------- arranque ---------- */
render();
(async()=>{
  try{
    S.key=await getKey();
    if(!S.key)throw new Error("sin clave");
    const data=JSON.parse(new TextDecoder().decode(await dec(await (await fetch(BASEURL+"d.bin?v="+Date.now())).arrayBuffer())));
    data.items.forEach(i=>S.base[i.id]=i);merge();S.loaded=true;render();
    if(window.google&&google.script){await pull();setInterval(pull,15000);
      document.addEventListener("visibilitychange",()=>{if(!document.hidden)pull();});}
  }catch(e){
    S.loaded=true;$("#main").innerHTML=`<div class="empty">No se pudo abrir el catálogo. Entrá con el link de Google que te pasaron.</div>`;
  }
})();
