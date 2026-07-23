function abrirModalDupla(cat){
  document.getElementById('fd-cat').value=cat;
  atualizarSelectsDupla();
  document.getElementById('modal-dupla').classList.add('open');
}
function closeModalDupla(){document.getElementById('modal-dupla').classList.remove('open');}
function atualizarSelectsDupla(){
  const cat=document.getElementById('fd-cat').value;
  const catMap={};CATS.forEach(c=>catMap[c]=[]);
  S.jogadores.forEach(j=>j.cats.forEach(c=>{if(catMap[c])catMap[c].push(j);}));
  const jogs=catMap[cat]||[];
  const emDupla=new Set((S.duplas&&S.duplas[cat]||[]).flatMap(d=>[d.a1,d.a2]));
  const livres=jogs.filter(j=>!emDupla.has(j.nome));
  const opts=livres.map(j=>`<option value="${j.nome}">${j.nome}</option>`).join('');
  const empty='<option value="">Nenhum atleta disponível</option>';
  document.getElementById('fd-a1').innerHTML=opts||empty;
  document.getElementById('fd-a2').innerHTML=opts||empty;
}
function confirmarDupla(){
  const cat=document.getElementById('fd-cat').value;
  const a1=document.getElementById('fd-a1').value;
  const a2=document.getElementById('fd-a2').value;
  if(!a1||!a2){toast('Selecione dois atletas','pink');return;}
  if(a1===a2){toast('Selecione atletas diferentes','pink');return;}
  if(!S.duplas)S.duplas={};
  if(!S.duplas[cat])S.duplas[cat]=[];
  const jaExiste=S.duplas[cat].some(d=>(d.a1===a1&&d.a2===a2)||(d.a1===a2&&d.a2===a1));
  if(jaExiste){toast('Essa dupla já está cadastrada','pink');return;}
  S.duplas[cat].push({a1,a2});
  save(); closeModalDupla(); renderCategorias();
  toast(`Dupla ${a1} & ${a2} formada!`);
}
function remDupla(cat,i){
  S.duplas[cat].splice(i,1);
  save(); renderCategorias(); toast('Dupla removida','pink');
}

function addResultado(){
  const cat=document.getElementById('r-cat').value;
  const pos=parseInt(document.getElementById('r-pos').value);
  const dupla=document.getElementById('r-dupla').value.trim();
  if(!dupla){toast('Informe o nome da dupla','pink');return;}
  if(!S.resultados[cat])S.resultados[cat]={};
  S.resultados[cat][pos]=dupla;
  save(); document.getElementById('r-dupla').value='';
  renderPremiacao(); toast(`Resultado: ${cat} — ${POSICOES[pos]}`);
}
function remResultado(cat,pos){
  if(S.resultados[cat])delete S.resultados[cat][pos];
  save(); renderPremiacao();
}
