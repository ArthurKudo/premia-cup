function renderSimulacao(){
  const DIAS_SIM=[
    {id:'d1',label:'Dia 1',cats:['Iniciante','Estreante'],cor:'var(--purple-light)'},
    {id:'d2',label:'Dia 2',cats:['Bronze','Mista Iniciante'],cor:'var(--lime)'},
  ];

  DIAS_SIM.forEach(dia=>{
    const el=document.getElementById('sim-inputs-'+dia.id);
    if(el&&!el.dataset.built){
      el.dataset.built='1';
      el.innerHTML=dia.cats.map(c=>buildCatCard(c,dia.id)).join('');
    }
  });

  let totalJogosGeral=0;
  const diaResults=[];

  DIAS_SIM.forEach(dia=>{
    const quadras=parseInt(document.getElementById('sim-quadras-'+dia.id)?.value)||3;
    const intervalo=parseInt(document.getElementById('sim-intervalo-'+dia.id)?.value)||5;
    const inicioStr=document.getElementById('sim-inicio-'+dia.id)?.value||'08:00';
    const [hIni,mIni]=inicioStr.split(':').map(Number);

    const timings=dia.cats.map(c=>calcCatTiming(c,quadras,intervalo,0));
    const valid=timings.filter(t=>!t.skip);
    const jogos=valid.reduce((s,t)=>s+t.totalJogos,0);
    totalJogosGeral+=jogos;

    let diaMin=0, bStartOffset=0;
    if(valid.length===2){
      const ov=calcOverlap(valid[0],valid[1],quadras,valid[0].tempo,intervalo);
      bStartOffset=ov.bStartOffset;
      diaMin=ov.totalDay;
      valid[0].inicioMin=hIni*60+mIni;
      valid[0].fimMin=valid[0].inicioMin+valid[0].duracaoMin;
      valid[1].inicioMin=hIni*60+mIni+bStartOffset;
      valid[1].fimMin=valid[1].inicioMin+valid[1].duracaoMin;
    } else if(valid.length===1){
      valid[0].inicioMin=hIni*60+mIni;
      valid[0].fimMin=valid[0].inicioMin+valid[0].duracaoMin;
      diaMin=valid[0].duracaoMin;
    }
    const fimMin=(hIni*60+mIni)+diaMin;

    const tlEl=document.getElementById('sim-timeline-'+dia.id);
    if(tlEl) renderTimeline(tlEl,valid,hIni,mIni,fimMin,dia.cor);

    diaResults.push({...dia,timings,hIni,mIni,fimMin,diaMin,jogos});
  });

  document.getElementById('sim-metrics').innerHTML=`
    <div class="metric-card purple"><div class="mc-label">Total jogos</div><div class="mc-value">${totalJogosGeral}</div></div>
    <div class="metric-card lime"><div class="mc-label">Dia 1 — duração</div><div class="mc-value green">${fmtDur(diaResults[0].diaMin)}</div><div class="mc-sub">até ${fmtHora(diaResults[0].fimMin)}</div></div>
    <div class="metric-card purple"><div class="mc-label">Dia 2 — duração</div><div class="mc-value purple">${fmtDur(diaResults[1].diaMin)}</div><div class="mc-sub">até ${fmtHora(diaResults[1].fimMin)}</div></div>
    <div class="metric-card amber"><div class="mc-label">Quadras D1 / D2</div><div class="mc-value amber">${document.getElementById('sim-quadras-d1')?.value||3} / ${document.getElementById('sim-quadras-d2')?.value||3}</div></div>
  `;

  const brEl=document.getElementById('sim-brackets');
  if(brEl){
    brEl.innerHTML=diaResults.map(dia=>
      dia.timings.map(t=>renderBracketCard(t,dia.cor)).join('')
    ).join('');
  }
}
