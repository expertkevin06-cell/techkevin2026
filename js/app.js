/* ... dans doSearch(), après recall-results : ... */
  doSearch(){ const q=$("#q").value.trim(); if(!q)return;
    const sheets=Voyants.deepSearch(q,null);
    $("#voyant-results").innerHTML = sheets.length?`<div class="card"><h3>🚨 Voyants & systèmes correspondants (${sheets.length})</h3>
      ${sheets.map(s=>`<div class="sysfault"><div class="row"><b>${esc(s.label)}</b><span class="tag"><span class="sev s${s.sev}"></span></span></div>
        <div style="margin:.3rem 0">${s.voyants.map(v=>`<span class="tag b">${esc(v.n)}</span>`).join("")}</div>
        <p class="muted"><b>Symptômes :</b> ${esc(s.symptomes.join(" • "))}</p>
        <p class="muted"><b>Causes :</b> ${esc(s.causes.join(" • "))}</p>
        <p class="muted"><b>Solutions :</b> ${esc(s.fixes.join(" • "))}</p>
        <div>${s.dtcs.map(c=>`<button class="btn sec small" data-act="open-fiche" data-key="${esc(c)}">${esc(c)}</button>`).join("")}</div></div>`).join("")}</div>`:"";
    /* ... suite identique (tsb-results, results, recall-results) ... */ }

/* ... dans renderVeh(), vue motorisation, après la carte résumé : ... */
  const sheets=Voyants.sheetsForEnergy(energy);
  /* ... insérer : ... */
  `${sheets.length?`<div class="card"><h3>🚨 Voyants combiné & systèmes (${esc(energy)})</h3>
    ${sheets.map(s=>`<div class="sysfault"><div class="row"><b>${esc(s.label)}</b><span class="tag"><span class="sev s${s.sev}"></span></span></div>
      <div style="margin:.3rem 0">${s.voyants.map(v=>`<span class="tag b">${esc(v.n)}</span>`).join("")}</div>
      <p class="muted"><b>Symptômes :</b> ${esc(s.symptomes.slice(0,4).join(" • "))}</p>
      <div>${s.dtcs.slice(0,6).map(c=>`<button class="btn sec small" data-act="open-fiche" data-key="${esc(c)}">${esc(c)}</button>`).join("")}</div></div>`).join("")}</div>`:""}`
