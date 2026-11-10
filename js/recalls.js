"use strict";
const Recalls = (() => {
  const TH=["Essence","Diesel","Hybride"];
  const FR=r=>frObj(r,["comp","risk","fix"]);
  const DB=[
    {id:"RAP-DAC-2021-SPRING-BRAKE",brands:["Dacia"],models:["Spring"],fuels:["Électrique"],y0:2021,y1:2022,comp:"Logiciel de freinage / régénération",risk:"Réduction efficacité de freinage",fix:"Mise à jour logicielle en concession",dtcs:["C0110"],status:"open",date:"2021-09"},
    {id:"RAP-VW-2023-ID-BRAKE",brands:["Volkswagen","Skoda"],models:["ID.3","ID.4","Elroq","Enyaq"],fuels:["Électrique"],y0:2021,y1:2027,comp:"Logiciel ESC / blending frein",risk:"À-coups/pédale dure au freinage",fix:"MAJ logiciel ESC",dtcs:["C0110"],status:"open",date:"2023-05"},
    {id:"RAP-TOY-2020-BRAKE",brands:["Toyota","Lexus"],models:[],fuels:["Hybride"],y0:2018,y1:2022,comp:"Actuateur de frein (accumulateur)",risk:"Pédale spongieuse / perte assistance",fix:"Remplacement actuateur",dtcs:["C0110","C0161"],status:"open",date:"2020-04"},
    {id:"RAP-PSA-2019-COURROIE",brands:["Peugeot","Citroën","DS","Opel"],models:[],fuels:["Essence"],y0:2018,y1:2023,comp:"Courroie de distribution humide",risk:"Perte assistance freinage",fix:"Kit courroie + pompe à vide",dtcs:["P0505"],status:"open",date:"2019-11"},
    {id:"RAP-REN-2020-13TCE",brands:["Renault","Dacia"],models:[],fuels:["Essence"],y0:2019,y1:2021,comp:"Pompe basse pression",risk:"Calage",fix:"Remplacement pompe",dtcs:["P0087"],status:"open",date:"2020-02"},
    {id:"RAP-DAC-2025-RESS",brands:["Dacia"],models:["Bigster","Duster"],fuels:[],y0:2024,y1:2027,comp:"Ressorts suspension arrière",risk:"Rupture ressort",fix:"Ressorts diamètre majoré",dtcs:[],status:"open",date:"2025-03"},
    {id:"RAP-VW-2018-DSG",brands:["Volkswagen","Audi","Seat","Skoda"],models:[],fuels:TH,y0:2018,y1:2020,comp:"Mécatronique DSG",risk:"Perte propulsion",fix:"Remplacement mécatronique",dtcs:["P0700"],status:"open",date:"2018-06"},
    {id:"RAP-TES-2021-MCU",brands:["Tesla"],models:["Model S","Model X"],fuels:["Électrique"],y0:2018,y1:2021,comp:"Mémoire eMMC MCU",risk:"Perte affichage",fix:"Remplacement MCU",dtcs:["U0155"],status:"open",date:"2021-02"},
    {id:"RAP-REN-2024-R5-CHG",brands:["Renault"],models:["R5","R4"],fuels:["Électrique"],y0:2024,y1:2027,comp:"Verrou connecteur de charge",risk:"Interruptions charge",fix:"Remplacement verrou",dtcs:["P0C1F"],status:"open",date:"2024-09"},
    {id:"RAP-SKO-2025-ELROQ",brands:["Skoda"],models:["Elroq","Enyaq"],fuels:["Électrique"],y0:2025,y1:2027,comp:"Pompe refroidissement batterie HV",risk:"Bridage/surchauffe",fix:"Remplacement pompe",dtcs:["P0C24"],status:"open",date:"2025-04"},
    {id:"RAP-DAC-2022-SPRING",brands:["Dacia"],models:["Spring"],fuels:["Électrique"],y0:2021,y1:2024,comp:"Étanchéité batterie HT",risk:"Défaut isolement",fix:"Contrôle pack",dtcs:["P0AA6"],status:"open",date:"2022-06"},
    {id:"RAP-TAKATA-2018",brands:["Honda","Nissan","Toyota","Mazda","Subaru","Mitsubishi","BMW","Mercedes","Fiat","Alfa Romeo"],models:[],fuels:[],y0:2018,y1:2020,comp:"Airbag Takata",risk:"Rupture générateur",fix:"Remplacement gratuit",dtcs:["B0001"],status:"open",date:"2018-01"} ];
  const K="tk_rappels_custom_v1";
  const read=(k,d)=>{try{return JSON.parse(localStorage.getItem(k))??d;}catch(e){return d;}};
  function customs(){ return read(K,[]).map(FR); }
  function saveCustoms(l){ localStorage.setItem(K,JSON.stringify(l)); }
  function all(){ return customs().concat(DB.map(FR)); }
  function powerOf(engine){ const m=String(engine).trim().match(/(\d{2,4})\s*$/); return m?+m[1]:null; }
  function forVehicle(brand,modelKey,engine){ const energy=DT.energyOf(engine); const mn=modelKey.split("|")[0]; const pw=powerOf(engine);
    return all().filter(r=>{ if(!r.brands.includes(brand)) return false;
      if(r.models&&r.models.length&&!r.models.some(m=>mn.toLowerCase().includes(m.toLowerCase()))) return false;
      if(r.fuels&&r.fuels.length&&!r.fuels.includes(energy)) return false;
      if(r.pw&&pw&&(pw<r.pw[0]||pw>r.pw[1])) return false; return true; }); }
  function search(q){ return all().filter(r=>(r.id+" "+r.brands.join(" ")+" "+r.comp+" "+r.risk).toLowerCase().includes(q)).slice(0,60); }
  function byId(id){ return all().find(r=>r.id===id)||null; }
  return { all,forVehicle,search,byId,customs,saveCustoms,powerOf };
})();
