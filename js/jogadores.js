function updateChip(cb,key){
  const chip=document.getElementById('chip-'+key);
  if(cb.checked)chip.classList.add('checked-'+key);else chip.classList.remove('checked-'+key);
  const sel=[...document.querySelectorAll('#cat-chips input:checked')];
  const el=document.getElementById('preco-preview');
  if(!sel.length){el.textContent='';return;}
  el.textContent=sel.length===1?fmt(120):sel.length===2?`${fmt(200)} — 2 cats`:fmt(260)+' — 3 cats';
}
function updateEditChip(cb,key){
  const chip=document.getElementById('e-chip-'+key);
  if(cb.checked)chip.classList.add('checked-'+key);else chip.classList.remove('checked-'+key);
  const sel=[...document.querySelectorAll('#modal-edit .cat-chip input:checked')];
  document.getElementById('e-preco').textContent=sel.length?fmt(preco(sel.length)):'';
}

function addJogador(){
  const nome=document.getElementById('j-nome').value.trim();
  const tel=document.getElementById('j-tel').value.trim();
  const cats=[...document.querySelectorAll('#cat-chips input:checked')].map(c=>c.value);
  if(!nome){toast('Informe o nome do jogador','pink');return;}
  if(!cats.length){toast('Selecione ao menos uma categoria','pink');return;}
  S.jogadores.push({id:uid(),nome,tel,gen:document.getElementById('j-gen').value,tam:document.getElementById('j-tam').value,cats,pag:document.getElementById('j-pag').value});
  save();
  document.getElementById('j-nome').value=''; document.getElementById('j-tel').value='';
  document.getElementById('j-gen').value='M'; document.getElementById('j-tam').value='';
  document.querySelectorAll('#cat-chips input').forEach(c=>c.checked=false);
  ['Bronze','Iniciante','Mista','Estreante'].forEach(k=>document.getElementById('chip-'+k).className='cat-chip');
  document.getElementById('preco-preview').textContent='';
  renderJogadores(); renderMetricas();
  toast(`${nome} cadastrado!`);
}
function remJogador(id){
  confirmarAcao('Remover este jogador da lista?',()=>{
    S.jogadores=S.jogadores.filter(j=>j.id!==id);
    save(); renderJogadores(); renderMetricas(); toast('Jogador removido','pink');
  });
}
function togglePag(id){
  const j=S.jogadores.find(j=>j.id===id);
  if(!j)return;
  j.pag=j.pag==='Pago'?'Pendente':'Pago';
  save(); renderJogadores(); renderMetricas();
  toast(j.pag==='Pago'?`${j.nome} — Pago ✓`:`${j.nome} — Pendente`);
}
function abrirEditar(id){
  const j=S.jogadores.find(j=>j.id===id);
  if(!j)return;
  editingId=id;
  document.getElementById('e-nome').value=j.nome;
  document.getElementById('e-tel').value=j.tel||'';
  document.getElementById('e-gen').value=j.gen||'M';
  document.getElementById('e-tam').value=j.tam||'';
  document.getElementById('e-pag').value=j.pag;
  ['Bronze','Iniciante','Mista','Estreante'].forEach(k=>{
    const chip=document.getElementById('e-chip-'+k);
    const cb=chip.querySelector('input');
    const checked=j.cats.includes(cb.value);
    cb.checked=checked;
    chip.className='cat-chip'+(checked?' checked-'+k:'');
  });
  document.getElementById('e-preco').textContent=fmt(preco(j.cats.length));
  document.getElementById('modal-edit').classList.add('open');
}
function salvarEdicao(){
  const j=S.jogadores.find(j=>j.id===editingId);
  if(!j)return;
  const nome=document.getElementById('e-nome').value.trim();
  const cats=[...document.querySelectorAll('#modal-edit .cat-chip input:checked')].map(c=>c.value);
  if(!nome||!cats.length){toast('Preencha nome e categorias','pink');return;}
  j.nome=nome; j.tel=document.getElementById('e-tel').value.trim();
  j.gen=document.getElementById('e-gen').value;
  j.tam=document.getElementById('e-tam').value;
  j.cats=cats; j.pag=document.getElementById('e-pag').value;
  save(); closeModal(); renderJogadores(); renderMetricas(); toast('Dados atualizados!');
}
function closeModal(){document.getElementById('modal-edit').classList.remove('open');editingId=null;}

