// ===== CHAVEAMENTO =====
function calcRoundsWB(n){ return Math.ceil(Math.log2(n)); }
function calcJogosWB(n){
  let matches=0; let teams=n;
  while(teams>1){ matches+=Math.floor(teams/2); teams=Math.ceil(teams/2); }
  return matches;
}
function calcRoundsLB(n){
  return Math.max(1, 2*(calcRoundsWB(n)-1));
}
function calcJogosLB(n){
  const wbRounds=calcRoundsWB(n);
  let losers=0;
  let lbTeams=0;
  for(let r=1;r<=wbRounds-1;r++){
    const wbMatchesThisRound=Math.floor(n/Math.pow(2,r));
    lbTeams+=wbMatchesThisRound;
    const lbMatchesRound1=Math.floor(lbTeams/2);
    losers+=lbMatchesRound1;
    lbTeams=lbTeams-lbMatchesRound1;
  }
  return losers;
}
function calcTotalJogos(n){
  return calcJogosWB(n)+calcJogosLB(n)+1;
}

function getChvParams(){
  if(!S.chvParams) S.chvParams={};
  return S.chvParams;
}

function salvarChvParams(){
  if(!S.chvParams) S.chvParams={};
  CATS.forEach(c=>{
    const el=document.getElementById('chv-tempo-'+c.replace(/ /g,'_'));
    if(el) S.chvParams[c]=parseInt(el.value)||25;
  });
  save(); renderChaveamento(); toast('Parâmetros salvos!');
}

function getTemplo(cat){
  const p=getChvParams();
  return p[cat]||25;
}

function getNDuplas(cat){
  if(!S.duplas||!S.duplas[cat]) return 0;
  return S.duplas[cat].length;
}

