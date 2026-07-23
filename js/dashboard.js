function renderDashboard(){
  const catMap={};CATS.forEach(c=>catMap[c]=new Set());
  S.jogadores.forEach(j=>j.cats.forEach(c=>{if(catMap[c])catMap[c].add(j.id);}));
  const duplas={};CATS.forEach(c=>duplas[c]=Math.floor(catMap[c].size/2));
  const totalDuplas=Object.values(duplas).reduce((a,b)=>a+b,0);
  const f=calcFin();
  const recIdeal=IDEAL*120+PAT_BASE;
  const despIdeal=IDEAL*2*(getParams().uniforme||70)+calcDespesasFixas();
  const pct=Math.round(totalDuplas/IDEAL*100);
  document.getElementById('dash-metrics').innerHTML=`
    <div class="metric-card lime"><div class="mc-label">Meta duplas</div><div class="mc-value green">${IDEAL}</div><div class="mc-sub">24 por categoria</div></div>
    <div class="metric-card purple"><div class="mc-label">Duplas atual</div><div class="mc-value purple">${totalDuplas}</div><div class="mc-sub">${pct}% do meta</div><div class="progress"><div class="progress-fill purple" style="width:${pct}%"></div></div></div>
    <div class="metric-card pink"><div class="mc-label">Faltam</div><div class="mc-value red">${Math.max(0,IDEAL-totalDuplas)}</div></div>
    <div class="metric-card lime"><div class="mc-label">Receita ideal</div><div class="mc-value green">${fmt(recIdeal)}</div></div>
    <div class="metric-card ${f.lucro>=0?'lime':'pink'}"><div class="mc-label">Resultado atual</div><div class="mc-value ${f.lucro>=0?'green':'red'}">${fmt(f.lucro)}</div></div>`;
  document.getElementById('dash-alert').innerHTML=totalDuplas<82
    ?`<div class="alert alert-red">⚠️ Abaixo do mínimo de 82 duplas. Atual: ${totalDuplas}.</div>`
    :`<div class="alert alert-green">✅ Acima do mínimo de 82 duplas. ${IDEAL-totalDuplas>0?`Faltam ${IDEAL-totalDuplas} para o ideal.`:'Meta atingido!'}</div>`;
  document.getElementById('dash-progress').innerHTML=CATS.map(c=>{
    const d=duplas[c]||0;const p=Math.min(100,Math.round(d/24*100));
    const col=p>=100?'var(--lime)':p>=50?'var(--purple-light)':'var(--pink)';
    return`<div style="margin-bottom:14px;">
      <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:5px;font-family:'Barlow Condensed',sans-serif;font-weight:600;">
        <span>${c}</span><span style="color:var(--text3);">${d} / 24 · ${p}%</span>
      </div>
      <div style="height:6px;background:var(--black4);border-radius:3px;"><div style="height:6px;border-radius:3px;background:${col};width:${p}%;transition:width .4s;"></div></div>
    </div>`;
  }).join('');
  if(chartDuplas){chartDuplas.destroy();chartDuplas=null;}
  if(chartFin){chartFin.destroy();chartFin=null;}
  if(chartCats){chartCats.destroy();chartCats=null;}
  const gridC='rgba(255,255,255,0.06)';const tickC='#4a5e4a';
  chartDuplas=new Chart(document.getElementById('chartDuplas'),{type:'bar',data:{labels:CATS,datasets:[
    {label:'Ideal',data:CATS.map(()=>24),backgroundColor:'#AAFF00',borderRadius:4},
    {label:'Atual',data:CATS.map(c=>duplas[c]||0),backgroundColor:'#b06aff',borderRadius:4},
    {label:'Faltam',data:CATS.map(c=>Math.max(0,24-(duplas[c]||0))),backgroundColor:'#FF1BAD',borderRadius:4},
  ]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{grid:{color:gridC},ticks:{color:tickC,font:{size:12}}},y:{grid:{color:gridC},ticks:{color:tickC,font:{size:12},stepSize:4},max:30,beginAtZero:true}}}});
  chartFin=new Chart(document.getElementById('chartFin'),{type:'bar',data:{labels:['Receita ideal','Receita atual','Despesas'],datasets:[{data:[recIdeal,f.totalRec,f.gastos],backgroundColor:['#AAFF00','#b06aff','#FF1BAD'],borderRadius:6}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{label:ctx=>'R$ '+Math.round(ctx.parsed.y).toLocaleString('pt-BR')}}},scales:{x:{grid:{color:gridC},ticks:{color:tickC,font:{size:11}}},y:{grid:{color:gridC},ticks:{color:tickC,font:{size:11},callback:v=>'R$'+(v/1000).toFixed(0)+'k'},beginAtZero:true}}}});
  const n1=S.jogadores.filter(j=>j.cats.length===1).length;
  const n2=S.jogadores.filter(j=>j.cats.length===2).length;
  const n3=S.jogadores.filter(j=>j.cats.length>=3).length;
  chartCats=new Chart(document.getElementById('chartCats'),{type:'bar',data:{labels:['1 categoria','2 categorias','3 categorias'],datasets:[{data:[n1,n2,n3],backgroundColor:['#b06aff','#AAFF00','#FF1BAD'],borderRadius:6}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{grid:{color:gridC},ticks:{color:tickC,font:{size:12}}},y:{grid:{color:gridC},ticks:{color:tickC,font:{size:12},stepSize:1},beginAtZero:true,min:0}}}});
}

function exportarCSV(){
  if(!S.jogadores.length){toast('Nenhum jogador para exportar','pink');return;}
  const header=['#','Nome','Contato','Categorias','Valor','Pagamento','Uniforme'];
  const rows=S.jogadores.map((j,i)=>[i+1,j.nome,j.tel||'',j.cats.join(' | '),preco(j.cats.length),j.pag,j.tam||'—']);
  const csv=[header,...rows].map(r=>r.map(c=>`"${c}"`).join(',')).join('\n');
  const blob=new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8;'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='premia-cup.csv';a.click();
  toast('CSV exportado!');
}

function renderAll(){renderJogadores();renderMetricas();renderPremiacao();renderPatrocinios();simular();}