let mcCallback=null;
function confirmarAcao(msg,cb){
  document.getElementById('mc-msg').textContent=msg;
  mcCallback=cb;
  document.getElementById('modal-confirm').classList.add('open');
}
function closeModalConfirm(){document.getElementById('modal-confirm').classList.remove('open');mcCallback=null;}
function mcConfirmado(){const cb=mcCallback;closeModalConfirm();if(cb)cb();}

function renderJogadores(){
  const busca=document.getElementById('busca').value.toLowerCase();
  const fcat=document.getElementById('filtro-cat').value;
  const fpag=document.getElementById('filtro-pag').value;
  const lista=S.jogadores.filter(j=>{
    if(busca&&!j.nome.toLowerCase().includes(busca)&&!(j.tel||'').toLowerCase().includes(busca))return false;
    if(fcat&&!j.cats.includes(fcat))return false;
    if(fpag&&j.pag!==fpag)return false;
    return true;
  });
  const tb=document.getElementById('jog-tbody');
  const empty=document.getElementById('jog-empty');
  if(!lista.length){tb.innerHTML='';empty.style.display='block';return;}
  empty.style.display='none';
  tb.innerHTML=lista.map(j=>`<tr>
    <td style="color:var(--text3);font-size:12px;">${S.jogadores.indexOf(j)+1}</td>
    <td style="font-family:'Barlow Condensed',sans-serif;font-size:15px;font-weight:600;">${j.nome}</td>
    <td style="color:var(--text3);font-size:12px;">${j.tel||'—'}</td>
    <td><span class="badge ${j.gen==='F'?'badge-pink':'badge-purple'}">${j.gen==='F'?'Fem':'Masc'}</span></td>
    <td><span class="badge badge-gray">${j.tam||'—'}</span></td>
    <td><div style="display:flex;gap:4px;flex-wrap:wrap;">${j.cats.map(c=>`<span class="badge ${catBadge[c]||'badge-gray'}">${c}</span>`).join('')}</div></td>
    <td style="font-family:'Bebas Neue',sans-serif;font-size:16px;color:var(--lime);letter-spacing:.5px;">${fmt(preco(j.cats.length))}</td>
    <td><button onclick="togglePag(${j.id})" class="badge ${pagBadge[j.pag]}" style="border:none;cursor:pointer;">${j.pag}</button></td>
    <td><div style="display:flex;gap:4px;">
      <button class="btn btn-sm btn-ghost" onclick="abrirEditar(${j.id})">✏️</button>
      <button class="btn btn-sm btn-ghost btn-danger" onclick="remJogador(${j.id})">🗑</button>
    </div></td>
  </tr>`).join('');
}

function renderMetricas(){
  const total=S.jogadores.length;
  const pagos=S.jogadores.filter(j=>j.pag==='Pago').length;
  const recTotal=S.jogadores.reduce((s,j)=>s+preco(j.cats.length),0);
  const recPago=S.jogadores.filter(j=>j.pag==='Pago').reduce((s,j)=>s+preco(j.cats.length),0);
  document.getElementById('jog-metrics').innerHTML=`
    <div class="metric-card purple"><div class="mc-label">Jogadores</div><div class="mc-value">${total}</div></div>
    <div class="metric-card lime"><div class="mc-label">Pagos</div><div class="mc-value green">${pagos}</div><div class="progress"><div class="progress-fill" style="width:${total?Math.round(pagos/total*100):0}%"></div></div></div>
    <div class="metric-card amber"><div class="mc-label">Pendentes</div><div class="mc-value amber">${total-pagos}</div></div>
    <div class="metric-card lime"><div class="mc-label">Receita inscrições</div><div class="mc-value green">${fmt(recTotal)}</div></div>
    <div class="metric-card purple"><div class="mc-label">Já recebido</div><div class="mc-value purple">${fmt(recPago)}</div></div>
    <div class="metric-card pink"><div class="mc-label">A receber</div><div class="mc-value amber">${fmt(recTotal-recPago)}</div></div>`;
  document.getElementById('nb-jogadores').textContent=total;
}

