function renderPremiacao(){
  const totalPremiacao=CATS.reduce((s,cat)=>s+PREMIOS[cat].reduce((a,b)=>a+b,0),0);
  const slots=CATS.reduce((s,cat)=>s+PREMIOS[cat].filter((v,i)=>v>0||i===0).length,0);
  const preenchidas=CATS.reduce((s,cat)=>s+Object.keys(S.resultados[cat]||{}).length,0);
  document.getElementById('prem-total').textContent=fmt(totalPremiacao);
  document.getElementById('prem-cats').textContent=CATS.length;
  document.getElementById('prem-duplas').textContent=preenchidas+' / '+slots;
  document.getElementById('premio-grid').innerHTML=CATS.map(cat=>{
    const res=S.resultados[cat]||{};
    const rows=[0,1,2,3].map(i=>{
      const val=PREMIOS[cat][i];if(val===0&&i>0)return'';
      const dupla=res[i];
      return`<div class="premio-row">
        <span style="font-size:18px;">${POSICOES[i].split(' ')[0]}</span>
        <div style="flex:1;padding:0 10px;">
          <div style="font-size:11px;color:var(--text3);font-family:'Barlow Condensed',sans-serif;letter-spacing:.04em;">${POSICOES[i].split(' ').slice(1).join(' ')}</div>
          ${dupla?`<div class="premio-dupla">${dupla}</div>`:`<div class="premio-empty">A definir</div>`}
        </div>
        <div style="text-align:right;">
          ${val>0?`<div class="premio-val">${fmt(val)}</div>`:''}
          ${dupla?`<button class="btn btn-sm btn-ghost" onclick="remResultado('${cat}',${i})" style="font-size:10px;padding:2px 6px;margin-top:3px;">✕</button>`:''}
        </div>
      </div>`;
    }).join('');
    return`<div class="premio-card"><div class="premio-header"><span class="badge ${catBadge[cat]||'badge-gray'}" style="font-size:13px;">${cat}</span><span class="premio-val">${fmt(PREMIOS[cat].reduce((a,b)=>a+b,0))}</span></div>${rows}</div>`;
  }).join('');
}

