"use strict";
const Wallpaper = (() => {
  const K="tk_wallpaper_v1"; const MAXW=1920,MAXH=1080,QUAL=0.82;
  function get(){ try{ const v=localStorage.getItem(K); return (v&&v.startsWith("data:image"))?v:null; }catch(e){ return null; } }
  function set(d){ try{ localStorage.setItem(K,d); }catch(e){ return false; } apply(); return true; }
  function reset(){ try{ localStorage.removeItem(K); }catch(e){} apply(); }
  function apply(){ const v=get(); const b=document.body.style;
    b.backgroundImage=v?`url("${v}")`:""; b.backgroundSize="cover"; b.backgroundPosition="center center"; b.backgroundAttachment="fixed"; b.backgroundRepeat="no-repeat"; }
  function fromFile(file){ return new Promise((res,rej)=>{ if(!file||!/^image\//.test(file.type)) return rej(new Error("Fichier non image"));
    const fr=new FileReader(); fr.onerror=()=>rej(new Error("Lecture impossible"));
    fr.onload=()=>{ const img=new Image(); img.onerror=()=>rej(new Error("Image invalide"));
      img.onload=()=>{ let w=img.naturalWidth,h=img.naturalHeight; const r=Math.min(1,MAXW/w,MAXH/h); w=Math.max(1,Math.round(w*r)); h=Math.max(1,Math.round(h*r));
        const c=document.createElement("canvas"); c.width=w; c.height=h; c.getContext("2d").drawImage(img,0,0,w,h); res(c.toDataURL("image/jpeg",QUAL)); };
      img.src=fr.result; };
    fr.readAsDataURL(file); }); }
  return { get,set,reset,apply,fromFile };
})();