function renderChaveamento(){
  if(!S.chvParams) S.chvParams={};

  const DIAS=[
    {id:'d1',label:'Dia 1',cats:['Iniciante','Estreante'],cor:'var(--purple-light)'},
    {id:'d2',label:'Dia 2',cats:['Bronze','Mista Iniciante'],cor:'var(--lime)'},
  ];

  let totalJogosGeral=0;
  let totalMinGeral=0;
  const allTimings=[];

  DIAS.forEach(dia=>{
    const quadras=parseInt(document.getElementById('chv-quadras-'+dia.id)?.value)||3;
    const intervalo=parseInt(document.getElementById('chv-intervalo-'+dia.id)?.value)||5;
    const inicioStr=document.getElementById('chv-inicio-'+dia.id)?.value||'08:00';
    const [hIni,mIni]=inicioStr.split(':').map(Number);

    const pEl=document.getElementById('chv-params-'+dia.id);
    if(pEl){
      pEl.innerHTML=dia.cats.map(c=>{
        const key=c.replace(/ /g,'_');
        const val=S.chvParams[c]||25;
        const nd=getNDuplas(c);
        return`<div style="background:var(--black3);border:1px solid var(--border);border-radius:var(--r);padding:12px 14px;">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
            <span class="badge ${catBadge[c]||'badge-gray'}" style="font-size:12px;">${c}</span>
            <span style="font-size:11px;color:var(--text3);font-family:'Barlow Condensed',sans-serif;">${nd} dupla${nd!==1?'s':''}</span>
          </div>
          <div style="display:flex;flex-direction:column;gap:4px;">
            <label>Tempo por jogo (min)</label>
            <input type="number" id="chv-tempo-${key}" value="${val}" min="10" max="120" style="width:100%;" oninput="renderChaveamento()">
          </div>
        </div>`;
      }).join('');
    }

    const diaTimings=dia.cats.map(c=>{
      const nd=getNDuplas(c);
      if(nd<2) return{cat:c,nd,skip:true,dia:dia.id,corDia:dia.cor};
      const tempo=getTemplo(c);
      const t=calcCatTiming(c,quadras,intervalo,0,nd,tempo);
      return{...t,dia:dia.id,corDia:dia.cor};
    });
    const valid=diaTimings.filter(t=>!t.skip);
    valid.forEach(t=>totalJogosGeral+=t.totalJogos);

    let diaMin=0;
    if(valid.length===2){
      const ov=calcOverlap(valid[0],valid[1],quadras,valid[0].tempo,intervalo);
      diaMin=ov.totalDay;
      valid[0].inicioMin=hIni*60+mIni;
      valid[0].fimMin=valid[0].inicioMin+valid[0].duracaoMin;
      valid[1].inicioMin=hIni*60+mIni+ov.bStartOffset;
      valid[1].fimMin=valid[1].inicioMin+valid[1].duracaoMin;
    } else if(valid.length===1){
      valid[0].inicioMin=hIni*60+mIni;
      valid[0].fimMin=valid[0].inicioMin+valid[0].duracaoMin;
      diaMin=valid[0].duracaoMin;
    }
    const fimDia=(hIni*60+mIni)+diaMin;
    totalMinGeral+=diaMin;
    allTimings.push({...dia, timings:diaTimings, hIni, mIni, fimMin:fimDia, diaMin, quadras, intervalo});

    const tlEl=document.getElementById('chv-timeline-'+dia.id);
    if(tlEl){
      const vt=diaTimings.filter(t=>!t.skip);
      if(!vt.length){tlEl.innerHTML='';} else {renderTimeline(tlEl,vt,hIni,mIni,fimDia,dia.cor);}
    }
  });

  document.getElementById('chv-metrics').innerHTML=`
    <div class="metric-card purple"><div class="mc-label">Total jogos</div><div class="mc-value">${totalJogosGeral}</div></div>
    <div class="metric-card lime"><div class="mc-label">Dia 1 — duração</div><div class="mc-value green">${fmtDur(allTimings[0].diaMin)}</div><div class="mc-sub">Iniciante & Estreante · até ${fmtHora(allTimings[0].fimMin)}</div></div>
    <div class="metric-card purple"><div class="mc-label">Dia 2 — duração</div><div class="mc-value purple">${fmtDur(allTimings[1].diaMin)}</div><div class="mc-sub">Bronze & Mista · até ${fmtHora(allTimings[1].fimMin)}</div></div>
    <div class="metric-card amber"><div class="mc-label">Quadras</div><div class="mc-value amber">${allTimings[0].quadras} / ${allTimings[1].quadras}</div><div class="mc-sub">Dia 1 / Dia 2</div></div>
  `;

  const brEl=document.getElementById('chv-brackets');
  if(brEl){
    brEl.innerHTML=allTimings.map(dia=>{
      const validT=dia.timings.filter(t=>!t.skip&&t.nd>=2);
      if(!validT.length) return`<div class="card"><div class="card-header"><div class="card-title">📅 <span style="color:${dia.cor};">${dia.label}</span> — ${dia.label==='Dia 1'?'Iniciante & Estreante':'Bronze & Mista Iniciante'}</div></div><div class="card-body"><div class="empty-state" style="padding:16px;"><div class="empty-icon">🤝</div><div class="empty-text">Forme duplas nas categorias deste dia</div></div></div></div>`;
      return validT.map(t=>`<div class="card">
        <div class="card-header" style="border-left:3px solid ${dia.cor};padding-left:17px;">
          <div class="card-title">
            <span style="font-size:11px;font-family:'Barlow Condensed',sans-serif;color:${dia.cor};font-weight:700;letter-spacing:.06em;text-transform:uppercase;">${dia.label}</span>
            <span class="badge ${catBadge[t.cat]||'badge-gray'}" style="font-size:13px;">${t.cat}</span>
            <span style="color:var(--text3);font-weight:400;font-size:13px;">${t.nd} duplas · ${t.totalJogos} jogos · ${fmtDur(t.duracaoMin)}</span>
          </div>
          <div style="font-family:'Barlow Condensed',sans-serif;font-size:13px;color:var(--text3);">${fmtHora(t.inicioMin)} – ${fmtHora(t.fimMin)}</div>
        </div>
        <div class="card-body">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
            <div>
              <div style="font-family:'Bebas Neue',sans-serif;font-size:14px;letter-spacing:1px;color:var(--lime);margin-bottom:10px;">Winners Bracket</div>
              ${t.wbRounds.map(r=>`<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--border);font-size:13px;">
                <span style="font-family:'Barlow Condensed',sans-serif;font-weight:600;">${r.nome}</span>
                <span style="font-family:'Bebas Neue',sans-serif;font-size:16px;color:var(--lime);">${r.jogos} jogo${r.jogos!==1?'s':''}</span>
              </div>`).join('')}
            </div>
            <div>
              <div style="font-family:'Bebas Neue',sans-serif;font-size:14px;letter-spacing:1px;color:var(--purple-light);margin-bottom:10px;">Losers Bracket</div>
              ${t.lbRounds.map(r=>`<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--border);font-size:13px;">
                <span style="font-family:'Barlow Condensed',sans-serif;font-weight:600;">${r.nome}</span>
                <span style="font-family:'Bebas Neue',sans-serif;font-size:16px;color:var(--purple-light);">${r.jogos} jogo${r.jogos!==1?'s':''}</span>
              </div>`).join('')}
              <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;font-size:13px;">
                <span style="font-family:'Barlow Condensed',sans-serif;font-weight:600;color:var(--pink);">Grand Final</span>
                <span style="font-family:'Bebas Neue',sans-serif;font-size:16px;color:var(--pink);">1 jogo</span>
              </div>
            </div>
          </div>
          <div style="margin-top:14px;padding:10px 14px;background:var(--black3);border-radius:var(--r);display:flex;gap:24px;flex-wrap:wrap;">
            <div><div style="font-size:11px;color:var(--text3);font-family:'Barlow Condensed',sans-serif;text-transform:uppercase;letter-spacing:.06em;">Tempo/jogo</div><div style="font-family:'Bebas Neue',sans-serif;font-size:20px;color:var(--text);">${t.tempo} min</div></div>
            <div><div style="font-size:11px;color:var(--text3);font-family:'Barlow Condensed',sans-serif;text-transform:uppercase;letter-spacing:.06em;">Total jogos</div><div style="font-family:'Bebas Neue',sans-serif;font-size:20px;color:var(--lime);">${t.totalJogos}</div></div>
            <div><div style="font-size:11px;color:var(--text3);font-family:'Barlow Condensed',sans-serif;text-transform:uppercase;letter-spacing:.06em;">Duração</div><div style="font-family:'Bebas Neue',sans-serif;font-size:20px;color:var(--purple-light);">${fmtDur(t.duracaoMin)}</div></div>
            <div><div style="font-size:11px;color:var(--text3);font-family:'Barlow Condensed',sans-serif;text-transform:uppercase;letter-spacing:.06em;">Início / Fim</div><div style="font-family:'Bebas Neue',sans-serif;font-size:20px;color:${dia.cor};">${fmtHora(t.inicioMin)} – ${fmtHora(t.fimMin)}</div></div>
          </div>
        </div>
      </div>`).join('');
    }).join('');
  }
}

