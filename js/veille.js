"use strict";
const Veille = (() => {
  const PERIOD_DAYS=15; const MS=PERIOD_DAYS*24*3600*1000;
  const K_LAST="tk_veille_last_v1",K_VER="tk_veille_ver_v1",K_CAND="tk_veille_cand_v1",K_MODELS="tk_models_extra_v1",K_DONE="tk_veille_done_v1",K_CATVER="tk_catalog_ver_v1";
  const read=(k,d)=>{try{ const v=localStorage.getItem(k); return v==null?d:JSON.parse(v); }catch(e){return d;}};
  const write=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}};
  const tradItem=it=>{ if(!it) return it; const c=frObj(it,["comp","prob","risk","fix","sym","title"]); c.trad=true; return c; };
  function due(){ return Date.now()-read(K_LAST,0)>=MS; }
  function daysLeft(){ return Math.max(0,Math.ceil((MS-(Date.now()-read(K_LAST,0)))/86400000)); }
  async function fetchJSON(u){ const r=await fetch(u+(u.includes("?")?"&":"?")+"t="+Date.now(),{cache:"no-store"}); if(!r.ok) throw new Error("HTTP "+r.status); return r.json(); }
  function candidates(){ return read(K_CAND,[]).map(tradItem); }
  function saveCandidates(l){ write(K_CAND,l); }
  function modelsExtra(){ return read(K_MODELS,[]); }
  function saveModelsExtra(l){ write(K_MODELS,l); }
  function mergeModels(){ modelsExtra().forEach(x=>{ const b=findBrand(x.brand); if(!b) return;
    if(b.models.some(m=>m[0].split("|")[0]===x.model)) return;
    const idx=(x.engines||[]).map(e=>{ let i=b.pool.indexOf(e); if(i<0){ b.pool.push(e); i=b.pool.length-1; } return i; });
    if(idx.length) b.models.push([x.model+"|"+(x.y0||2025), idx]); }); }
  function applyItem(c){
    if(c.type==="recall"){ const l=Recalls.customs(); const id="RAP-VEILLE-"+String(c.id).replace(/\W/g,"").slice(0,10);
      if(!l.some(x=>x.id===id)) l.unshift({id,brands:[c.brand],models:c.model?[c.model]:[],fuels:c.fuels||[],y0:c.y0||2018,y1:c.y1||2027,comp:c.comp||"Composant",risk:c.risk||c.prob||"Risque",fix:c.fix||"Voir concession",dtcs:c.dtcs||[],status:"open",date:c.date||new Date().toISOString().slice(0,7)}); Recalls.saveCustoms(l); }
    else if(c.type==="tsb"){ const l=TSB.customs(); const id="TSB-VEILLE-"+String(c.id).replace(/\W/g,"").slice(0,10);
      if(!l.some(x=>x.id===id)) l.unshift({id,src:"TSB",ref:c.ref||"veille",brands:[c.brand],models:c.model?[c.model]:[],eng:c.eng||[],en:c.en||[],y0:c.y0||2018,y1:c.y1||2027,comp:c.comp||"Composant",prob:c.prob||c.risk||"",sym:c.sym||[],fix:c.fix||"",dtc:c.dtcs||[],sev:c.sev||3}); TSB.saveCustoms(l); }
    else if(c.type==="fault"){ const key=c.code; if(key&&!Store.customs().some(x=>x.key===key)) Store.addCustom({key,code:c.code,brand:c.brand||"",title:c.title||c.comp||"Panne",desc:c.prob||"",sev:c.sev||2,sevLabel:["Mineure","Modérée","Sérieuse","Critique"][(c.sev||2)-1],symptoms:c.sym||[],causes:c.causes||[],solutions:c.fix?[c.fix]:[],brands:c.brand?[c.brand]:["Toutes marques"],motors:c.eng||["Essence"],years:YR}); }
    else if(c.type==="model"||c.type==="engine"){ const l=modelsExtra(); if(!l.some(m=>m.brand===c.brand&&m.model===c.model)) l.push({brand:c.brand,model:c.model,y0:c.y0||2025,engines:c.engines||[]}); saveModelsExtra(l); mergeModels(); }
  }
  function mergeCandidates(items){ const cur=read(K_CAND,[]); const done=new Set(read(K_DONE,[])); let added=0;
    (items||[]).forEach(it=>{ it=tradItem(it); if(!it||!it.id||done.has(it.id)||cur.some(c=>c.id===it.id)) return; cur.unshift(it); applyItem(it); added++; });
    saveCandidates(cur.slice(0,400)); return added; }
  async function check(force){ const now=Date.now();
    if(!force&&now-read(K_LAST,0)<MS) return {ok:false,reason:"période 15 j non atteinte ("+daysLeft()+" j)",count:0};
    write(K_LAST,now);
    let man; try{ man=await fetchJSON("veille.json"); }catch(e){ return {ok:false,reason:"veille.json inaccessible",count:0}; }
    if(!man||!man.version) return {ok:false,reason:"manifeste invalide",count:0};
    if(man.version<=read(K_VER,0)) return {ok:false,reason:"veille déjà récupérée",count:0,version:man.version};
    let pack; try{ pack=await fetchJSON(man.file||"data/veille-pack.json"); }catch(e){ return {ok:false,reason:"pack inaccessible",count:0}; }
    write(K_VER,man.version);
    const added=mergeCandidates(pack.items||[]);
    Store.audit("VEILLE_RECUE","v"+man.version+" +"+added);
    return {ok:true,version:man.version,count:added}; }
  async function fetchCatalog(force){ let pack; try{ pack=await fetchJSON("data/catalog-pack.json"); }catch(e){ return {ok:false,reason:"catalog-pack inaccessible",count:0}; }
    if(!pack||!pack.version) return {ok:false,reason:"pack catalogue invalide",count:0};
    if(!force&&pack.version<=read(K_CATVER,0)) return {ok:false,reason:"catalogue déjà importé",count:0};
    write(K_CATVER,pack.version); write("tk_catalog_pack_v1",pack);
    const added=mergeCatalog(pack.items||[]); Store.audit("CATALOGUE_IMPORT","v"+pack.version+" +"+added);
    return {ok:true,version:pack.version,count:added}; }
  function approve(ids){ const cur=read(K_CAND,[]); const done=read(K_DONE,[]);
    const sel=cur.filter(c=>ids.includes(c.id)); sel.forEach(c=>{ applyItem(tradItem(c)); done.push(c.id); });
    write(K_DONE,done); saveCandidates(cur.filter(c=>!ids.includes(c.id))); mergeModels();
    Store.audit("VEILLE_APPROUVEE",sel.length+" élément(s)"); return sel.length; }

  async function autoImport(){
    const c=await fetchCatalog(false).catch(()=>({ok:false,count:0}));
    const v=await check(false).catch(()=>({ok:false,count:0}));
    let ext = { ok:false, reason:"non lancé" };
    try{
      if (typeof External !== "undefined" && typeof External.importRemote === "function"){
        ext = await External.importRemote(false);
      }
    }catch(e){ ext = { ok:false, reason:e.message }; }
    mergeModels();
    return { c, v, ext };
  }
  async function relaunch(adminPass){
    const a=await check(true).catch(e=>({ok:false,reason:e.message,count:0}));
    const c=await fetchCatalog(true).catch(e=>({ok:false,reason:e.message,count:0}));
    let ext = { ok:false, reason:"non lancé" };
    try{
      if (typeof External !== "undefined" && typeof External.importRemote === "function"){
        ext = await External.importRemote(true, adminPass);
      }
    }catch(e){ ext = { ok:false, reason:e.message }; }
    const u=await Updater.checkAndApply().catch(e=>({ok:false,reason:e.message}));
    mergeModels();
    Store.audit("RELANCE_MANUELLE","veille+"+(a.count||0)+" catalogue+"+(c.count||0)+" ext+"+((ext.tsb||0)+(ext.recalls||0)+(ext.faults||0)));
    return { a, c, ext, u };
  }
  return { PERIOD_DAYS,due,daysLeft,check,fetchCatalog,candidates,approve,modelsExtra,saveModelsExtra,mergeModels,
           translateFr:(typeof TRAD!=="undefined"&&TRAD.translateFr)||function(s){return s;},tradItem,autoImport,relaunch };
})();
