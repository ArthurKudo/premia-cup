// ===== MARKETING =====
let mktMesAtual = new Date();
mktMesAtual.setDate(1);
let editingPostId = null;

const TIPO_ICON = {'Feed — Foto':'🖼','Feed — Carrossel':'🗂','Feed — Vídeo':'🎬','Stories':'⭕','Reels':'🎵'};
const STATUS_BADGE = {'Ideia':'badge-gray','Agendado':'badge-purple','Publicado':'badge-lime','Atrasado':'badge-red'};

function statusAutoPost(p){
  if(p.status==='Publicado') return 'Publicado';
  const hoje = new Date(); hoje.setHours(0,0,0,0);
  const data = new Date(p.data+'T00:00:00');
  if(data < hoje && p.status!=='Publicado') return 'Atrasado';
  return p.status||'Ideia';
}

function addPost(){
  const titulo=document.getElementById('mkt-titulo').value.trim();
  const data=document.getElementById('mkt-data').value;
  if(!titulo){toast('Informe o título do post','pink');return;}
  if(!data){toast('Informe a data do post','pink');return;}
  if(!S.posts) S.posts=[];
  S.posts.push({
    id:uid(), titulo,
    tipo:document.getElementById('mkt-tipo').value,
    data, hora:document.getElementById('mkt-hora').value,
    legenda:document.getElementById('mkt-legenda').value.trim(),
    hashtags:document.getElementById('mkt-hashtags').value.trim(),
    status:'Agendado', alcance:0, curtidas:0, salvamentos:0
  });
  save();
  document.getElementById('mkt-titulo').value='';
  document.getElementById('mkt-data').value='';
  document.getElementById('mkt-legenda').value='';
  document.getElementById('mkt-hashtags').value='';
  renderMarketing(); toast('Post adicionado!');
}

function abrirPost(id){
  const p=(S.posts||[]).find(p=>p.id===id);
  if(!p)return;
  editingPostId=id;
  document.getElementById('mp-titulo-header').textContent=p.titulo;
  document.getElementById('mp-titulo').value=p.titulo;
  document.getElementById('mp-tipo').value=p.tipo;
  document.getElementById('mp-data').value=p.data;
  document.getElementById('mp-hora').value=p.hora||'18:00';
  document.getElementById('mp-legenda').value=p.legenda||'';
  document.getElementById('mp-hashtags').value=p.hashtags||'';
  document.getElementById('mp-status').value=p.status==='Atrasado'?'Agendado':p.status;
  document.getElementById('mp-alcance').value=p.alcance||0;
  document.getElementById('mp-curtidas').value=p.curtidas||0;
  document.getElementById('mp-salvamentos').value=p.salvamentos||0;
  document.getElementById('modal-post').classList.add('open');
}
function closeModalPost(){document.getElementById('modal-post').classList.remove('open');editingPostId=null;}
function salvarPost(){
  const p=(S.posts||[]).find(p=>p.id===editingPostId);
  if(!p)return;
  p.titulo=document.getElementById('mp-titulo').value.trim();
  p.tipo=document.getElementById('mp-tipo').value;
  p.data=document.getElementById('mp-data').value;
  p.hora=document.getElementById('mp-hora').value;
  p.legenda=document.getElementById('mp-legenda').value.trim();
  p.hashtags=document.getElementById('mp-hashtags').value.trim();
  p.status=document.getElementById('mp-status').value;
  p.alcance=parseInt(document.getElementById('mp-alcance').value)||0;
  p.curtidas=parseInt(document.getElementById('mp-curtidas').value)||0;
  p.salvamentos=parseInt(document.getElementById('mp-salvamentos').value)||0;
  save(); closeModalPost(); renderMarketing(); toast('Post salvo!');
}
function remPostModal(){
  confirmarAcao('Remover este post?',()=>{
    S.posts=(S.posts||[]).filter(p=>p.id!==editingPostId);
    save(); closeModalPost(); renderMarketing(); toast('Post removido','pink');
  });
}

function mesAnterior(){mktMesAtual.setMonth(mktMesAtual.getMonth()-1);renderCalendario();}
function mesSeguinte(){mktMesAtual.setMonth(mktMesAtual.getMonth()+1);renderCalendario();}

function renderMarketing(){
  if(!S.posts) S.posts=[];
  const posts=S.posts;
  const total=posts.length;
  const publicados=posts.filter(p=>p.status==='Publicado').length;
  const agendados=posts.filter(p=>statusAutoPost(p)==='Agendado').length;
  const atrasados=posts.filter(p=>statusAutoPost(p)==='Atrasado').length;
  const alcanceTotal=posts.reduce((s,p)=>s+(p.alcance||0),0);
  const curtidasTotal=posts.reduce((s,p)=>s+(p.curtidas||0),0);

  document.getElementById('mkt-metrics').innerHTML=`
    <div class="metric-card purple"><div class="mc-label">Total posts</div><div class="mc-value">${total}</div></div>
    <div class="metric-card lime"><div class="mc-label">Publicados</div><div class="mc-value green">${publicados}</div></div>
    <div class="metric-card purple"><div class="mc-label">Agendados</div><div class="mc-value purple">${agendados}</div></div>
    <div class="metric-card pink"><div class="mc-label">Atrasados</div><div class="mc-value red">${atrasados}</div></div>
    <div class="metric-card lime"><div class="mc-label">Alcance total</div><div class="mc-value green">${alcanceTotal.toLocaleString('pt-BR')}</div></div>
    <div class="metric-card amber"><div class="mc-label">Curtidas total</div><div class="mc-value amber">${curtidasTotal.toLocaleString('pt-BR')}</div></div>
  `;
  document.getElementById('nb-mkt').textContent=total;
  renderCalendario();
  renderPosts();
}