function fmtDur(min){return Math.floor(min/60)+'h'+(min%60).toString().padStart(2,'0')+'m';}
function fmtHora(min){
  const h=Math.floor(min/60)%24;
  const m=min%60;
  return h.toString().padStart(2,'0')+':'+m.toString().padStart(2,'0');
}

// ===== SIMULAÇÃO =====
function buildCatCard(c, dia, defaultNd=8){
  const key=c.replace(/ /g,'_');
  return`<div style="background:var(--black3);border:1px solid var(--border);border-radius:var(--r);padding:12px 14px;">
    <div style="margin-bottom:10px;"><span class="badge ${catBadge[c]||'badge-gray'}" style="font-size:12px;">${c}</span></div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
      <div style="display:flex;flex-direction:column;gap:4px;"><label>Duplas</label>
        <input type="number" id="sim-nd-${key}" value="${defaultNd}" min="2" max="64" oninput="renderSimulacao()" style="width:100%;">
      </div>
      <div style="display:flex;flex-direction:column;gap:4px;"><label>Tempo/jogo (min)</label>
        <input type="number" id="sim-tp-${key}" value="25" min="5" max="120" oninput="renderSimulacao()" style="width:100%;">
      </div>
    </div>
  </div>`;
}

// ===== CORE BRACKET ENGINE =====
function buildRounds(nd) {
  const wbR = calcRoundsWB(nd);
  const wbByRound = [];
  let tw = nd;
  for (let r = 0; r < wbR; r++) {
    wbByRound.push(Math.floor(tw / 2));
    tw = Math.ceil(tw / 2);
  }
  const lbPhases = [];
  let lbPool = 0;
  for (let r = 1; r <= wbR - 1; r++) {
    const newLosers = Math.floor(nd / Math.pow(2, r));
    lbPool += newLosers;
    const phA = Math.floor(lbPool / 2);
    if (phA > 0) lbPhases.push({ afterWBRound: r, jogos: phA });
    lbPool -= phA;
    if (lbPool > 1) {
      const phB = Math.floor(lbPool / 2);
      if (phB > 0) lbPhases.push({ afterWBRound: r, jogos: phB });
      lbPool -= phB;
    }
  }
  const rounds = [];
  let lbIdx = 0;
  for (let r = 0; r < wbR; r++) {
    const wbJ = wbByRound[r];
    let lbJ = 0;
    while (lbIdx < lbPhases.length && lbPhases[lbIdx].afterWBRound <= r) {
      lbJ += lbPhases[lbIdx].jogos;
      lbIdx++;
    }
    const label = r === 0 ? 'Oitavas' : r === 1 ? 'Quartas' : r === 2 ? 'Semifinal' : r === 3 ? 'Final WB' : 'Fase ' + (r + 1);
    rounds.push({ label, wbJogos: wbJ, lbJogos: lbJ });
  }
  while (lbIdx < lbPhases.length) {
    rounds.push({ label: 'LB Fase ' + (rounds.length), wbJogos: 0, lbJogos: lbPhases[lbIdx].jogos });
    lbIdx++;
  }
  rounds.push({ label: 'Grand Final', wbJogos: 0, lbJogos: 0, grandFinal: true });
  return rounds;
}

