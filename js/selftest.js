"use strict";
const SelfTest = (() => {
  let LAST = [];
  const G = {
    CONFIG:()=>CONFIG, Store:()=>Store, Session:()=>Session, Auth:()=>Auth, DT:()=>DT,
    TSB:()=>TSB, Recalls:()=>Recalls, Updater:()=>Updater, Veille:()=>Veille, PDF:()=>PDF,
    Wallpaper:()=>Wallpaper, Bus:()=>Bus, IDB:()=>IDB, Voyants:()=>Voyants, External:()=>External,
    BRANDS:()=>BRANDS, CATS:()=>CATS, resolveFiche:()=>resolveFiche,
    systemFaultsFor:()=>systemFaultsFor, App:()=>App
  };
  async function ev(name, fn){
    try{
      const v = await fn();
      if (v === true) return { name, ok:true, detail:"" };
      if (v && v.ok)  return { name, ok:true, detail:v.detail || "" };
      return { name, ok:false, detail:(v && v.detail) || "échec" };
    }catch(e){ return { name, ok:false, detail:e.message }; }
  }
  async function run(){
    LAST = [];
    LAST.push(await ev("Globals présents", () => {
      const m=[]; for(const k of Object.keys(G)){ try{ G[k](); }catch(e){ m.push(k); } }
      return m.length ? {ok:false, detail:"manquants : "+m.join(", ")} : {ok:true, detail:Object.keys(G).length+" globals OK"};
    }));
    LAST.push(await ev("Scripts JS inclus", () => {
      const want=["config","store","trad","bus","auth","data","recalls","tsb","veille","wallpaper","updater","pdf","voyants","external","selftest","app"];
      const srcs=Array.from(document.scripts).map(s=>s.src||"");
      const miss=want.filter(w=>!srcs.some(s=>s.includes("/js/"+w+".js")));
      return miss.length ? {ok:false, detail:"absents : "+miss.join(", ")} : {ok:true, detail:want.length+" scripts"};
    }));
    LAST.push(await ev("Module External exposé", () => (typeof External==="object" && typeof External.importRemote==="function") || {ok:false}));
    LAST.push(await ev("External.SRC configurée", () => (typeof External.SRC==="string" && External.SRC.includes("expertkevin06-cell")) || {ok:false}));
    LAST.push(await ev("External.status callable", () => { const s=External.status(); return (s && typeof s==="object") || {ok:false}; }));
    LAST.push(await ev("Nom applicatif TechKevin2026", () => CONFIG.APP_NAME==="TechKevin2026" || {ok:false, detail:CONFIG.APP_NAME}));
    LAST.push(await ev("Horizon 2018-2027", () => (CONFIG.YEARS[0]===2018 && CONFIG.YEARS.includes(2027)) || {ok:false}));
    LAST.push(await ev("Catalogue 2023-2027 fusionné", () => { const b=findBrand("Renault"); return (b && b.models.some(m=>m[0].includes("Twingo E-Tech"))) || {ok:false, detail:"modèle 2026 absent"}; }));
    LAST.push(await ev("Traduction FR obligatoire", () => { const t=translateFr("fuel pump may cause fire"); return (/pompe à carburant/.test(t) && /incendie/.test(t)) || {ok:false, detail:t}; }));
    LAST.push(await ev("Pannes freinage Dacia Spring (TSB)", () => TSB.forVehicle("Dacia","Spring",2022,"Électrique 65").some(t=>t.id==="TSB-DAC-SPRING-BRAKE") || {ok:false}));
    LAST.push(await ev("Rappel freinage Dacia Spring", () => Recalls.forVehicle("Dacia","Spring|2022","Électrique 65").some(r=>r.id==="RAP-DAC-2021-SPRING-BRAKE") || {ok:false}));
    LAST.push(await ev("Catalogue voyants complet", () => Voyants.SYSTEMS.length>=20 || {ok:false, detail:String(Voyants.SYSTEMS.length)}));
    LAST.push(await ev("DeepSearch freinage", () => { const s=Voyants.deepSearch("freinage pédale spongieuse voyant ABS",null); return (s.length && s[0].id==="freinage") || {ok:false}; }));
    LAST.push(await ev("Voyants EV sans moteur thermique", () => !Voyants.sheetsForEnergy("Électrique").some(s=>s.id==="moteur") || {ok:false}));
    LAST.push(await ev("Mot de passe admin unique", async () => {
      const ok  = await Auth.verifyAdmin(CONFIG.DEFAULT_ADMIN.pass);
      const bad1 = await Auth.verifyAdmin("mauvais-mdp-123");
      const bad2 = await Auth.verifyAdmin("");
      return (ok && !bad1 && !bad2) || {ok:false, detail:"politique mdp"};
    }));
    LAST.push(await ev("IndexedDB round-trip", async () => {
      await IDB.open();
      const t = { id:"selftest:"+Date.now(), type:"test", ts:Date.now() };
      await IDB.put("events", t);
      const g = await IDB.get("events", t.id);
      await IDB.del("events", t.id);
      const after = await IDB.get("events", t.id);
      return (g && g.id===t.id && !after) || {ok:false, detail:"round-trip IDB échoué"};
    }));
    LAST.push(await ev("PDF valide", () => { const b=PDF.build("Test",[{h:"S",lines:["l1"]}]); return (b instanceof Blob && b.type==="application/pdf") || {ok:false}; }));
    LAST.push(await ev("Veille 15 j", () => Veille.PERIOD_DAYS===15 || {ok:false}));
    LAST.push(await ev("Énergie Électrique", () => DT.energyOf("Électrique 286")==="Électrique" || {ok:false}));
    LAST.push(await ev("DTC EV sans codes thermiques", () => { const f=DT.faultsForVehicle("Skoda","Elroq|2025","Électrique 286").faults.map(x=>x.code); return !f.some(c=>/^(P02|P24|P20|P038)/.test(c)) || {ok:false}; }));
    LAST.push(await ev("resolveFiche P0420", () => { const f=resolveFiche("P0420"); return (f && f.code==="P0420") || {ok:false}; }));
    LAST.push(await ev("ServiceWorker dispo", () => ("serviceWorker" in navigator) || {ok:false}));
    return LAST;
  }
  return { run, last:()=>LAST, failures:()=>LAST.filter(x=>!x.ok) };
})();