function renderCalendario(){
  const MESES=['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
  const DIAS=['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
  const ano=mktMesAtual.getFullYear();
  const mes=mktMesAtual.getMonth();
  document.getElementById('mkt-mes-label').textContent=`${MESES[mes]} ${ano}`;

  const primeiroDia=new Date(ano,mes,1).getDay();
  const diasNoMes=new Date(ano,mes+1,0).getDate();
  const hoje=new Date(); hoje.setHours(0,0,0,0);

  const postsPorDia={};
  (S.posts||[]).forEach(p=>{
    if(!p.data)return;
    const d=new Date(p.data+'T00:00:00');
    if(d.getFullYear()===ano&&d.getMonth()===mes){
      const dia=d.getDate();
      if(!postsPorDia[dia])postsPorDia[dia]=[];
      postsPorDia[dia].push(p);
    }
  });

  let html=`<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:4px;margin-bottom:6px;">
    ${DIAS.map(d=>`<div style="text-align:center;font-family:'Barlow Condensed',sans-serif;font-size:11px;font-weight:700;letter-spacing:.06em;color:var(--text3);padding:4px 0;">${d}</div>`).join('')}
  </div>
  <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:4px;">`;

  for(let i=0;i<primeiroDia;i++){
    html+=`<div style="min-height:64px;"></div>`;
  }

  for(let d=1;d<=diasNoMes;d++){
    const dataAtual=new Date(ano,mes,d);
    const ehHoje=dataAtual.getTime()===hoje.getTime();
    const posts=postsPorDia[d]||[];
    html+=`<div style="min-height:64px;background:${ehHoje?'rgba(139,63,216,0.15)':'var(--black3)'};border:1px solid ${ehHoje?'var(--purple)':'var(--border)'};border-radius:var(--r);padding:6px;cursor:default;">
      <div style="font-family:'Barlow Condensed',sans-serif;font-size:12px;font-weight:700;color:${ehHoje?'var(--purple-light)':'var(--text3)'};">${d}</div>
      ${posts.slice(0,2).map(p=>{
        const st=statusAutoPost(p);
        const cor=st==='Publicado'?'var(--lime)':st==='Atrasado'?'var(--pink)':'var(--purple-light)';
        return`<div tabindex="0" role="button" onkeydown="navKey(event)" onclick="abrirPost(${p.id})" style="margin-top:3px;background:${st==='Publicado'?'rgba(170,255,0,0.1)':st==='Atrasado'?'rgba(255,27,173,0.1)':'rgba(139,63,216,0.12)'};border-radius:4px;padding:2px 5px;font-size:10px;font-family:'Barlow Condensed',sans-serif;font-weight:600;color:${cor};cursor:pointer;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="${p.titulo}">${TIPO_ICON[p.tipo]||'📄'} ${p.titulo}</div>`;
      }).join('')}
      ${posts.length>2?`<div style="font-size:10px;color:var(--text3);margin-top:2px;font-family:'Barlow Condensed',sans-serif;">+${posts.length-2} mais</div>`:''}
    </div>`;
  }
  html+=`</div>`;
  document.getElementById('mkt-calendario').innerHTML=html;
}

function renderPosts(){
  if(!S.posts) S.posts=[];
  const fstatus=document.getElementById('mkt-filtro-status').value;
  const ftipo=document.getElementById('mkt-filtro-tipo').value;
  const lista=[...S.posts]
    .sort((a,b)=>a.data>b.data?1:-1)
    .filter(p=>{
      const st=statusAutoPost(p);
      if(fstatus&&st!==fstatus)return false;
      if(ftipo&&p.tipo!==ftipo)return false;
      return true;
    });
  const tb=document.getElementById('mkt-tbody');
  const empty=document.getElementById('mkt-empty');
  if(!lista.length){tb.innerHTML='';empty.style.display='block';return;}
  empty.style.display='none';
  tb.innerHTML=lista.map(p=>{
    const st=statusAutoPost(p);
    const dataFmt=p.data?new Date(p.data+'T00:00:00').toLocaleDateString('pt-BR'):'—';
    return`<tr tabindex="0" role="button" onkeydown="navKey(event)" style="cursor:pointer;" onclick="abrirPost(${p.id})">
      <td style="font-family:'Barlow Condensed',sans-serif;font-weight:600;">${dataFmt}</td>
      <td style="color:var(--text3);">${p.hora||'—'}</td>
      <td style="font-weight:500;">${p.titulo}</td>
      <td><span style="font-size:13px;">${TIPO_ICON[p.tipo]||''} ${p.tipo}</span></td>
      <td><span class="badge ${STATUS_BADGE[st]||'badge-gray'}">${st}</span></td>
      <td style="font-family:'Bebas Neue',sans-serif;font-size:15px;color:var(--lime);">${(p.alcance||0).toLocaleString('pt-BR')}</td>
      <td style="font-family:'Bebas Neue',sans-serif;font-size:15px;color:var(--purple-light);">${(p.curtidas||0).toLocaleString('pt-BR')}</td>
      <td style="font-family:'Bebas Neue',sans-serif;font-size:15px;color:var(--amber);">${(p.salvamentos||0).toLocaleString('pt-BR')}</td>
      <td><button class="btn btn-sm btn-ghost" onclick="event.stopPropagation();abrirPost(${p.id})">✏️</button></td>
    </tr>`;
  }).join('');
}