function calcRoundsDuration(rounds, quadras, tempo, intervalo) {
  let total = 0;
  const slotTime = tempo + intervalo;
  const detail = [];
  for (const r of rounds) {
    if (r.grandFinal) {
      total += slotTime;
      detail.push({ ...r, slots: 1, minutos: slotTime });
      continue;
    }
    const jogos = r.wbJogos + r.lbJogos;
    if (jogos === 0) continue;
    let qWB = 0, qLB = 0;
    if (r.wbJogos > 0 && r.lbJogos > 0) {
      qWB = Math.max(1, Math.round(quadras * r.wbJogos / jogos));
      qLB = Math.max(1, quadras - qWB);
      if (qWB + qLB > quadras) qWB = quadras - qLB;
    } else if (r.wbJogos > 0) {
      qWB = quadras; qLB = 0;
    } else {
      qLB = quadras; qWB = 0;
    }
    const slotsWB = r.wbJogos > 0 ? Math.ceil(r.wbJogos / qWB) : 0;
    const slotsLB = r.lbJogos > 0 ? Math.ceil(r.lbJogos / qLB) : 0;
    const slots = Math.max(slotsWB, slotsLB);
    const minutos = slots * slotTime;
    total += minutos;
    detail.push({ ...r, qWB, qLB, slotsWB, slotsLB, slots, minutos });
  }
  return { total, detail };
}

function calcOverlap(timingA, timingB, quadras, tempo, intervalo) {
  const slotTime = tempo + intervalo;
  let timeA = 0;
  let bStartOffset = null;
  for (const r of timingA.roundDetail) {
    const usedCourts = (r.grandFinal ? 1 : r.qWB + r.qLB) || (r.grandFinal ? 1 : 0);
    const freeCourts = quadras - usedCourts;
    if (freeCourts > 0 && bStartOffset === null) {
      bStartOffset = timeA;
    }
    timeA += r.minutos;
  }
  if (bStartOffset === null) bStartOffset = timeA;
  const bDur = timingB.duracaoMin;
  const bEnd = bStartOffset + bDur;
  const totalDay = Math.max(timeA, bEnd);
  return { bStartOffset, totalDay };
}