function renderCategorias(){
  const catMap={};CATS.forEach(c=>catMap[c]=[]);
  S.jogadores.forEach(j=>j.cats.forEach(c=>{if(catMap[c])catMap[c].push(j);}));
  if(!S.duplas)S.duplas={};
  document.getElementById('cat-metrics').innerHTML=CATS.map(c=>{
    const duplasC=(S.duplas[c]||[]).length;
    return`<div class="metric-card ${c==='Bronze'?'amber':c==='Iniciante'?'purple':c==='Mista Iniciante'?'lime':'pink'}">
      <div class="mc-label">${c}</div><div class="mc-value">${catMap[c].length}</div>
      <div class="mc-sub">${duplasC} dupla${duplasC!==1?'s':''} formada${duplasC!==1?'s':''}</div>
      <div class="progress"><div class="progress-fill ${c==='Bronze'?'pink':c==='Mista Iniciante'?'':'purple'}" style="width:${Math.min(100,Math.round(catMap[c].length/48*100))}%"></div></div>
    </div>`;}).join('');
  document.getElementById('cat-sections').innerHTML=CATS.map(c=>{
    const duplasC=S.duplas[c]||[];
    const jogadores=catMap[c];
    return`<div class="card">
      <div class="card-header">
        <div class="card-title"><span class="badge ${catBadge[c]||'badge-gray'}" style="font-size:13px;">${c}</span></div>
        <div style="display:flex;align-items:center;gap:10px;">
          <span style="font-size:13px;color:var(--text3);font-family:'Barlow Condensed',sans-serif;">${jogadores.length} jogador${jogadores.length!==1?'es':''}</span>
          <button class="btn btn-sm btn-primary" onclick="abrirModalDupla('${c}')">🤝 Formar dupla</button>
        </div>
      </div>
      <div class="card-body">
        ${duplasC.length?`
          <div style="font-family:'Barlow Condensed',sans-serif;font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--text3);margin-bottom:10px;">Duplas formadas (${duplasC.length})</div>
          <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:8px;margin-bottom:16px;">
            ${duplasC.map((d,i)=>`
              <div style="background:var(--black3);border:1px solid var(--border);border-radius:var(--r);padding:10px 14px;display:flex;align-items:center;justify-content:space-between;">
                <div>
                  <div style="font-family:'Barlow Condensed',sans-serif;font-size:14px;font-weight:700;color:var(--lime);">#${i+1} ${d.a1} <span style="color:var(--text3);">&</span> ${d.a2}</div>
                </div>
                <button class="btn btn-sm btn-ghost btn-danger" onclick="remDupla('${c}',${i})">🗑</button>
              </div>`).join('')}
          </div>
          <div style="height:1px;background:var(--border);margin-bottom:14px;"></div>
        `:''}
        ${jogadores.length?`
          <div style="font-family:'Barlow Condensed',sans-serif;font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--text3);margin-bottom:10px;">Atletas inscritos</div>
          <div class="player-list">${jogadores.map(j=>`
            <div class="player-chip">
              <div><div class="player-chip-name">${j.nome}</div><div class="player-chip-sub">${j.tel||'—'} · ${j.cats.length} cat.</div></div>
              <span class="badge ${pagBadge[j.pag]}">${j.pag}</span>
            </div>`).join('')}</div>`
        :`<div class="empty-state" style="padding:20px;"><div class="empty-icon">👤</div><div class="empty-text">Nenhum jogador</div></div>`}
      </div>
    </div>`;}).join('');
}

