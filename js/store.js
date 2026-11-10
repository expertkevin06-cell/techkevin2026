"use strict";
const Store = {
  read(k,d){ try{ const v=localStorage.getItem(k); return v==null?d:JSON.parse(v); }catch(e){ return d; } },
  write(k,v){ localStorage.setItem(k, JSON.stringify(v)); },
  customs(){ return this.read(CONFIG.K.customs, []); },
  addCustom(f){ const l=this.customs(); l.unshift(f); this.write(CONFIG.K.customs,l); this.audit("CREER_FICHE",f.code); },
  updateCustom(i,f){ const l=this.customs(); l[i]=f; this.write(CONFIG.K.customs,l); this.audit("MODIF_FICHE",f.code); },
  removeCustom(i){ const l=this.customs(); const f=l[i]; l.splice(i,1); this.write(CONFIG.K.customs,l); this.audit("SUPPR_FICHE",f?f.code:""); },
  getOverride(k){ return this.read(CONFIG.K.overrides,{})[k]||null; },
  setOverride(k,f){ const o=this.read(CONFIG.K.overrides,{}); o[k]=f; this.write(CONFIG.K.overrides,o); this.audit("SURCHARGE",k); },
  isDeleted(k){ return this.read(CONFIG.K.deleted,[]).includes(k); },
  setDeleted(k,v){ let d=this.read(CONFIG.K.deleted,[]); if(v){ if(!d.includes(k)) d.push(k); } else d=d.filter(x=>x!==k); this.write(CONFIG.K.deleted,d); },
  audit(action,detail){ const l=this.read(CONFIG.K.audit,[]); l.unshift({ d:new Date().toISOString(), u:(Session.get()||{}).user||"anonyme", action, detail:detail||"" }); this.write(CONFIG.K.audit, l.slice(0,500)); }
};
const Session = {
  get(){ return Store.read(CONFIG.K.session, null); },
  set(o){ Store.write(CONFIG.K.session, o); },
  clear(){ localStorage.removeItem(CONFIG.K.session); },
  role(){ const s=this.get(); return s?s.role:null; }
};
