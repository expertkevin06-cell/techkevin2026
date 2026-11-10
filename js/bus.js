"use strict";
/* =====================================================================
   BASE LOCALE MASSIVE (IndexedDB) + BUS DE NOTIFICATIONS (ntfy.sh).
   CORRECTION : chaque transaction résout sur request.result (undefined
   inclus) — plus jamais l'objet IDBRequest (truthy) qui faussait les
   tests de round-trip. Gestion onabort/onblocked/exceptions.
   ===================================================================== */
const IDB = (() => {
  let dbp = null;

  function open(){
    return new Promise((res, rej) => {
      if (dbp) return res(dbp);
      if (!("indexedDB" in window)) return rej(new Error("IndexedDB non supporté"));
      let rq;
      try { rq = indexedDB.open("techkevin-db", 1); }
      catch(e){ return rej(e); }
      rq.onupgradeneeded = e => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains("events")) db.createObjectStore("events", { keyPath:"id" });
        if (!db.objectStoreNames.contains("kv"))     db.createObjectStore("kv",     { keyPath:"k" });
      };
      rq.onsuccess = e => { dbp = e.target.result; res(dbp); };
      rq.onerror   = e => rej(e.target.error || new Error("IndexedDB open error"));
      rq.onblocked = () => rej(new Error("IndexedDB bloqué par un autre onglet"));
    });
  }

  function tx(store, mode, fn){
    return open().then(db => new Promise((res, rej) => {
      let t;
      try { t = db.transaction(store, mode); } catch(e){ return rej(e); }
      let out;
      try { out = fn(t.objectStore(store)); } catch(e){ return rej(e); }
      /* Résolution PROPRE : si fn() renvoie une IDBRequest, on rend son
         result (valeur, clé, ou undefined si introuvable / delete). */
      const isReq = !!(out && typeof out === "object" && "result" in out);
      t.oncomplete = () => res(isReq ? out.result : out);
      t.onerror    = e => rej(t.error || e.target.error || new Error("Transaction IDB en erreur"));
      t.onabort    = e => rej(t.error || e.target.error || new Error("Transaction IDB interrompue"));
    }));
  }

  return {
    open,
    put:   (s, v) => tx(s, "readwrite", os => os.put(v)),
    get:   (s, k) => tx(s, "readonly",  os => os.get(k)),
    all:   (s)    => tx(s, "readonly",  os => os.getAll()),
    del:   (s, k) => tx(s, "readwrite", os => os.delete(k)),
    count: (s)    => tx(s, "readonly",  os => os.count()),
    clear: (s)    => tx(s, "readwrite", os => os.clear())
  };
})();

const Bus = (() => {
  const K_CUR = "tk_bus_cursor_v1";
  const url = () => CONFIG.NTFY_BASE + "/" + CONFIG.NTFY_TOPIC;

  async function publish(msg){
    msg = Object.assign({ v:1, app:"techkevin2026", ts:Date.now(), device:(navigator.userAgent||"").slice(0,60) }, msg);
    msg.id = (msg.ref || "R") + ":" + msg.type + ":" + msg.ts;
    try {
      await fetch(url(), { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify(msg) });
      msg.sent = true;
    } catch(e){ msg.sent = false; }              /* hors-ligne : reste en base locale */
    try { await IDB.put("events", msg); } catch(e){}
    return msg;
  }

  async function poll(){
    const since = localStorage.getItem(K_CUR) || String(Math.floor(Date.now()/1000) - 600);
    let txt = "";
    try {
      const r = await fetch(url() + "/json?poll=1&since=" + encodeURIComponent(since), { cache:"no-store" });
      if (!r.ok) return [];
      txt = await r.text();
    } catch(e){ return []; }
    const out = [];
    txt.split("\n").filter(Boolean).forEach(line => {
      try {
        const env = JSON.parse(line);
        if (env.event === "message" && env.message){
          let m; try { m = JSON.parse(env.message); } catch(_){ return; }
          if (m && m.app === "techkevin2026"){ m.id = m.id || ((m.ref||"R")+":"+m.type+":"+(env.time||Date.now())); out.push(m); }
        }
      } catch(_){}
    });
    for (const m of out){ try { await IDB.put("events", m); } catch(e){} }
    if (out.length) localStorage.setItem(K_CUR, String(Math.floor(Date.now()/1000)));
    return out;
  }

  const events    = () => IDB.all("events").catch(() => []);
  const requests  = () => events().then(l => l.filter(x => x.type === "req"));
  const decisions = () => events().then(l => l.filter(x => x.type === "dec"));

  return { publish, poll, events, requests, decisions };
})();
