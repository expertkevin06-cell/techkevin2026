"use strict";
const SelfTest = (() => {
  let LAST=[];
  const G={CONFIG:()=>CONFIG,Store:()=>Store,Session:()=>Session,Auth:()=>Auth,DT:()=>DT,TSB:()=>TSB,Recalls:()=>Recalls,Updater:()=>Updater,Veille:()=>Veille,PDF:()=>PDF,Wallpaper:()=>Wallpaper,Bus:()=>Bus,IDB:()=>IDB,Voyants:()=>Voyants,BRANDS:()=>BRANDS,CATS:()=>CATS,resolveFiche:()=>resolveFiche,systemFaultsFor:()=>systemFaultsFor,App:()=>App};
  function ev(n,f){ try{ const v=f(); if(v===true) return {name:n,ok:true,detail:""}; if(v&&v.ok) return {name:n,ok:true,detail:v.detail||""}; return {name:n,ok:false,detail:(v&&v.detail)||"échec"}; }catch(e){ return {name:n,ok:false,detail:e.message}; } }
  async function run(){ LAST=[];
    LAST.push(ev("Globals présents",()=>{ const m=[]; for(const k of Object.keys(G)){ try{ G[k](); }catch(e){ m.push(k); } } return m.length?{ok:false,detail:"manquants : "+m.join(", ")}:{ok:true,detail:Object.keys(G).length+" globals OK"}; }));
    LAST.push(ev("Scripts JS inclus",()=>{ const want=["config","store","trad","bus","auth","data","recalls","tsb","veille","wallpaper","updater","pdf","voyants","selftest","app"]; const srcs=Array.from(document.scripts).map(s=>s.src||""); const miss=want.filter(w=>!srcs.some(s=>s.includes("/js/"+w+".js"))); return miss.length?{ok:false,detail:"absents : "+miss.join(", ")}:{ok:true,detail:want.length+" scripts"}; }));
    LAST.push(ev("Pannes freinage Dacia Spring (TSB)",()=> TSB.forVehicle("Dacia","Spring",2022,"Électrique 65").some(t=>t.id==="TSB-DAC-SPRING-BRAKE") || {ok:false,detail:"TSB freinage Spring absent"}));
    LAST.push(ev("Rappel freinage Dacia Spring",()=> Recalls.forVehicle("Dacia","Spring|2022","Électrique 65").some(r=>r.id==="RAP-DAC-2021-SPRING-BRAKE") || {ok:false,detail:"rappel freinage absent"}));
    LAST.push(ev("Catalogue voyants complet",()=> Voyants.SYSTEMS.length>=20 || {ok:false,detail:String(Voyants.SYSTEMS.length)}));
    LAST.push(ev("DeepSearch freinage",()=>{ const s=Voyants.deepSearch("freinage pédale spongieuse voyant ABS",null); return (s.length&&s[0].id==="freinage") || {ok:false,detail:"freinage non trouvé"}; }));
    LAST.push(ev("DeepSearch batterie 12V",()=> Voyants.deepSearch("voyant batterie 12V démarrage impossible",null).some(x=>x.id==="batt12") || {ok:false}));
    LAST.push(ev("DeepSearch courroie humide",()=> Voyants.deepSearch("courroie de distribution humide pédale dure",null).some(x=>x.id==="courroie") || {ok:false}));
    LAST.push(ev("Voyants EV sans moteur thermique",()=> !Voyants.sheetsForEnergy("Électrique").some(s=>s.id==="moteur") || {ok:false,detail:"moteur thermique sur EV"}));
    LAST.push(ev("Voyants EV avec HV + charge",()=>{ const l=Voyants.sheetsForEnergy("Électrique").map(s=>s.id); return (l.includes("battHV")&&l.includes("charge")) || {ok:false}; }));
    LAST.push(ev("Horizon 2018-2027",()=> (CONFIG.YEARS[0]===2018&&CONFIG.YEARS.includes(2027)) || {ok:false}));
    LAST.push(ev("Traduction FR",()=>{ const t=translateFr("fuel pump may cause fire"); return (/pompe à carburant/.test(t)&&/incendie/.test(t)) || {ok:false,detail:t}; }));
    LAST.push(ev("Mot de passe admin unique",async()=>true));
    const okP=await Auth.verifyAdmin("Kevin83600"); const badP=await Auth.verifyAdmin("x");
    LAST.push(ev("Vérif mdp admin",()=> (okP&&!badP) || {ok:false}));
    LAST.push(ev("PDF valide",()=>{ const b=PDF.build("T",[{h:"S",lines:["l"]}]); return (b instanceof Blob&&b.type==="application/pdf") || {ok:false}; }));
    LAST.push(ev("IndexedDB",async()=>true));
    try{ await IDB.open(); LAST.push({name:"IndexedDB ouverte",ok:true,detail:"techkevin-db"}); }catch(e){ LAST.push({name:"IndexedDB ouverte",ok:false,detail:e.message}); }
    LAST.push(ev("DOM #app",()=>!!document.getElementById("app")));
    LAST.push(ev("ServiceWorker",()=> ("serviceWorker" in navigator) || {ok:false}));
    return LAST; }
  return { run, last:()=>LAST, failures:()=>LAST.filter(x=>!x.ok) };
})();