function calcCatTiming(c, quadras, intervalo, minAtual, nd_override, tempo_override) {
  const key = c.replace(/ /g, '_');
  const nd = nd_override !== undefined ? nd_override : (parseInt(document.getElementById('sim-nd-' + key)?.value) || 2);
  const tempo = tempo_override !== undefined ? tempo_override : (parseInt(document.getElementById('sim-tp-' + key)?.value) || 25);
  if (nd < 2) return { cat: c, nd, tempo, skip: true };
  const rounds = buildRounds(nd);
  const { total: duracaoMin, detail: roundDetail } = calcRoundsDuration(rounds, quadras, tempo, intervalo);
  const totalJogos = rounds.reduce((s, r) => s + r.wbJogos + r.lbJogos + (r.grandFinal ? 1 : 0), 0);
  const wbRounds = rounds.filter(r => r.wbJogos > 0 || r.grandFinal).map(r => ({ nome: r.label, jogos: r.wbJogos + (r.grandFinal ? 1 : 0) }));
  const lbRounds = rounds.filter(r => r.lbJogos > 0).map((r, i) => ({ nome: 'LB Fase ' + (i + 1), jogos: r.lbJogos }));
  const inicioMin = minAtual;
  const fimMin = inicioMin + duracaoMin;
  return { cat: c, nd, tempo, totalJogos, wbRounds, lbRounds, rounds, roundDetail, inicioMin, fimMin, duracaoMin };
}

function renderTimeline(el, timings, hIni, mIni, fimMin, cor){
  const valid=timings.filter(t=>!t.skip);
  if(!valid.length){el.innerHTML='';return;}
  const barTotal=fimMin-(hIni*60+mIni)||1;
  const colors=['var(--lime)','var(--purple-light)','var(--pink)','#EF9F27'];
  el.innerHTML=`<div style="display:flex;flex-direction:column;gap:8px;margin-bottom:6px;">
    ${valid.map((t,i)=>{
      const c=colors[i%4];
      const left=Math.round((t.inicioMin-(hIni*60+mIni))/barTotal*100);
      const width=Math.max(2,Math.round(t.duracaoMin/barTotal*100));
      return`<div style="display:flex;align-items:center;gap:10px;">
        <div style="font-family:'Barlow Condensed',sans-serif;font-size:12px;font-weight:700;color:var(--text2);width:120px;flex-shrink:0;">${t.cat}</div>
        <div style="flex:1;height:28px;background:var(--black4);border-radius:4px;position:relative;">
          <div style="position:absolute;left:${left}%;width:${width}%;height:100%;background:${c};border-radius:4px;opacity:0.85;"></div>
          <div style="position:absolute;left:${left}%;width:${width}%;height:100%;display:flex;align-items:center;justify-content:center;">
            <span style="font-family:'Barlow Condensed',sans-serif;font-size:11px;font-weight:700;color:#000;white-space:nowrap;">${fmtHora(t.inicioMin)} – ${fmtHora(t.fimMin)} · ${t.nd} duplas · ${t.totalJogos} jogos</span>
          </div>
        </div>
      </div>`;
    }).join('')}
  </div>
  <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--text3);font-family:'Barlow Condensed',sans-serif;">
    <span>${fmtHora(hIni*60+mIni)}</span>
    <span style="color:${cor};font-weight:700;">${fmtHora(fimMin)} · ${fmtDur(fimMin-(hIni*60+mIni))}</span>
  </div>`;
}

