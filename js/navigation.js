function goTo(id,btn){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
  document.getElementById('page-'+id).classList.add('active');
  btn.classList.add('active');
  const titles={jogadores:'Jogadores',categorias:'Categorias',premiacao:'Premiação',financeiro:'Financeiro',patrocinios:'Patrocínios',dashboard:'Dashboard',marketing:'Marketing',story:'Story Dupla',chaveamento:'Chaveamento',simulacao:'Simulação'};
  document.getElementById('topbar-title').textContent=titles[id]||id;
  if(id==='financeiro')renderFinanceiro();
  if(id==='categorias')renderCategorias();
  if(id==='patrocinios')renderPatrocinios();
  if(id==='dashboard')renderDashboard();
  if(id==='marketing')renderMarketing();
  if(id==='chaveamento')renderChaveamento();
  if(id==='simulacao')renderSimulacao();
  closeSidebar();
}
function navKey(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();e.currentTarget.click();}}
function toggleSidebar(){document.getElementById('sidebar').classList.toggle('open');document.getElementById('overlay').classList.toggle('open');}
function closeSidebar(){document.getElementById('sidebar').classList.remove('open');document.getElementById('overlay').classList.remove('open');}
