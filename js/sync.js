// ===== JSONBIN CONFIG =====
const BIN_ID = '6a27119bda38895dfe9ba20f';
const API_KEY = '$2a$10$cEuyGQilS7FRcItHcoY75.8CBrCHAze0z9cjiB7dps9u0zGzCTzb2';
const API_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;
let saveTimer = null;
let isSaving = false;

async function loadFromCloud() {
  setSyncStatus('loading','carregando...');
  try {
    const r = await fetch(API_URL+'/latest', {headers:{'X-Master-Key':API_KEY}});
    if(!r.ok) throw new Error('HTTP '+r.status);
    const data = await r.json();
    S = data.record;
    if(!S.jogadores) S.jogadores = [];
    if(!S.resultados) S.resultados = {};
    if(!S.duplas) S.duplas = {};
    if(!S.posts) S.posts = [];
    if(!S.chvParams) S.chvParams = {};
    if(!S.params) S.params = {uniforme:70,trofeuQtd:24,trofeuVal:33,arbQtd:8,arbVal:300,premiacao:4040};
    if(!S.sponsors) S.sponsors = [
      {id:1,nome:'Lonu',cat:'Ouro (R$ 800)',val:0,status:'Confirmado'},
      {id:2,nome:'JMP',cat:'Prata (R$ 400)',val:400,status:'Confirmado'},
      {id:3,nome:'Restaurante Dom Alberto',cat:'Prata (R$ 400)',val:400,status:'Confirmado'},
    ];
    setSyncStatus('ok','sincronizado');
    renderAll();
  } catch(e) {
    setSyncStatus('err','erro de conexão');
    toast('Erro ao carregar dados da nuvem','pink');
  }
}

async function saveToCloud() {
  if(isSaving) return;
  isSaving = true;
  showSavingBar();
  try {
    const r = await fetch(API_URL, {
      method:'PUT',
      headers:{'Content-Type':'application/json','X-Master-Key':API_KEY},
      body: JSON.stringify(S)
    });
    if(!r.ok) throw new Error('HTTP '+r.status);
    setSyncStatus('ok','salvo');
  } catch(e) {
    setSyncStatus('err','erro ao salvar');
    toast('Erro ao salvar na nuvem','pink');
  } finally {
    isSaving = false;
    hideSavingBar();
  }
}

function save() {
  clearTimeout(saveTimer);
  setSyncStatus('loading','salvando...');
  saveTimer = setTimeout(saveToCloud, 800);
}

function forcSync() {
  clearTimeout(saveTimer);
  loadFromCloud();
}

function setSyncStatus(type, label) {
  const dot = document.getElementById('sync-dot');
  const lbl = document.getElementById('sync-label');
  dot.className = 'sync-dot ' + type;
  lbl.textContent = label;
  lbl.style.color = type==='ok'?'var(--lime2)':type==='err'?'var(--pink)':'var(--text3)';
}

function showSavingBar() {
  const b = document.getElementById('saving-bar');
  b.style.width='60%';
}
function hideSavingBar() {
  const b = document.getElementById('saving-bar');
  b.style.width='100%';
  setTimeout(()=>b.style.width='0',400);
}
