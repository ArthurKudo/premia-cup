function renderPatrocinios(){
  const total=S.sponsors.filter(p=>p.status==='Confirmado').reduce((s,p)=>s+p.val,0);
  const conf=S.sponsors.filter(p=>p.status==='Confirmado').length;
  document.getElementById('pat-metrics').innerHTML=`
    <div class="metric-card lime"><div class="mc-label">Arrecadado</div><div class="mc-value green">${fmt(total)}</div></div>
    <div class="metric-card purple"><div class="mc-label">Patrocinadores</div><div class="mc-value">${S.sponsors.length}</div></div>
    <div class="metric-card lime"><div class="mc-label">Confirmados</div><div class="mc-value green">${conf}</div></div>
    <div class="metric-card amber"><div class="mc-label">Em análise</div><div class="mc-value amber">${S.sponsors.filter(p=>p.status==='Em análise'||p.status==='Enviada').length}</div></div>`;
  const tb=document.getElementById('pat-tbody');
  const empty=document.getElementById('pat-empty');
  if(!S.sponsors.length){tb.innerHTML='';empty.style.display='block';return;}
  empty.style.display='none';
  tb.innerHTML=S.sponsors.map((p,i)=>`<tr>
    <td style="font-family:'Barlow Condensed',sans-serif;font-weight:600;font-size:14px;">${p.nome}</td>
    <td><span class="badge badge-gray">${p.cat}</span></td>
    <td style="font-family:'Bebas Neue',sans-serif;font-size:16px;color:var(--lime);letter-spacing:.5px;">${p.val>0?fmt(p.val):'Permuta'}</td>
    <td><span class="badge ${statusBadge[p.status]||'badge-gray'}">${p.status}</span></td>
    <td><button class="btn btn-sm btn-ghost btn-danger" onclick="remSponsor(${i})">🗑</button></td>
  </tr>`).join('');
  document.getElementById('nb-pat').textContent=conf;
}
function addSponsor(){
  const nome=document.getElementById('p-nome').value.trim();
  const val=parseInt(document.getElementById('p-val').value)||0;
  if(!nome){toast('Informe o nome da empresa','pink');return;}
  S.sponsors.push({id:uid(),nome,cat:document.getElementById('p-cat').value,val,status:document.getElementById('p-status').value});
  save(); document.getElementById('p-nome').value=''; document.getElementById('p-val').value='';
  renderPatrocinios(); toast(`${nome} adicionado!`);
}
function remSponsor(i){
  confirmarAcao('Remover este patrocinador?',()=>{
    S.sponsors.splice(i,1); save(); renderPatrocinios(); toast('Removido','pink');
  });
}

