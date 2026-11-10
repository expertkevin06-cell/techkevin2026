"use strict";
const SelfTest = (() => {
  let LAST=[];
  const G={CONFIG:()=>CONFIG,Store:()=>Store,Session:()=>Session,Auth:()=>Auth,DT:()=>DT,TSB:()=>TSB,Recalls:()=>Recalls,Updater:()=>Updater,Veille:()=>Veille,PDF:()=>PDF,Wallpaper:()=>Wallpaper,Bus:()=>Bus,IDB:()=>IDB,BRANDS:()=>BRANDS,CATS:()=>CATS,resolveFiche:()=>resolveFiche,systemFaultsFor:()=>systemFaultsFor,App:()=>App};
  function ev(n,f){ try{ const v=f(); if(v===true) return {name:n,ok:true,detail:""}; if(v&&v.ok) return {name:n,ok:true,detail:v.detail||""}; return {name:n,ok:false,detail:(v&&v.detail)||"échec"}; }catch(e){ return {name:n,ok:false,detail:e.message}; } }
  async function run(){ LAST=[];
    LAST.push(ev("Globals présents",()=>{ const m=[]; for(const k of Object.keys(G)){ try{ G[k](); }catch(e){ m.push(k); } } return m.length?{ok:false,detail:"manquants : "+m.join(", ")}:{ok:true,detail:Object.keys(G).length+" globals OK"}; }));
    LAST.push(ev("Scripts JS inclus",()=>{ const want=["config","store","bus","auth","data","recalls","tsb","veille","wallpaper","updater","pdf","selftest","app"]; const srcs=Array.from(document.scripts).map(s=>s.src||""); const miss=want.filter(w=>!srcs.some(s=>s.includes("/js/"+w+".js"))); return miss.length?{ok:false,detail:"absents : "+miss.join(", ")}:{ok:true,detail:want.length+" scripts"}; }));
    LAST.push(ev("Nom applicatif TechKevin2026",()=> CONFIG.APP_NAME==="TechKevin2026" || {ok:false,detail:CONFIG.APP_NAME}));
    try{ const r=await fetch("manifest.json",{cache:"no-store"}); const j=await r.json(); LAST.push({name:"Manifeste TechKevin2026",ok:r.ok&&j.name==="TechKevin2026",detail:j.name||"HTTP "+r.status}); }catch(e){ LAST.push({name:"Manifeste TechKevin2026",ok:false,detail:e.message}); }
    LAST.push(ev("Horizon 2018-2027",()=> (CONFIG.YEARS[0]===2018&&CONFIG.YEARS.includes(2027)) || {ok:false}));
    LAST.push(ev("Catalogue 2023-2027 fusionné",()=>{ const b=findBrand("Renault"); return (b&&b.models.some(m=>m[0].includes("Twingo E-Tech"))) || {ok:false,detail:"modèle 2026 absent"}; }));
    LAST.push(ev("Nouvelle marque fusionnée",()=> !!findBrand("Xiaomi") || {ok:false}));
    LAST.push(ev("Traduction FR obligatoire",()=>{ const t=Veille.translateFr("fuel pump may cause fire"); return (/pompe à carburant/.test(t)&&/incendie/.test(t)) || {ok:false,detail:t}; }));
    LAST.push(ev("Relance manuelle disponible",()=> (typeof App.relance==="function"&&typeof Veille.relaunch==="function") || {ok:false}));
    try{ await IDB.open(); LAST.push({name:"IndexedDB ouverte",ok:true,detail:"DB techkevin-db"}); }catch(e){ LAST.push({name:"IndexedDB ouverte",ok:false,detail:e.message}); }
    LAST.push(ev("Topic notifications",()=> (typeof CONFIG.NTFY_TOPIC==="string"&&CONFIG.NTFY_TOPIC.length>8) || {ok:false}));
    LAST.push(ev("DOM #app monté",()=>!!document.getElementById("app")));
    LAST.push(ev("localStorage R/W",()=>{ localStorage.setItem("__t","1"); const ok=localStorage.getItem("__t")==="1"; localStorage.removeItem("__t"); return ok; }));
    const okP=await Auth.verifyAdmin("Kevin83600"); const badP=await Auth.verifyAdmin("mauvais");
    LAST.push(ev("Mot de passe admin unique",()=> (okP&&!badP) || {ok:false}));
    LAST.push(ev("PDF généré valide",()=>{ const b=PDF.build("Test",[{h:"S",lines:["l1"]}]); return (b instanceof Blob&&b.type==="application/pdf") || {ok:false}; }));
    LAST.push(ev("Wallpaper appliqué",()=>{ Wallpaper.apply(); return true; }));
    LAST.push(ev("Veille 15 j",()=> Veille.PERIOD_DAYS===15 || {ok:false}));
    LAST.push(ev("Énergie Électrique",()=> DT.energyOf("Électrique 286")==="Électrique" || {ok:false}));
    LAST.push(ev("DTC EV sans thermique",()=>{ const f=DT.faultsForVehicle("Skoda","Elroq|2025","Électrique 286").faults.map(x=>x.code); return !f.some(c=>/^(P02|P24|P20|P038)/.test(c)) || {ok:false}; }));
    LAST.push(ev("resolveFiche P0420",()=>{ const f=resolveFiche("P0420"); return (f&&f.code==="P0420") || {ok:false}; }));
    LAST.push(ev("ServiceWorker",()=> ("serviceWorker" in navigator) || {ok:false}));
    return LAST; }
  return { run, last:()=>LAST, failures:()=>LAST.filter(x=>!x.ok) };
})();
