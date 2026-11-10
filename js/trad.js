"use strict";
/* =====================================================================
   TRADUCTION FRANÇAISE OBLIGATOIRE — glossaire technique automobile.
   Appliqué à la lecture sur pannes, rappels, campagnes, bulletins, DTC.
   ===================================================================== */
const TRAD = (() => {
  const PHRASES = [
    ["high voltage battery","batterie haute tension"],["battery high voltage","batterie haute tension"],
    ["loss of motive power","perte de propulsion"],["update the software","mettre à jour le logiciel"],
    ["software update","mise à jour logicielle"],["risk of fire","risque d'incendie"],
    ["service brakes","freinage de service"],["parking brake","frein de stationnement"],
    ["power train","groupe motopropulseur"],["powertrain","groupe motopropulseur"],["drive train","transmission"],["drivetrain","transmission"],
    ["wiring harness","faisceau électrique"],["electrical system","système électrique"],
    ["seat belts","ceintures de sécurité"],["seat belt","ceinture de sécurité"],
    ["backup camera","caméra de recul"],["rearview camera","caméra de recul"],
    ["cruise control","régulateur de vitesse"],["adaptive cruise","régulateur adaptatif"],
    ["blind spot","angle mort"],["collision avoidance","évitement de collision"],["driver assistance","aide à la conduite"],
    ["catalytic converter","catalyseur"],["particulate filter","FAP"],["spark plug","bougie"],
    ["accelerator pedal","pédale d'accélérateur"],["brake pedal","pédale de frein"],
    ["power steering","direction assistée"],["steering rack","crémaillère"],["control arm","bras de suspension"],
    ["shock absorber","amortisseur"],["tie rod","biellette"],["ball joint","rotule"],
    ["tire pressure","pression des pneus"],["charge port","port de charge"],["charging cable","câble de charge"],
    ["wall box","borne"],["wallbox","borne"],["free of charge","gratuit"],["no charge","gratuit"],
    ["do not drive","ne pas conduire"],["park outside","garer à l'extérieur"],["stop sale","suspension de vente"],
    ["recall notice","avis de rappel"],["campaign number","numéro de campagne"],
    ["may cause","peut provoquer"],["can cause","peut provoquer"],["could cause","peut provoquer"],
    ["air bag","airbag"],["windshield","pare-brise"],["coolant","liquide de refroidissement"],
    ["short circuit","court-circuit"],["overheating","surchauffe"],["stalling","calage"],["stall","calage"],
    ["fuel pump","pompe à carburant"],["fuel rail","rampe de carburant"],["fuel filter","filtre à carburant"],
    ["oil filter","filtre à huile"],["air filter","filtre à air"],["cabin filter","filtre d'habitacle"],
    ["instrument panel","combiné"],["warning light","voyant"],["tell tale","voyant"],["dashboard","combiné"],
    ["touchscreen","écran tactile"],["infotainment","multimédia"],["dealer","concession"],
    ["transmission","boîte de vitesses"],["gearbox","boîte de vitesses"],["clutch","embrayage"],
    ["suspension","suspension"],["steering","direction"],["engine","moteur"],["battery","batterie"],
    ["brakes","freins"],["brake","frein"],["tires","pneumatiques"],["tire","pneumatique"],
    ["wheels","roues"],["wheel","roue"],["camera","caméra"],["sensor","capteur"],["module","module"],
    ["inverter","onduleur"],["charger","chargeur"],["charging","charge"],["software","logiciel"],
    ["leak","fuite"],["corrosion","corrosion"],["fracture","rupture"],["crack","fissure"],["crash","collision"],
    ["injury","blessure"],["fire","incendie"],["replace","remplacer"],["inspect","contrôler"],
    ["remedy","solution"],["consequence","conséquence"],["component","composant"],["summary","résumé"],
    ["visibility","visibilité"],["latches","verrous"],["locks","verrous"],["hood","capot"],["bonnet","capot"],
    ["trunk","hayon"],["liftgate","hayon"],["tailgate","hayon"],["door","porte"],["window","vitre"],
    ["mirror","rétroviseur"],["headlamp","feu avant"],["taillamp","feu arrière"],["lights","feux"],["light","feu"],
    ["fuel","carburant"],["oil","huile"],["cooling","refroidissement"],["radiator","radiateur"],
    ["turbocharger","turbocompresseur"],["turbo","turbo"],["exhaust","échappement"],["emissions","émissions"],["emission","émission"],
    ["injectors","injecteurs"],["injector","injecteur"],["ignition","allumage"],["coil","bobine"],
    ["belt","courroie"],["chain","chaîne"],["valve","vanne"],["pump","pompe"],["alternator","alternateur"],
    ["generator","alternateur"],["starter","démarreur"],["connector","connecteur"],["harness","faisceau"],
    ["wires","câbles"],["wire","câble"],["switch","interrupteur"],["relay","relais"],["fuse","fusible"],
    ["control unit","calculateur"],["controller","calculateur"],["ecu","calculateur"],
    ["reprogram","reprogrammer"],["calibration","calibration"],["recall","rappel"],["campaign","campagne"],
    ["bulletin","bulletin"],["warranty","garantie"],["owner","propriétaire"],["vehicle","véhicule"],
    ["model","modèle"],["defect","défaut"],["failure","panne"],["fault","défaut"],["display","écran"],["screen","écran"],
    ["parking","stationnement"],["lane","voie"],["hybrid","hybride"],["electric","électrique"],["plug-in","rechargeable"],
    ["gasoline","essence"],["petrol","essence"],["diesel","diesel"],["supercharger","compresseur"],["intercooler","échangeur"],
    ["throttle","papillon"],["abs","ABS"],["stability","contrôle de stabilité"],["traction control","antipatinage"],
    ["pretensioner","prétensionneur"],["child seat","siège enfant"],["pedestrian","piéton"],["bumper","pare-chocs"],
    ["fender","aile"],["grille","calandre"],["spoiler","aileron"],["roof","toit"],["sunroof","toit ouvrant"],
    ["seats","sièges"],["seat","siège"],["headrest","appuie-tête"],["paint","peinture"],["rust","rouille"],["weld","soudure"],
    ["bolts","boulons"],["bolt","boulon"],["nut","écrou"],["screw","vis"],["bracket","support"],["mount","support"],
    ["hose","durite"],["pipe","tube"],["gasket","joint"],["seal","joint"],["bearing","roulement"],["bushing","silentbloc"],
    ["spring","ressort"],["axle","essieu"],["shaft","arbre"],["manifold","collecteur"],["intake","admission"],
    ["cylinder","cylindre"],["piston","piston"],["crankshaft","vilebrequin"],["camshaft","arbre à cames"],
    ["cylinder head","culasse"],["misfire","ratés"],["knock","cliquetis"],["idle","ralenti"],["compression","compression"],
    ["wiper","essuie-glace"],["wipers","essuie-glace"],["washer","lave-glace"],["defroster","dégivrage"],
    ["air conditioning","climatisation"],["climate","climatisation"],["heater","chauffage"],["filter","filtre"],
    ["egr","vanne EGR"],["adblue","AdBlue"],["urea","AdBlue"],["scr","AdBlue"],["nox","NOx"],["obd","OBD"],
    ["dtc","code défaut"],["diagnostic","diagnostic"],["scan tool","valise"],["reset","réinitialisation"],
    ["relearn","réinitialisation"],["update","mise à jour"],["upgrade","mise à niveau"],["repair","réparation"],
    ["service","entretien"],["maintenance","entretien"],["mileage","kilométrage"],["odometer","compteur"],
    ["speedometer","compteur"],["horn","avertisseur"],["range","autonomie"],["power","puissance"],["torque","couple"],
    ["voltage","tension"],["current","courant"],["capacity","capacité"],["degradation","dégradation"],
    ["parts","pièces"],["kit","kit"],["assembly","ensemble"],["housing","cartouche"],["cover","couvercle"],
    ["cap","bouchon"],["plug","prise"],["socket","prise"],["port","port"],["station","borne"],["grid","réseau"],
    ["safety","sécurité"],["compliance","conformité"],["regulation","réglementation"],["standard","norme"],
    ["report","signaler"],["complaint","réclamation"],["investigation","enquête"],["notify","notifier"],
    ["notification","notification"],["letter","courrier"],["contact","contacter"],["customer","client"],
    ["refund","remboursement"],["reimburse","rembourser"],["extend","extension"],["extension","extension"],
    ["interim","provisoire"],["final","définitif"],["phase","phase"],["modify","modifier"],["modification","modification"],
    ["manufactured","fabriqué"],["manufacture","fabrication"],["year","année"],["label","étiquette"],["sticker","étiquette"],
    ["manual","manuel"],["handbook","manuel"],["tool","outil"],["jack","cric"],["spare","roue de secours"],
    ["alignment","géométrie"],["balance","équilibrage"],["tpms","pression des pneus"]
  ];
  const SORTED = PHRASES.slice().sort((a,b)=>b[0].length-a[0].length);
  const escRe = s => s.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");
  function translateFr(s){
    if(!s) return s;
    let t=String(s);
    for(const [en,fr] of SORTED) t=t.replace(new RegExp("\\b"+escRe(en)+"\\b","gi"), fr);
    return t;
  }
  function frObj(o,fields){
    if(!o) return o;
    const c=Object.assign({},o);
    (fields||[]).forEach(f=>{ const v=c[f];
      if(typeof v==="string") c[f]=translateFr(v);
      else if(Array.isArray(v)) c[f]=v.map(x=>typeof x==="string"?translateFr(x):x); });
    return c;
  }
  return { PHRASES, translateFr, frObj };
})();
const translateFr = TRAD.translateFr;
const frObj = TRAD.frObj;
