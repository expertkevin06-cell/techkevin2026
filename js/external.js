"use strict";
const External = (() => {
  const GITHUB_API = "https://api.github.com/repos/expertkevin06-cell/auto-diagnostic/contents/app.js";
  const RAW_FALLBACK = "https://raw.githubusercontent.com/expertkevin06-cell/auto-diagnostic/main/app.js";
  const CORS_PROXY = "https://corsproxy.io/?";
  const ADMIN_PASS = "Kevin83600";
  const K_VER = "tk_external_ver_v1", K_PACK = "tk_external_pack_v1", K_LAST = "tk_external_last_v1";
  const read = (k,d) => { try{ const v=localStorage.getItem(k); return v==null?d:JSON.parse(v); }catch(e){ return d; } };
  const write = (k,v) => { try{ localStorage.setItem(k, JSON.stringify(v)); }catch(e){} };

  /* === FETCH MULTI-CANAL : API GitHub → raw → proxy CORS === */
  async function fetchWithTimeout(url, timeoutMs=15000){
    const controller = new AbortController();
    const timer = setTimeout(()=>controller.abort(), timeoutMs);
    try{
      const r = await fetch(url, { signal:controller.signal, cache:"no-store" });
      clearTimeout(timer);
      return r;
    }catch(e){ clearTimeout(timer); throw e; }
  }

  async function fetchSource(){
    const attempts = [
      { url: GITHUB_API, mode:"api" },
      { url: RAW_FALLBACK, mode:"raw" },
      { url: CORS_PROXY + encodeURIComponent(RAW_FALLBACK), mode:"proxy" },
      { url: CORS_PROXY + encodeURIComponent(GITHUB_API), mode:"proxy-api" }
    ];
    const errors = [];
    for (const att of attempts){
      try{
        const r = await fetchWithTimeout(att.url);
        if (!r.ok){ errors.push(att.mode+" HTTP "+r.status); continue; }
        if (att.mode === "api" || att.mode === "proxy-api"){
          const j = await r.json();
          if (j.content){
            const decoded = atob(j.content.replace(/\n/g,""));
            if (decoded.includes("BATCH_ISSUES")) return { txt:decoded, mode:att.mode };
          }
        } else {
          const txt = await r.text();
          if (txt && txt.includes("BATCH_ISSUES")) return { txt, mode:att.mode };
        }
        errors.push(att.mode+" contenu invalide");
      }catch(e){ errors.push(att.mode+" : "+(e.message||"erreur")); }
    }
    throw new Error("Tous les canaux échoués : "+errors.join(" | "));
  }

  function extractConst(src, name){
    const re = new RegExp("\\bconst\\s+" + name + "\\s*=\\s*");
    const m = re.exec(src); if (!m) return null;
    let depth = 0, inStr = false, strCh = "", esc = false;
    let i = m.index + m[0].length;
    for (; i < src.length; i++){
      const c = src[i];
      if (esc){ esc = false; continue; }
      if (c === "\\"){ esc = true; continue; }
      if (inStr){ if (c === strCh) inStr = false; continue; }
      if (c === "'" || c === '"' || c === "`"){ inStr = true; strCh = c; continue; }
      if (c === "/" && src[i+1] === "/"){ while (i < src.length && src[i] !== "\n") i++; continue; }
      if (c === "/" && src[i+1] === "*"){ i++; while (i < src.length && !(src[i-1]==="*" && src[i]==="/")) i++; continue; }
      if (c === "[" || c === "{") depth++;
      else if (c === "]" || c === "}"){ depth--; if (depth === 0){ return src.substring(m.index + m[0].length, i+1); } }
    }
    return null;
  }
  function safeEval(expr){
    if (!expr) return null;
    try{ return (new Function("return (" + expr + ");"))(); }catch(e){ return null; }
  }
  function parseSource(src){
    return {
      BATCH_ISSUES:    safeEval(extractConst(src, "BATCH_ISSUES")),
      BATCH_MODELS:    safeEval(extractConst(src, "BATCH_MODELS")),
      KEY_ISSUES:      safeEval(extractConst(src, "KEY_ISSUES")),
      KEY_EXPERT:      safeEval(extractConst(src, "KEY_EXPERT")),
      BRAND_EXPERT:    safeEval(extractConst(src, "BRAND_EXPERT")),
      GENERIC_EXPERT:  safeEval(extractConst(src, "GENERIC_EXPERT")),
      UNIV:            safeEval(extractConst(src, "UNIV")),
      GENERIC:         safeEval(extractConst(src, "GENERIC"))
    };
  }

  const FUEL_MAP = { essence:"Essence", diesel:"Diesel", hybride:"Hybride", electrique:"Électrique", électrique:"Électrique" };
  const normFuel = f => FUEL_MAP[String(f||"").toLowerCase()] || "Essence";
  const normBrand = id => {
    const M = {renault:"Renault",peugeot:"Peugeot",citroen:"Citroën",ds:"DS",dacia:"Dacia",
      lancia:"Lancia",cupra:"Cupra",polestar:"Polestar",volkswagen:"Volkswagen",audi:"Audi",
      bmw:"BMW",mercedes:"Mercedes",opel:"Opel",fiat:"Fiat",seat:"Seat",skoda:"Skoda",
      volvo:"Volvo",porsche:"Porsche",mini:"Mini",alfa:"Alfa Romeo",toyota:"Toyota",
      honda:"Honda",nissan:"Nissan",mazda:"Mazda",mitsubishi:"Mitsubishi",subaru:"Subaru",
      suzuki:"Suzuki",hyundai:"Hyundai",kia:"Kia",lexus:"Lexus",byd:"BYD",mg:"MG",
      lynkco:"Lynk & Co",nio:"Nio",xpeng:"Xpeng",ford:"Ford",chevrolet:"Chevrolet",
      jeep:"Jeep",tesla:"Tesla"};
    return M[id] || (id ? id.charAt(0).toUpperCase() + id.slice(1) : "");
  };
  const yearsRange = y => {
    if (!y) return [2018,2027];
    const s = String(y);
    const m = s.match(/(\d{4})\D*(\d{4})?/);
    if (m) return [+m[1], +(m[2] || "2027")];
    const n = parseInt(s,10); return Number.isFinite(n) ? [n, Math.max(n,2027)] : [2018,2027];
  };
  const mkId = (prefix, brand, model, seed) =>
    prefix + "-" + (brand||"").replace(/\W/g,"").slice(0,8) + "-" + (model||"").replace(/\W/g,"").slice(0,12) + "-" + (seed||Math.random().toString(36).slice(2,7));

  function depsOK(){
    return typeof findBrand==="function" && Array.isArray(BRANDS) &&
           typeof TSB==="object" && typeof Recalls==="object" && typeof Store==="object";
  }

  function mergeModels(arr){
    if (!depsOK() || !Array.isArray(arr)) return 0;
    let added = 0;
    arr.forEach(item => {
      if (!Array.isArray(item) || item.length < 4) return;
      const brand = normBrand(item[0]) || item[4] || "";
      const modelName = item[1] || "";
      const [y0] = yearsRange(item[2]);
      const motors = Array.isArray(item[3]) ? item[3].map(m => {
        if (!Array.isArray(m)) return null;
        const name = m[0] || "";
        const fuel = normFuel(m[1]);
        const pw = m[2] ? String(m[2]).replace(/[^\d]/g,"") : "";
        return pw ? (fuel + " " + pw) : (name || fuel);
      }).filter(Boolean) : [];
      if (!brand || !modelName || !motors.length) return;
      let b = findBrand(brand);
      if (!b){ b = { n:brand, o:"EU", pool:[], models:[] }; BRANDS.push(b); }
      if (b.models.some(m => m[0].split("|")[0].toLowerCase() === modelName.toLowerCase())) return;
      const idx = motors.map(e => { let i = b.pool.indexOf(e); if (i < 0){ b.pool.push(e); i = b.pool.length - 1; } return i; });
      b.models.push([modelName + "|" + y0, idx]);
      added++;
    });
    return added;
  }

  function mergeIssues(batchIssues, keyIssues, brandExpert, genericExpert, univ, generic){
    if (!depsOK()) return { tsbAdded:0, recAdded:0, faultAdded:0 };
    let tsbAdded = 0, recAdded = 0, faultAdded = 0;
    let tsbCur, recCur, faultsCur;
    try{ tsbCur = TSB.customs(); recCur = Recalls.customs(); faultsCur = Store.customs(); }
    catch(e){ return { tsbAdded:0, recAdded:0, faultAdded:0 }; }

    (batchIssues || []).forEach(it => {
      if (!Array.isArray(it) || it.length < 8) return;
      const brand = normBrand(it[0]) || it[0] || "";
      const model = it[1] || ""; const motor = it[2] || "";
      const title = it[3] || "Panne"; const detail = it[4] || ""; const fix = it[5] || "";
      const parts = it[6] || ""; const dtc = (it[7] || "").split(/[,\s]+/).filter(Boolean);
      const source = it[8] || "externe"; const [y0,y1] = yearsRange(it[9]);
      const id = mkId("EXT-TSB", brand, model, title.slice(0,20));
      if (tsbCur.some(t => t.id === id)) return;
      const isCamp = /rappel|campagne|recall/i.test(title + " " + source + " " + detail);
      if (isCamp){
        if (recCur.some(r => r.comp === title && r.brands.includes(brand))) return;
        recCur.unshift({id:"EXT-RAP-"+id.slice(8), brands:brand?[brand]:[], models:model?[model]:[],
          fuels:motor?[DT.energyOf(motor)]:[], y0, y1, comp:title, risk:detail, fix, dtcs:dtc, status:"open", date:source});
        recAdded++;
      } else {
        tsbCur.unshift({id, src:"WEB", ref:source, brands:brand?[brand]:[], models:model?[model]:[],
          eng:motor?[motor.toLowerCase()]:[], en:[DT.energyOf(motor||"Essence")],
          y0, y1, comp:title + (parts ? " ("+parts+")" : ""),
          prob:detail, sym:[], fix, dtc:dtc, sev:3});
        tsbAdded++;
      }
    });

    (keyIssues || []).forEach(it => {
      if (!it || !it.title) return;
      const brand = normBrand(it.brand) || it.brand || "";
      const id = mkId("EXT-KEY", brand, it.model||"", it.title.slice(0,20));
      if (tsbCur.some(t => t.id === id)) return;
      const [y0,y1] = yearsRange(it.years || "2018-2027");
      tsbCur.unshift({id, src:"WEB", ref:it.source||"externe", brands:brand?[brand]:[],
        models:it.model?[it.model]:[], eng:it.motor?[it.motor.toLowerCase()]:[],
        en:[], y0, y1, comp:it.title, prob:it.detail||"", sym:[], fix:"", dtc:(it.dtc||"").split(/[,\s]+/).filter(Boolean), sev:3});
      tsbAdded++;
    });

    (keyExpert || []).forEach(it => {
      if (!it || !it.title) return;
      const brand = normBrand(it.brand) || it.brand || "";
      const key = "EXT-" + mkId("FE", brand, it.model||"", it.title.slice(0,16));
      if (faultsCur.some(f => f.key === key)) return;
      try{
        Store.addCustom({key, code:"B0EXT", brand, title:it.title, desc:it.diagnosis||it.detail||"",
          sev:3, sevLabel:"Sérieuse", symptoms:(it.symptom||"").split(/[.;]/).map(s=>s.trim()).filter(Boolean),
          causes:[], solutions:(it.diagnosis||"").split(/[.;]/).map(s=>s.trim()).filter(Boolean),
          brands:brand?[brand]:["Toutes marques"], motors:it.motor?[it.motor]:["Essence"], years:"2018-2027"});
        faultAdded++;
      }catch(e){}
    });

    (brandExpert || []).forEach(it => {
      if (!Array.isArray(it) || it.length < 8) return;
      const brand = normBrand(it[0]) || it[0] || ""; const motor = it[1] || "";
      const id = mkId("EXT-BE", brand, motor, it[2]);
      if (tsbCur.some(t => t.id === id)) return;
      const [y0,y1] = yearsRange(it[8] || "2018-2027");
      tsbCur.unshift({id, src:"WEB", ref:it[7]||"externe", brands:brand?[brand]:[], models:[],
        eng:motor?[motor.toLowerCase()]:[], en:[], y0, y1, comp:it[2]||"Diagnostic",
        prob:it[3]||"", sym:[], fix:it[4]||"", dtc:(it[6]||"").split(/[,\s]+/).filter(Boolean), sev:3});
      tsbAdded++;
    });

    (univ || []).forEach(it => {
      if (!Array.isArray(it) || !it[0]) return;
      const id = mkId("EXT-UN", "all", "", it[0]);
      if (tsbCur.some(t => t.id === id)) return;
      tsbCur.unshift({id, src:"WEB", ref:it[3]||"externe", brands:[], models:[], eng:[], en:[],
        y0:2018, y1:2027, comp:it[0], prob:it[1]||"", sym:[], fix:"",
        dtc:(it[2]||"").split(/[,\s]+/).filter(Boolean), sev:2});
      tsbAdded++;
    });

    ["diesel","essence","hybride","electrique"].forEach(e => {
      const g = (generic || {})[e]; if (!g || !Array.isArray(g.issues)) return;
      g.issues.forEach(row => {
        if (!Array.isArray(row) || !row[0]) return;
        const id = mkId("EXT-GEN", "all", "", row[0] + "-" + e);
        if (tsbCur.some(t => t.id === id)) return;
        tsbCur.unshift({id, src:"WEB", ref:"générique " + normFuel(e), brands:[], models:[], eng:[],
          en:[normFuel(e)], y0:2018, y1:2027, comp:row[0], prob:row[1]||"", sym:[], fix:"",
          dtc:(row[2]||"").split(/[,\s]+/).filter(Boolean), sev:2});
        tsbAdded++;
      });
    });

    try{ TSB.saveCustoms(tsbCur); Recalls.saveCustoms(recCur); }catch(e){}
    return { tsbAdded, recAdded, faultAdded };
  }

  /* === VÉRIFICATION MOT DE PASSE ADMIN === */
  async function verifyAdmin(pass){
    try{
      if (typeof Auth !== "undefined" && typeof Auth.verifyAdmin === "function"){
        return await Auth.verifyAdmin(pass);
      }
    }catch(e){}
    return pass === ADMIN_PASS;
  }

  async function importRemote(force, adminPass){
    try{
      const now = Date.now();
      if (!force && now - read(K_LAST, 0) < 7 * 24 * 3600 * 1000){
        return { ok:false, reason:"déjà importé il y a moins de 7 j", cached:true };
      }
      /* Import forcé : vérif mdp admin */
      if (force){
        if (!adminPass) return { ok:false, reason:"mot de passe admin requis" };
        const ok = await verifyAdmin(adminPass);
        if (!ok) return { ok:false, reason:"mot de passe admin incorrect" };
      }
      let result;
      try{ result = await fetchSource(); }catch(e){ return { ok:false, reason:e.message }; }
      const parsed = parseSource(result.txt);
      const hash = (result.txt.length + (parsed.BATCH_ISSUES||[]).length + (parsed.BATCH_MODELS||[]).length).toString(36);
      const mod = mergeModels(parsed.BATCH_MODELS);
      const iss = mergeIssues(parsed.BATCH_ISSUES, parsed.KEY_ISSUES, parsed.BRAND_EXPERT,
                              parsed.GENERIC_EXPERT, parsed.UNIV, parsed.GENERIC);
      write(K_PACK, { hash, at:new Date().toISOString(), mode:result.mode,
        stats:{ models:mod, tsb:iss.tsbAdded, recalls:iss.recAdded, faults:iss.faultAdded,
                srcBATCH_ISSUES:(parsed.BATCH_ISSUES||[]).length,
                srcBATCH_MODELS:(parsed.BATCH_MODELS||[]).length,
                srcKEY_ISSUES:(parsed.KEY_ISSUES||[]).length } });
      write(K_VER, hash);
      write(K_LAST, now);
      if (typeof Veille !== "undefined" && Veille.mergeModels) Veille.mergeModels();
      if (typeof Store !== "undefined" && Store.audit) Store.audit("EXTERNAL_IMPORT", "models+"+mod+" tsb+"+iss.tsbAdded+" rap+"+iss.recAdded);
      return { ok:true, hash, mode:result.mode, models:mod, ...iss };
    }catch(e){ return { ok:false, reason:"importRemote crash : "+e.message }; }
  }

  function status(){ try{ return { pack:read(K_PACK, null), last:read(K_LAST, 0), ver:read(K_VER, null) }; }catch(e){ return { pack:null, last:0, ver:null }; } }
  function reset(){ try{ localStorage.removeItem(K_PACK); localStorage.removeItem(K_VER); localStorage.removeItem(K_LAST); }catch(e){} }

  return { importRemote, status, reset, SRC:GITHUB_API, verifyAdmin };
})();
