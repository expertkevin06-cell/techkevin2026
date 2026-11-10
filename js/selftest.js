"use strict";
/* =====================================================================
   AUTOCONTRÔLE TechKevin2026 — harnais ASYNC-AWARE.
   Chaque test passe par ev() qui attend le résultat (sync ou async).
   ===================================================================== */
const SelfTest = (() => {
  let LAST = [];

  const G = {
    CONFIG:()=>CONFIG, Store:()=>Store, Session:()=>Session, Auth:()=>Auth, DT:()=>DT,
    TSB:()=>TSB, Recalls:()=>Recalls, Updater:()=>Updater, Veille:()=>Veille, PDF:()=>PDF,
    Wallpaper:()=>Wallpaper, Bus:()=>Bus, IDB:()=>IDB, Voyants:()=>Voyants,
    BRANDS:()=>BRANDS, CATS:()=>CATS, resolveFiche:()=>resolveFiche,
    systemFaultsFor:()=>systemFaultsFor, App:()=>App
  };

  /* Harnais : supporte fonctions sync ET async (await du résultat) */
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
      const want=["config","store","trad","bus","auth","data","recalls","tsb","veille","wallpaper","updater","pdf","voyants","selftest","app"];
      const srcs=Array.from(document.scripts).map(s=>s.src||"");
      const miss=want.filter(w=>!srcs.some(s=>s.includes("/js/"+w+".js")));
      return miss.length ? {ok:false, detail:"absents : "+miss.join(", ")} : {ok:true, detail:want.length+" scripts"};
    }));
    LAST.push(await ev("Nom applicatif TechKevin2026", () => CONFIG.APP_NAME==="TechKevin2026" || {ok:false, detail:CONFIG.APP_NAME}));
    try{
      const r=await fetch("manifest.json",{cache:"no-store"}); const j=await r.json();
      LAST.push({name:"Manifeste TechKevin2026", ok:r.ok && j.name==="TechKevin2026", detail:j.name||("HTTP "+r.status)});
    }catch(e){ LAST.push({name:"Manifeste TechKevin2026", ok:false, detail:e.message}); }

    LAST.push(await ev("Horizon 2018-2027", () => (CONFIG.YEARS[0]===2018 && CONFIG.YEARS.includes(2027)) || {ok:false}));
    LAST.push(await ev("Catalogue 2023-2027 fusionné", () => { const b=findBrand("Renault"); return (b && b.models.some(m=>m[0].includes("Twingo E-Tech"))) || {ok:false, detail:"modèle 2026 absent"}; }));
    LAST.push(await ev("Nouvelle marque fusionnée", () => !!findBrand("Xiaomi") || {ok:false, detail:"marque absente"}));
    LAST.push(await ev("Traduction FR obligatoire", () => { const t=translateFr("fuel pump may cause fire"); return (/pompe à carburant/.test(t) && /incendie/.test(t)) || {ok:false, detail:t}; }));
    LAST.push(await ev("Relance manuelle disponible", () => (typeof App.relance==="function" && typeof Veille.relaunch==="function") || {ok:false}));

    LAST.push(await ev("Pannes freinage Dacia Spring (TSB)", () => TSB.forVehicle("Dacia","Spring",2022,"Électrique 65").some(t=>t.id==="TSB-DAC-SPRING-BRAKE") || {ok:false, detail:"TSB freinage Spring absent"}));
    LAST.push(await ev("Rappel freinage Dacia Spring", () => Recalls.forVehicle("Dacia","Spring|2022","Électrique 65").some(r=>r.id==="RAP-DAC-2021-SPRING-BRAKE") || {ok:false, detail:"rappel freinage absent"}));
    LAST.push(await ev("Catalogue voyants complet", () => Voyants.SYSTEMS.length>=20 || {ok:false, detail:String(Voyants.SYSTEMS.length)}));
    LAST.push(await ev("DeepSearch freinage", () => { const s=Voyants.deepSearch("freinage pédale spongieuse voyant ABS",null); return (s.length && s[0].id==="freinage") || {ok:false, detail:"freinage non trouvé"}; }));
    LAST.push(await ev("DeepSearch batterie 12V", () => Voyants.deepSearch("voyant batterie 12V démarrage impossible",null).some(x=>x.id==="batt12") || {ok:false}));
    LAST.push(await ev("DeepSearch courroie humide", () => Voyants.deepSearch("courroie de distribution humide pédale dure",null).some(x=>x.id==="courroie") || {ok:false}));
    LAST.push(await ev("Voyants EV sans moteur thermique", () => !Voyants.sheetsForEnergy("Électrique").some(s=>s.id==="moteur") || {ok:false, detail:"moteur thermique sur EV"}));
    LAST.push(await ev("Voyants EV avec HV + charge", () => { const l=Voyants.sheetsForEnergy("Électrique").map(s=>s.id); return (l.includes("battHV") && l.includes("charge")) || {ok:false}; }));

    /* VRAI test politique mot de passe (async correctement attendu) */
    LAST.push(await ev("Mot de passe admin unique", async () => {
      const ok  = await Auth.verifyAdmin(CONFIG.DEFAULT_ADMIN.pass);
      const bad1 = await Auth.verifyAdmin("mauvais-mdp-123");
      const bad2 = await Auth.verifyAdmin("");
      const bad3 = await Auth.verifyAdmin("Kevin8360");
      return (ok && !bad1 && !bad2 && !bad3) || {ok:false, detail:"politique mdp non respectée"};
    }));

    /* VRAI test IndexedDB : round-trip écriture/lecture/suppression */
    LAST.push(await ev("IndexedDB écriture/lecture", async () => {
      await IDB.open();
      const t = { id:"selftest:"+Date.now(), type:"test", ts:Date.now() };
      await IDB.put("events", t);
      const g = await IDB.get("events", t.id);
      await IDB.del("events", t.id);
      const after = await IDB.get("events", t.id);
      return (g && g.id===t.id && !after) || {ok:false, detail:"round-trip IDB échoué"};
    }));

    LAST.push(await ev("PDF généré valide", () => { const b=PDF.build("Test",[{h:"Section",lines:["ligne une","ligne deux"]}]); return (b instanceof Blob && b.type==="application/pdf") || {ok:false, detail:"blob invalide"}; }));
    LAST.push(await ev("Wallpaper appliqué", () => { Wallpaper.apply(); return true; }));
    LAST.push(await ev("Veille 15 j", () => Veille.PERIOD_DAYS===15 || {ok:false, detail:String(Veille.PERIOD_DAYS)}));
    LAST.push(await ev("Énergie Électrique", () => DT.energyOf("Électrique 286")==="Électrique" || {ok:false}));
    LAST.push(await ev("Énergie Diesel", () => DT.energyOf("1.5 BlueHDi 130")==="Diesel" || {ok:false}));
    LAST.push(await ev("DTC EV sans codes thermiques", () => { const f=DT.faultsForVehicle("Skoda","Elroq|2025","Électrique 286").faults.map(x=>x.code); return !f.some(c=>/^(P02|P24|P20|P038)/.test(c)) || {ok:false, detail:"code thermique présent"}; }));
    LAST.push(await ev("resolveFiche P0420", () => { const f=resolveFiche("P0420"); return (f && f.code==="P0420") || {ok:false, detail:"fiche nulle"}; }));
    LAST.push(await ev("Rendu recherche OK", () => typeof App.renderSearch()==="string" && App.renderSearch().includes("Recherche")));
    LAST.push(await ev("localStorage R/W", () => { localStorage.setItem("__t","1"); const ok=localStorage.getItem("__t")==="1"; localStorage.removeItem("__t"); return ok; }));
    LAST.push(await ev("DOM #app monté", () => !!document.getElementById("app")));
    LAST.push(await ev("Topic notifications configuré", () => (typeof CONFIG.NTFY_TOPIC==="string" && CONFIG.NTFY_TOPIC.length>8) || {ok:false}));
    LAST.push(await ev("ServiceWorker dispo", () => ("serviceWorker" in navigator) || {ok:false, detail:"SW non supporté"}));

    return LAST;
  }

  return { run, last:()=>LAST, failures:()=>LAST.filter(x=>!x.ok) };
})();