function renderBracketCard(t, corDia){
  if(t.skip||t.nd<2) return`<div class="card"><div class="card-header"><div class="card-title"><span class="badge ${catBadge[t.cat]||'badge-gray'}" style="font-size:13px;">${t.cat}</span></div></div><div class="card-body"><div class="empty-state" style="padding:16px;"><div class="empty-icon">🔢</div><div class="empty-text">Mínimo de 2 duplas para gerar chaveamento</div></div></div></div>`;
  return`<div class="card">
    <div class="card-header" style="border-left:3px solid ${corDia};padding-left:17px;">
      <div class="card-title"><span class="badge ${catBadge[t.cat]||'badge-gray'}" style="font-size:13px;">${t.cat}</span> <span style="color:var(--text3);font-weight:400;font-size:13px;">${t.nd} duplas · ${t.totalJogos} jogos · ${fmtDur(t.duracaoMin)}</span></div>
      <div style="font-family:'Barlow Condensed',sans-serif;font-size:13px;color:var(--text3);">${fmtHora(t.inicioMin)} – ${fmtHora(t.fimMin)}</div>
    </div>
    <div class="card-body">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
        <div>
          <div style="font-family:'Bebas Neue',sans-serif;font-size:14px;letter-spacing:1px;color:var(--lime);margin-bottom:10px;">Winners Bracket</div>
          ${t.wbRounds.map(r=>`<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--border);font-size:13px;">
            <span style="font-family:'Barlow Condensed',sans-serif;font-weight:600;">${r.nome}</span>
            <span style="font-family:'Bebas Neue',sans-serif;font-size:16px;color:var(--lime);">${r.jogos} jogo${r.jogos!==1?'s':''}</span>
          </div>`).join('')}
        </div>
        <div>
          <div style="font-family:'Bebas Neue',sans-serif;font-size:14px;letter-spacing:1px;color:var(--purple-light);margin-bottom:10px;">Losers Bracket</div>
          ${t.lbRounds.map(r=>`<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--border);font-size:13px;">
            <span style="font-family:'Barlow Condensed',sans-serif;font-weight:600;">${r.nome}</span>
            <span style="font-family:'Bebas Neue',sans-serif;font-size:16px;color:var(--purple-light);">${r.jogos} jogo${r.jogos!==1?'s':''}</span>
          </div>`).join('')}
          <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;font-size:13px;">
            <span style="font-family:'Barlow Condensed',sans-serif;font-weight:600;color:var(--pink);">Grand Final</span>
            <span style="font-family:'Bebas Neue',sans-serif;font-size:16px;color:var(--pink);">1 jogo</span>
          </div>
        </div>
      </div>
      <div style="margin-top:14px;padding:10px 14px;background:var(--black3);border-radius:var(--r);display:flex;gap:24px;flex-wrap:wrap;">
        <div><div style="font-size:11px;color:var(--text3);font-family:'Barlow Condensed',sans-serif;text-transform:uppercase;letter-spacing:.06em;">Tempo/jogo</div><div style="font-family:'Bebas Neue',sans-serif;font-size:20px;color:var(--text);">${t.tempo} min</div></div>
        <div><div style="font-size:11px;color:var(--text3);font-family:'Barlow Condensed',sans-serif;text-transform:uppercase;letter-spacing:.06em;">Total jogos</div><div style="font-family:'Bebas Neue',sans-serif;font-size:20px;color:var(--lime);">${t.totalJogos}</div></div>
        <div><div style="font-size:11px;color:var(--text3);font-family:'Barlow Condensed',sans-serif;text-transform:uppercase;letter-spacing:.06em;">Duração</div><div style="font-family:'Bebas Neue',sans-serif;font-size:20px;color:var(--purple-light);">${fmtDur(t.duracaoMin)}</div></div>
        <div><div style="font-size:11px;color:var(--text3);font-family:'Barlow Condensed',sans-serif;text-transform:uppercase;letter-spacing:.06em;">Início / Fim</div><div style="font-family:'Bebas Neue',sans-serif;font-size:20px;color:${corDia};">${fmtHora(t.inicioMin)} – ${fmtHora(t.fimMin)}</div></div>
      </div>
    </div>
  </div>`;
}

