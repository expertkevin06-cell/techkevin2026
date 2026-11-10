"use strict";
const TSB = (() => {
  const SRC={RC:"RappelConso",NHTSA:"NHTSA",SG:"Safety Gate",TSB:"TSB constructeur",BUL:"Bulletin technique",WEB:"Presse / site spécialisé"};
  const TH=["Essence","Diesel","Hybride"];
  const FR=t=>frObj(t,["comp","prob","fix","sym"]);
  const DB=[
    {id:"TSB-DAC-SPRING-BRAKE",src:"TSB",ref:"Dacia B21-0142",brands:["Dacia"],models:["Spring"],eng:["électrique"],en:["Électrique"],y0:2021,y1:2024,comp:"Actuateur de frein électro-hydraulique / blending régénératif",prob:"Pédale de frein longue / efficacité de freinage réduite lors du blending régénératif ; voyant ABS/ESP parfois",sym:["Pédale spongieuse","Allongement distance de freinage","Voyant ABS/ESP"],fix:"Mise à jour logiciel de blending + contrôle/purge circuit de frein",dtc:["C0110","C0121","U0121"],sev:4},
    {id:"TSB-DAC-SPRING-12V",src:"TSB",ref:"Dacia B22-0067",brands:["Dacia"],models:["Spring"],eng:["électrique"],en:["Électrique"],y0:2021,y1:2024,comp:"Batterie 12V / DC-DC",prob:"Décharge 12V → perte assistance frein électrique et démarrage impossible",sym:["Démarrage impossible","Voyant frein/batterie"],fix:"Remplacement 12V + contrôle DC-DC",dtc:["P0562"],sev:3},
    {id:"TSB-DAC-BIGSTER-RESS",src:"TSB",ref:"Dacia B25-0031",brands:["Dacia"],models:["Bigster"],eng:[],en:[],y0:2025,y1:2027,comp:"Ressorts suspension arrière",prob:"Casse prématurée ressorts arrière",sym:["Claquement arrière","Assiette penchée"],fix:"Ressorts diamètre majoré",dtc:[],sev:3},
    {id:"TSB-VW-ID-BRAKE",src:"TSB",ref:"VW B23-0190 (MEB)",brands:["Volkswagen","Skoda"],models:["ID.3","ID.4","Elroq","Enyaq"],eng:["électrique"],en:["Électrique"],y0:2021,y1:2027,comp:"Logiciel ESC / blending frein régénératif",prob:"À-coups de freinage / pédale dure lors du blending",sym:["Pédale dure","À-coups au freinage"],fix:"MAJ logiciel ESC/blending",dtc:["C0110","U0121"],sev:3},
    {id:"TSB-BMW-BRAKE-VAC",src:"TSB",ref:"BMW SIB 34-01-18",brands:["BMW"],models:[],eng:["20d","30d"],en:["Diesel"],y0:2018,y1:2021,comp:"Pompe à vide de frein",prob:"Perte assistance frein (pompe à vide)",sym:["Pédale dure","Allongement freinage"],fix:"Remplacement pompe à vide",dtc:["C0121"],sev:4},
    {id:"TSB-TOY-BRAKE-ACC",src:"TSB",ref:"Toyota T-SB-0041-20",brands:["Toyota","Lexus"],models:[],eng:["hybrid"],en:["Hybride"],y0:2018,y1:2022,comp:"Actuateur de frein (accumulateur)",prob:"Pédale spongieuse / voyant frein (accumulateur)",sym:["Pédale spongieuse","Voyant frein"],fix:"Remplacement actuateur/accumulateur",dtc:["C0110","C0161"],sev:4},
    {id:"TSB-STL-DV5-CHAIN",src:"TSB",ref:"Stellantis B23-0147",brands:["Peugeot","Citroën","DS","Opel"],models:[],eng:["1.5 hdi","1.5 bluehdi"],en:["Diesel"],y0:2018,y1:2021,comp:"Chaîne de distribution (7 mm)",prob:"Usure/élongation chaîne 7 mm ; risque rupture",sym:["Claquement à froid","Voyant moteur"],fix:"Chaîne renforcée 8 mm + galets + pompe",dtc:["P0016","P0340"],sev:4},
    {id:"BUL-STL-DV5-REGEN",src:"BUL",ref:"Stellantis N02-2019",brands:["Peugeot","Citroën","DS","Opel"],models:[],eng:["1.5 hdi","1.5 bluehdi"],en:["Diesel"],y0:2018,y1:2022,comp:"FAP / régénérations",prob:"Régénérations excessives → dilution huile",sym:["Régénérations fréquentes","Niveau huile monte"],fix:"MAJ calculateur + vidange rapprochée",dtc:["P2463","P242F"],sev:3},
    {id:"BUL-STL-DV5-ADB",src:"BUL",ref:"Stellantis N11-2020",brands:["Peugeot","Citroën","DS","Opel"],models:[],eng:["1.5 bluehdi","1.5 hdi"],en:["Diesel"],y0:2018,y1:2023,comp:"Système AdBlue",prob:"Cristallisation → pompe HS, bridage",sym:["Voyant dépollution","Message AdBlue"],fix:"Pompe + injecteur AdBlue + nettoyage",dtc:["P2047","P204C"],sev:3},
    {id:"RC-PSA-COURROIE",src:"RC",ref:"RappelConso 2019-11",brands:["Peugeot","Citroën","DS","Opel"],models:[],eng:["1.2 puretech"],en:["Essence"],y0:2018,y1:2023,comp:"Courroie de distribution humide",prob:"Dégradation courroie → pompe à vide → freinage",sym:["Pédale dure","Voyant"],fix:"Kit courroie + pompe à vide",dtc:["P0505"],sev:4},
    {id:"TSB-PSA-EB2-OIL",src:"TSB",ref:"PSA B21-0062",brands:["Peugeot","Citroën","Opel"],models:[],eng:["1.2 puretech"],en:["Essence"],y0:2018,y1:2022,comp:"Crépine / pompe à huile",prob:"Colmatage crépine → pression huile",sym:["Voyant huile"],fix:"Crépine + pompe + courroie",dtc:["P0520"],sev:4},
    {id:"TSB-REN-K9K-INJ",src:"TSB",ref:"Renault B17-045",brands:["Renault","Dacia","Nissan"],models:[],eng:["1.5 dci"],en:["Diesel"],y0:2018,y1:2020,comp:"Injecteurs / pompe K9K",prob:"Limailles pompe → injecteurs HS",sym:["Perte puissance","Ratés"],fix:"Kit injecteurs + pompe",dtc:["P0087","P0201"],sev:4},
    {id:"NHTSA-FORD-PS",src:"NHTSA",ref:"EA16-001",brands:["Ford"],models:["Focus","Fiesta"],eng:[],en:TH,y0:2018,y1:2019,comp:"Boîte PowerShift DPS6",prob:"À-coups/patinage embrayage",sym:["À-coups","Vibrations"],fix:"Embrayage + MAJ TCM",dtc:["P0741"],sev:3},
    {id:"SG-VW-DSG",src:"SG",ref:"2018-DE-042",brands:["Volkswagen","Audi","Seat","Skoda"],models:[],eng:[],en:TH,y0:2018,y1:2020,comp:"Mécatronique DSG DQ200",prob:"Défaillance mécatronique",sym:["À-coups","Mode sécurité"],fix:"Remplacement mécatronique",dtc:["P0700"],sev:4},
    {id:"TSB-SKO-ELROQ-BATT",src:"TSB",ref:"Skoda B25-0107",brands:["Skoda"],models:["Elroq","Enyaq"],eng:["électrique"],en:["Électrique"],y0:2025,y1:2027,comp:"Refroidissement batterie HV",prob:"Pompe thermique HV hors plage → bridage charge",sym:["Bridage charge","Voyant température"],fix:"Contrôle/remplacement pompe thermique + MAJ",dtc:["P0C24","P0A7E"],sev:3},
    {id:"TSB-REN-R5-CHGPORT",src:"TSB",ref:"Renault B24-0210",brands:["Renault"],models:["R5","R4"],eng:["électrique"],en:["Électrique"],y0:2024,y1:2027,comp:"Verrou / connecteur de charge",prob:"Verrouillage charge défaillant → interruptions",sym:["Charge interrompue","Verrou bloqué"],fix:"Contrôle/remplacement verrou + MAJ",dtc:["P0C1F","P0C29"],sev:3},
    {id:"NHTSA-TESLA-EMMC",src:"NHTSA",ref:"21V-063",brands:["Tesla"],models:["Model S","Model X"],eng:[],en:["Électrique"],y0:2018,y1:2021,comp:"Mémoire eMMC MCU",prob:"Usure eMMC → écran noir",sym:["Écran figé"],fix:"Remplacement MCU",dtc:["U0155"],sev:3},
    {id:"SG-TAKATA",src:"SG",ref:"2018-2020",brands:["Honda","Nissan","Toyota","Mazda","Subaru","Mitsubishi","BMW","Mercedes","Fiat","Alfa Romeo"],models:[],eng:[],en:[],y0:2018,y1:2020,comp:"Airbag Takata",prob:"Rupture générateur",sym:["Voyant airbag"],fix:"Remplacement gratuit",dtc:["B0001"],sev:4} ];
  const K="tk_tsb_custom_v1";
  const read=(k,d)=>{try{return JSON.parse(localStorage.getItem(k))??d;}catch(e){return d;}};
  function customs(){ return read(K,[]).map(FR); }
  function saveCustoms(l){ localStorage.setItem(K,JSON.stringify(l)); }
  function normEng(s){ return String(s).toLowerCase().replace(/blue\s?hdi/g,"hdi").replace(/blue\s?dci/g,"dci").replace(/e-?tech/g,"etech").replace(/[^a-z0-9.]/g,""); }
  function all(){ return customs().concat(DB.map(FR)); }
  function forVehicle(brand,modelName,mYear,engine){ const energy=DT.energyOf(engine); const e=normEng(engine);
    return all().filter(t=>{ if(!t.brands.includes(brand)) return false;
      if(t.models&&t.models.length&&!t.models.some(m=>modelName.toLowerCase().includes(m.toLowerCase()))) return false;
      if(t.en&&t.en.length&&!t.en.includes(energy)) return false;
      if(t.eng&&t.eng.length&&!t.eng.some(p=>e.includes(normEng(p)))) return false;
      return !(mYear>t.y1||2027<t.y0); }); }
  function search(q){ q=q.toLowerCase(); return all().filter(t=>(t.id+" "+t.ref+" "+t.brands.join(" ")+" "+(t.models||[]).join(" ")+" "+(t.eng||[]).join(" ")+" "+t.comp+" "+t.prob).toLowerCase().includes(q)).slice(0,60); }
  function byId(id){ return all().find(t=>t.id===id)||null; }
  return { SRC,all,forVehicle,search,byId,customs,saveCustoms };
})();
