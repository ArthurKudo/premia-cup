function calcFin(){
  const p=getParams();
  const patTotal=S.sponsors.filter(sp=>sp.status==='Confirmado').reduce((s,sp)=>s+sp.val,0);
  const recInsc=S.jogadores.reduce((s,j)=>s+preco(j.cats.length),0);
  const totalRec=recInsc+patTotal;
  const nJog=S.jogadores.length;
  const uniforme=nJog*p.uniforme;
  const trofeu=p.trofeuQtd*p.trofeuVal;
  const arbitro=p.arbQtd*p.arbVal;
  const trafego=p.trafegoPago;
  const gastos=uniforme+trofeu+arbitro+p.premiacao+trafego;
  const lucro=totalRec-gastos;
  const recPago=S.jogadores.filter(j=>j.pag==='Pago').reduce((s,j)=>s+preco(j.cats.length),0);
  return{patTotal,recInsc,totalRec,nJog,uniforme,trofeu,arbitro,trafego,gastos,lucro,recPago,p};
}
function renderFinanceiro(){
  const f=calcFin();
  const p=f.p;
  document.getElementById('fin-metrics').innerHTML=`
    <div class="metric-card lime"><div class="mc-label">Receita total</div><div class="mc-value green">${fmt(f.totalRec)}</div></div>
    <div class="metric-card pink"><div class="mc-label">Despesas</div><div class="mc-value red">${fmt(f.gastos)}</div></div>
    <div class="metric-card ${f.lucro>=0?'lime':'pink'}"><div class="mc-label">Resultado</div><div class="mc-value ${f.lucro>=0?'green':'red'}">${fmt(f.lucro)}</div></div>
    <div class="metric-card purple"><div class="mc-label">Já recebido</div><div class="mc-value purple">${fmt(f.recPago)}</div></div>
    <div class="metric-card amber"><div class="mc-label">A receber</div><div class="mc-value amber">${fmt(f.recInsc-f.recPago)}</div></div>`;
  document.getElementById('fin-alert').innerHTML=f.lucro>=0
    ?`<div class="alert alert-green">✅ Torneio lucrativo — margem de ${fmt(f.lucro)}</div>`
    :`<div class="alert alert-red">⚠️ Resultado negativo de ${fmt(Math.abs(f.lucro))} — revise inscrições ou patrocínios</div>`;
  document.getElementById('fin-receitas').innerHTML=`
    <div class="fin-row"><span class="fin-label">Inscrições (${f.nJog} jogadores)</span><span class="fin-value" style="color:var(--lime);">${fmt(f.recInsc)}</span></div>
    <div class="fin-row"><span class="fin-label">Patrocínios confirmados</span><span class="fin-value" style="color:var(--lime);">${fmt(f.patTotal)}</span></div>
    <div class="fin-total"><span>Total receitas</span><span style="color:var(--lime);">${fmt(f.totalRec)}</span></div>`;
  document.getElementById('fin-despesas').innerHTML=`
    <div class="fin-row"><span class="fin-label">Uniformes (${f.nJog} × R$${p.uniforme})</span><span class="fin-value">${fmt(f.uniforme)}</span></div>
    <div class="fin-row"><span class="fin-label">Troféus (${p.trofeuQtd} × R$${p.trofeuVal})</span><span class="fin-value">${fmt(f.trofeu)}</span></div>
    <div class="fin-row"><span class="fin-label">Árbitros (${p.arbQtd} × R$${p.arbVal})</span><span class="fin-value">${fmt(f.arbitro)}</span></div>
    <div class="fin-row"><span class="fin-label">Premiação total</span><span class="fin-value">${fmt(p.premiacao)}</span></div>
    <div class="fin-row"><span class="fin-label">Tráfego pago (Ads)</span><span class="fin-value">${fmt(f.trafego)}</span></div>
    <div class="fin-total"><span>Total despesas</span><span style="color:var(--pink);">${fmt(f.gastos)}</span></div>`;
  document.getElementById('p-uniforme').value=p.uniforme;
  document.getElementById('p-trofeu-qtd').value=p.trofeuQtd;
  document.getElementById('p-trofeu-val').value=p.trofeuVal;
  document.getElementById('p-arb-qtd').value=p.arbQtd;
  document.getElementById('p-arb-val').value=p.arbVal;
  document.getElementById('p-premiacao').value=p.premiacao;
  document.getElementById('p-trafego').value=p.trafegoPago;
  renderUniformes();
  simular();
}
function renderUniformes(){
  const TAMANHOS=['PP','P','M','G','GG','XGG'];
  const masc=S.jogadores.filter(j=>j.gen==='M'||!j.gen);
  const fem=S.jogadores.filter(j=>j.gen==='F');
  const total=S.jogadores.length;
  const el=document.getElementById('fin-uniformes');
  if(!el)return;
  if(!total){el.innerHTML='<div style="color:var(--text3);font-size:13px;text-align:center;padding:12px 0;">Nenhum jogador cadastrado ainda.</div>';return;}
  const contM={};const contF={};
  TAMANHOS.forEach(t=>{contM[t]=0;contF[t]=0;});
  // Count only jogadores with a defined tamanho
  const semTam=S.jogadores.filter(j=>!j.tam).length;
  S.jogadores.forEach(j=>{
    const t=j.tam;
    if(!t)return; // skip if no size selected
    if(j.gen==='F'){if(contF[t]!==undefined)contF[t]++;}
    else{if(contM[t]!==undefined)contM[t]++;}
  });
  const totalM=masc.length;const totalF=fem.length;
  const semTamInfo=semTam?`<div style="margin-bottom:14px;padding:10px 14px;background:rgba(239,159,39,0.07);border:1px solid rgba(239,159,39,0.3);border-radius:var(--r);font-family:'Barlow Condensed',sans-serif;font-size:13px;font-weight:600;color:#EF9F27;">⚠️ ${semTam} jogador${semTam!==1?'es':''} sem tamanho de uniforme definido</div>`:'';
  el.innerHTML=`
    ${semTamInfo}
    <div style="display:flex;gap:20px;flex-wrap:wrap;margin-bottom:20px;">
      <div style="background:var(--black3);border:1px solid var(--purple);border-radius:var(--r);padding:14px 20px;display:flex;flex-direction:column;gap:4px;">
        <div style="font-family:'Barlow Condensed',sans-serif;font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--purple-light);">Total geral</div>
        <div style="font-family:'Bebas Neue',sans-serif;font-size:32px;color:var(--text);line-height:1;">${total}</div>
      </div>
      <div style="background:var(--black3);border:1px solid rgba(176,106,255,0.4);border-radius:var(--r);padding:14px 20px;display:flex;flex-direction:column;gap:4px;">
        <div style="font-family:'Barlow Condensed',sans-serif;font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--purple-light);">Masculino</div>
        <div style="font-family:'Bebas Neue',sans-serif;font-size:32px;color:var(--purple-light);line-height:1;">${totalM}</div>
      </div>
      <div style="background:var(--black3);border:1px solid rgba(255,27,173,0.4);border-radius:var(--r);padding:14px 20px;display:flex;flex-direction:column;gap:4px;">
        <div style="font-family:'Barlow Condensed',sans-serif;font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--pink);">Feminino</div>
        <div style="font-family:'Bebas Neue',sans-serif;font-size:32px;color:var(--pink);line-height:1;">${totalF}</div>
      </div>
      ${semTam?`<div style="background:var(--black3);border:1px solid rgba(239,159,39,0.4);border-radius:var(--r);padding:14px 20px;display:flex;flex-direction:column;gap:4px;">
        <div style="font-family:'Barlow Condensed',sans-serif;font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#EF9F27;">Sem tamanho</div>
        <div style="font-family:'Bebas Neue',sans-serif;font-size:32px;color:#EF9F27;line-height:1;">${semTam}</div>
      </div>`:''}
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:12px;">
      <div style="background:var(--black3);border:1px solid rgba(176,106,255,0.3);border-radius:var(--rl);overflow:hidden;">
        <div style="padding:10px 16px;border-bottom:1px solid var(--border);font-family:'Bebas Neue',sans-serif;font-size:15px;letter-spacing:1px;color:var(--purple-light);">Masculino — por tamanho</div>
        <div style="padding:8px 0;">
          ${TAMANHOS.map(t=>{
            const n=contM[t];
            const pct=totalM?Math.round(n/totalM*100):0;
            return`<div style="display:flex;align-items:center;gap:12px;padding:8px 16px;border-bottom:1px solid var(--border);">
              <div style="font-family:'Bebas Neue',sans-serif;font-size:18px;color:var(--text);width:36px;">${t}</div>
              <div style="flex:1;height:6px;background:var(--black4);border-radius:3px;">
                <div style="height:6px;border-radius:3px;background:var(--purple-light);width:${pct}%;transition:width .4s;"></div>
              </div>
              <div style="font-family:'Bebas Neue',sans-serif;font-size:22px;color:${n>0?'var(--purple-light)':'var(--text3)'};min-width:28px;text-align:right;">${n}</div>
            </div>`;
          }).join('')}
          <div style="display:flex;justify-content:space-between;padding:10px 16px;font-family:'Barlow Condensed',sans-serif;font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--text3);">
            <span>Total masculino</span><span style="color:var(--purple-light);font-size:14px;">${totalM}</span>
          </div>
        </div>
      </div>
      <div style="background:var(--black3);border:1px solid rgba(255,27,173,0.3);border-radius:var(--rl);overflow:hidden;">
        <div style="padding:10px 16px;border-bottom:1px solid var(--border);font-family:'Bebas Neue',sans-serif;font-size:15px;letter-spacing:1px;color:var(--pink);">Feminino — por tamanho</div>
        <div style="padding:8px 0;">
          ${TAMANHOS.map(t=>{
            const n=contF[t];
            const pct=totalF?Math.round(n/totalF*100):0;
            return`<div style="display:flex;align-items:center;gap:12px;padding:8px 16px;border-bottom:1px solid var(--border);">
              <div style="font-family:'Bebas Neue',sans-serif;font-size:18px;color:var(--text);width:36px;">${t}</div>
              <div style="flex:1;height:6px;background:var(--black4);border-radius:3px;">
                <div style="height:6px;border-radius:3px;background:var(--pink);width:${pct}%;transition:width .4s;"></div>
              </div>
              <div style="font-family:'Bebas Neue',sans-serif;font-size:22px;color:${n>0?'var(--pink)':'var(--text3)'};min-width:28px;text-align:right;">${n}</div>
            </div>`;
          }).join('')}
          <div style="display:flex;justify-content:space-between;padding:10px 16px;font-family:'Barlow Condensed',sans-serif;font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--text3);">
            <span>Total feminino</span><span style="color:var(--pink);font-size:14px;">${totalF}</span>
          </div>
        </div>
      </div>
    </div>`;
}
function salvarParametros(){
  S.params={
    uniforme:parseInt(document.getElementById('p-uniforme').value)||70,
    trofeuQtd:parseInt(document.getElementById('p-trofeu-qtd').value)||24,
    trofeuVal:parseInt(document.getElementById('p-trofeu-val').value)||33,
    arbQtd:parseInt(document.getElementById('p-arb-qtd').value)||8,
    arbVal:parseInt(document.getElementById('p-arb-val').value)||300,
    premiacao:parseInt(document.getElementById('p-premiacao').value)||4040,
    trafegoPago:parseInt(document.getElementById('p-trafego').value)||0,
  };
  save(); renderFinanceiro(); toast('Parâmetros salvos!');
}
function simular(){
  const n1=parseInt(document.getElementById('s-1').value)||0;
  const n2=parseInt(document.getElementById('s-2').value)||0;
  const n3=parseInt(document.getElementById('s-3').value)||0;
  const pat=parseInt(document.getElementById('s-pat').value)||0;
  const nJog=n1+n2+n3;
  const rec=n1*120+n2*200+n3*260+pat;
  const desp=nJog*(getParams().uniforme||70)+calcDespesasFixas();
  const lucro=rec-desp;
  const c=lucro>=0?'var(--lime)':'var(--pink)';
  document.getElementById('sim-result').innerHTML=`
    <div class="sim-item"><div class="sim-item-label">Jogadores</div><div class="sim-item-val">${nJog}</div></div>
    <div class="sim-item"><div class="sim-item-label">Receita</div><div class="sim-item-val" style="color:var(--lime);">${fmt(rec)}</div></div>
    <div class="sim-item"><div class="sim-item-label">Despesas</div><div class="sim-item-val" style="color:var(--pink);">${fmt(desp)}</div></div>
    <div class="sim-item"><div class="sim-item-label">Resultado</div><div class="sim-item-val" style="color:${c};">${fmt(lucro)}</div></div>`;
}

