# -*- coding: utf-8 -*-
"""
Patch: adiciona a aba "Conferência" ao index.html do Premia Cup.

Aplica substituições direcionadas (busca exata, 1 ocorrência cada) sem
reescrever o arquivo — a string base64 da imagem de fundo do gerador de
stories não é tocada. Aborta sem gravar nada se qualquer âncora não for
encontrada exatamente 1 vez. Cria backup em index.html.bak antes de gravar.

Uso:  python patch_conferencia.py
"""
import shutil
import sys
from pathlib import Path

HTML_PATH = Path(__file__).parent / 'index.html'

# ---------------------------------------------------------------------------
# 1. Nav: item "Conferência" na seção Gestão, após "Categorias"
# ---------------------------------------------------------------------------
NAV_ANCHOR = r'''<div class="nav-item" tabindex="0" role="button" onkeydown="navKey(event)" onclick="goTo('categorias',this)"><span class="nav-icon">🏅</span> Categorias</div>'''
NAV_NEW = NAV_ANCHOR + '\n' + r'''    <div class="nav-item" tabindex="0" role="button" onkeydown="navKey(event)" onclick="goTo('conferencia',this)"><span class="nav-icon">✅</span> Conferência</div>'''

# ---------------------------------------------------------------------------
# 2. Página: inserida antes do bloco de modais
# ---------------------------------------------------------------------------
PAGE_ANCHOR = r'''<!-- MODAL EDITAR -->'''
PAGE_HTML = r'''  <!-- CONFERENCIA -->
  <div class="page" id="page-conferencia">
    <div class="page-header"><div class="page-header-title">Conferência</div><div class="page-header-sub">cruzamento das listas do WhatsApp com as inscrições</div></div>
    <div class="card">
      <div class="card-header"><div class="card-title">📋 <span class="accent">Listas</span> de confirmação</div></div>
      <div class="card-body">
        <div class="form-grid" style="margin-bottom:14px;">
          <div style="display:flex;flex-direction:column;gap:5px;">
            <label>Texto das listas do WhatsApp</label>
            <textarea id="conf-wa-input" rows="12" style="resize:vertical;" placeholder="🏆 Categoria: Bronze&#10;1- Fulano e Beltrano&#10;2- Sicrano e dupla"></textarea>
          </div>
          <div style="display:flex;flex-direction:column;gap:5px;">
            <label>Base de inscrições — opcional (vazio = dados da nuvem)</label>
            <textarea id="conf-csv-input" rows="12" style="resize:vertical;" placeholder="#,Nome,Contato,Categorias,Valor,Pagamento,Uniforme&#10;1,João Silva,@joao,Bronze | Iniciante,200,Pago,M"></textarea>
          </div>
        </div>
        <div class="form-actions">
          <div class="spacer"></div>
          <button class="btn btn-lime btn-cadastrar" onclick="runComparison()">⚖ Comparar categorias</button>
        </div>
      </div>
    </div>
    <div class="card">
      <div class="card-header"><div class="card-title">🔗 <span class="accent">Apelidos</span> / variações de nome</div></div>
      <div class="card-body">
        <div class="form-grid" style="margin-bottom:14px;">
          <div style="display:flex;flex-direction:column;gap:5px;"><label>Nome como aparece no WhatsApp</label><input type="text" id="conf-alias-wa" placeholder="Ex: Jaison"></div>
          <div style="display:flex;flex-direction:column;gap:5px;"><label>Nome na base de inscrições</label><input type="text" id="conf-alias-base" placeholder="Ex: Jailson"></div>
        </div>
        <div class="form-actions">
          <div class="spacer"></div>
          <button class="btn btn-lime" onclick="addNameAlias()">✚ Adicionar apelido</button>
        </div>
        <div id="conf-alias-list" style="margin-top:14px;"></div>
      </div>
    </div>
    <div id="conf-results"></div>
  </div>

'''
PAGE_NEW = PAGE_HTML + PAGE_ANCHOR

# ---------------------------------------------------------------------------
# 3. goTo: título e render da nova aba
# ---------------------------------------------------------------------------
TITLES_ANCHOR = r'''const titles={jogadores:'Jogadores' '''.rstrip()
TITLES_NEW = r'''const titles={jogadores:'Jogadores',conferencia:'Conferência' '''.rstrip()

GOTO_ANCHOR = r'''  if(id==='simulacao')renderSimulacao();'''
GOTO_NEW = GOTO_ANCHOR + '\n' + r'''  if(id==='conferencia')renderConferencia();'''

# ---------------------------------------------------------------------------
# 4. loadFromCloud: default para a chave name_aliases (S.nameAliases)
# ---------------------------------------------------------------------------
DEFAULTS_ANCHOR = r'''    if(!S.chvParams) S.chvParams = {};'''
DEFAULTS_NEW = DEFAULTS_ANCHOR + '\n' + r'''    if(!S.nameAliases) S.nameAliases = {};'''

# ---------------------------------------------------------------------------
# 5. JS da feature, inserido antes de renderAll() (longe do base64)
# ---------------------------------------------------------------------------
JS_ANCHOR = r'''function renderAll(){'''
JS_BLOCK = r'''// ===== CONFERENCIA (WhatsApp x inscricoes) =====
function escHtml(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function normalizeName(s){
  return String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9\s]/g,' ').replace(/\s+/g,' ').trim();
}
function buildAliasMap(){
  const map={};
  Object.entries(S.nameAliases||{}).forEach(([wa,base])=>{map[normalizeName(wa)]=normalizeName(base);});
  return map;
}
function applyAlias(norm,aliasMap){return aliasMap[norm]||norm;}

function parseWhatsAppList(text){
  const cats=[];let current=null;
  text.split(/\r?\n/).forEach(line=>{
    const l=line.trim();
    if(!l)return;
    const catMatch=l.match(/🏆\s*Categoria\s*:\s*(.+)/i);
    if(catMatch){current={name:catMatch[1].trim(),entries:[]};cats.push(current);return;}
    const entryMatch=l.match(/^\d+\s*[-–—.)]*\s*(.+)$/);
    if(entryMatch&&current){
      let names=entryMatch[1].trim();
      let pending=false;
      const pendMatch=names.match(/\s+e\s+[cd]upla\s*$/i);
      if(pendMatch){pending=true;names=names.slice(0,pendMatch.index).trim();}
      const parts=names.split(/\s+e\s+/i).map(p=>p.trim()).filter(Boolean);
      const p1=parts[0]||'';
      const p2=pending?null:(parts.length>1?parts.slice(1).join(' e '):null);
      if(p1)current.entries.push({raw:entryMatch[1].trim(),p1,p2,pending});
    }
  });
  return cats;
}

function matchWaCategory(name){
  const n=normalizeName(name);
  let found=CATS.find(c=>normalizeName(c)===n);
  if(found)return found;
  found=CATS.find(c=>normalizeName(c).includes(n)||n.includes(normalizeName(c)));
  return found||null;
}

function parseCsvLine(line){
  const out=[];let cur='';let inQ=false;
  for(let i=0;i<line.length;i++){
    const ch=line[i];
    if(inQ){
      if(ch==='"'){if(line[i+1]==='"'){cur+='"';i++;}else inQ=false;}
      else cur+=ch;
    }else{
      if(ch==='"')inQ=true;
      else if(ch===','){out.push(cur);cur='';}
      else cur+=ch;
    }
  }
  out.push(cur);
  return out;
}
function parseRegistrationCSV(text){
  const players=[];
  text.split(/\r?\n/).forEach(line=>{
    if(!line.trim())return;
    const cols=parseCsvLine(line).map(c=>c.trim());
    if(cols.length<4)return;
    if(normalizeName(cols[1])==='nome')return;
    const nome=cols[1];
    if(!nome)return;
    const cats=cols[3].split('|').map(c=>c.trim()).filter(Boolean);
    players.push({nome,cats});
  });
  return players;
}
function getRegistrationData(){
  const raw=document.getElementById('conf-csv-input').value.trim();
  if(raw)return parseRegistrationCSV(raw);
  return S.jogadores.map(j=>({nome:j.nome,cats:j.cats}));
}

function compareCategories(waCats,regPlayers){
  const aliasMap=buildAliasMap();
  return waCats.map(cat=>{
    const catName=matchWaCategory(cat.name);
    const basePlayers=catName?regPlayers.filter(p=>p.cats.includes(catName)):[];
    const baseByFull={};const baseByFirst={};
    basePlayers.forEach(p=>{
      const full=normalizeName(p.nome);
      (baseByFull[full]=baseByFull[full]||[]).push(p);
      const first=full.split(' ')[0];
      (baseByFirst[first]=baseByFirst[first]||[]).push(p);
    });
    const matchedBase=new Set();
    const matched=[];const onlyWa=[];const ambiguous=[];
    const pendingPartner=cat.entries.filter(e=>e.pending).map(e=>e.p1);
    let pairsOk=0;
    const resolvePlayer=(name)=>{
      const norm=applyAlias(normalizeName(name),aliasMap);
      const fullCands=(baseByFull[norm]||[]).filter(p=>!matchedBase.has(p));
      if(fullCands.length===1){matchedBase.add(fullCands[0]);return 'ok';}
      if(fullCands.length>1)return 'ambiguous';
      if(norm.split(' ').length>1){
        const prefCands=basePlayers.filter(p=>!matchedBase.has(p)).filter(p=>{
          const b=normalizeName(p.nome);
          return b.startsWith(norm+' ')||norm.startsWith(b+' ');
        });
        if(prefCands.length===1){matchedBase.add(prefCands[0]);return 'ok';}
        if(prefCands.length>1)return 'ambiguous';
        return 'missing';
      }
      const firstCands=(baseByFirst[norm]||[]).filter(p=>!matchedBase.has(p));
      if(firstCands.length===1){matchedBase.add(firstCands[0]);return 'ok';}
      if(firstCands.length>1)return 'ambiguous';
      return 'missing';
    };
    cat.entries.forEach(e=>{
      const names=[e.p1,e.p2].filter(Boolean);
      const results=names.map(n=>({name:n,status:resolvePlayer(n)}));
      results.forEach(r=>{
        if(r.status==='ok')matched.push(r.name);
        else if(r.status==='ambiguous')ambiguous.push(r.name);
        else onlyWa.push(r.name);
      });
      if(!e.pending&&names.length===2&&results.every(r=>r.status==='ok'))pairsOk++;
    });
    const onlyBase=basePlayers.filter(p=>!matchedBase.has(p)).map(p=>p.nome);
    return {waName:cat.name,catName,baseCount:basePlayers.length,entryCount:cat.entries.length,pairsOk,matched,onlyWa,onlyBase,ambiguous,pendingPartner};
  });
}

function runComparison(){
  const waText=document.getElementById('conf-wa-input').value;
  if(!waText.trim()){toast('Cole o texto das listas do WhatsApp','pink');return;}
  const waCats=parseWhatsAppList(waText);
  if(!waCats.length){toast('Nenhum bloco "🏆 Categoria:" encontrado','pink');return;}
  const results=compareCategories(waCats,getRegistrationData());
  renderComparisonResults(results);
}

function renderComparisonResults(results){
  const el=document.getElementById('conf-results');
  const section=(title,badgeClass,items,emptyMsg)=>`
    <div style="margin-bottom:12px;">
      <div style="font-family:'Barlow Condensed',sans-serif;font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--text3);margin-bottom:6px;">${title} (${items.length})</div>
      ${items.length?`<div style="display:flex;gap:6px;flex-wrap:wrap;">${items.map(n=>`<span class="badge ${badgeClass}">${escHtml(n)}</span>`).join('')}</div>`:`<div style="font-size:12px;color:var(--text3);">${emptyMsg}</div>`}
    </div>`;
  el.innerHTML=results.map(r=>`
    <div class="card">
      <div class="card-header">
        <div class="card-title">🏅 <span class="accent">${escHtml(r.waName)}</span>${r.catName?'':' <span class="badge badge-red">categoria não reconhecida</span>'}</div>
        <div style="font-family:'Bebas Neue',sans-serif;font-size:16px;color:var(--lime);letter-spacing:.5px;">${r.pairsOk} dupla${r.pairsOk!==1?'s':''} ok</div>
      </div>
      <div class="card-body">
        <div style="display:flex;gap:16px;flex-wrap:wrap;margin-bottom:14px;font-family:'Barlow Condensed',sans-serif;font-size:13px;color:var(--text2);">
          <span>WhatsApp: <b style="color:var(--text);">${r.entryCount}</b> linha${r.entryCount!==1?'s':''}</span>
          <span>Base: <b style="color:var(--text);">${r.baseCount}</b> inscrito${r.baseCount!==1?'s':''} na categoria</span>
        </div>
        ${section('✔ Conferem (WhatsApp × base)','badge-lime',r.matched,'nenhum nome conferido')}
        ${section('❌ No WhatsApp, fora da base','badge-pink',r.onlyWa,'ninguém faltando na base')}
        ${section('⚠ Na base, fora do WhatsApp','badge-amber',r.onlyBase,'ninguém sobrando na base')}
        ${section('❓ Ambíguo — confirmar manualmente','badge-purple',r.ambiguous,'nenhum caso ambíguo')}
        ${section('👤 "e dupla" — parceiro pendente','badge-gray',r.pendingPartner,'nenhuma dupla incompleta')}
      </div>
    </div>`).join('');
}

let aliasKeys=[];
function renderAliasList(){
  const el=document.getElementById('conf-alias-list');
  if(!el)return;
  aliasKeys=Object.keys(S.nameAliases||{});
  if(!aliasKeys.length){el.innerHTML='<div style="font-size:12px;color:var(--text3);">Nenhum apelido cadastrado.</div>';return;}
  el.innerHTML='<div style="display:flex;gap:8px;flex-wrap:wrap;">'+aliasKeys.map((k,i)=>`
    <span class="badge badge-purple" style="display:inline-flex;align-items:center;gap:8px;">${escHtml(k)} → ${escHtml(S.nameAliases[k])}
      <button onclick="removeNameAlias(${i})" style="background:none;border:none;color:var(--pink);cursor:pointer;font-size:12px;padding:0;line-height:1;">✕</button>
    </span>`).join('')+'</div>';
}
function addNameAlias(){
  const wa=document.getElementById('conf-alias-wa').value.trim();
  const base=document.getElementById('conf-alias-base').value.trim();
  if(!wa||!base){toast('Preencha os dois nomes do apelido','pink');return;}
  if(!S.nameAliases)S.nameAliases={};
  S.nameAliases[wa]=base;
  save();renderAliasList();
  document.getElementById('conf-alias-wa').value='';document.getElementById('conf-alias-base').value='';
  toast('Apelido salvo!');
}
function removeNameAlias(i){
  const k=aliasKeys[i];
  if(k===undefined)return;
  delete S.nameAliases[k];
  save();renderAliasList();
  toast('Apelido removido','pink');
}
function renderConferencia(){renderAliasList();}

'''
JS_NEW = JS_BLOCK + JS_ANCHOR

PATCHES = [
    ('nav item', NAV_ANCHOR, NAV_NEW),
    ('page html', PAGE_ANCHOR, PAGE_NEW),
    ('titles map', TITLES_ANCHOR, TITLES_NEW),
    ('goTo render', GOTO_ANCHOR, GOTO_NEW),
    ('state defaults', DEFAULTS_ANCHOR, DEFAULTS_NEW),
    ('feature js', JS_ANCHOR, JS_NEW),
]


def main():
    raw = HTML_PATH.read_bytes().decode('utf-8')
    crlf = '\r\n' in raw

    if 'page-conferencia' in raw:
        sys.exit('Patch ja aplicado (page-conferencia existe). Nada foi alterado.')

    errors = []
    for label, old, _ in PATCHES:
        n = raw.count(old)
        if n != 1:
            errors.append(f'  - [{label}] ancora encontrada {n}x (esperado 1): {old[:70]!r}')
    if errors:
        sys.exit('Patch ABORTADO, nada foi alterado:\n' + '\n'.join(errors))

    shutil.copyfile(HTML_PATH, HTML_PATH.with_name('index.html.bak'))

    for label, old, new in PATCHES:
        if crlf:
            new = new.replace('\r\n', '\n').replace('\n', '\r\n')
        raw = raw.replace(old, new)
        print(f'ok: {label}')

    HTML_PATH.write_bytes(raw.encode('utf-8'))
    print(f'\nPatch aplicado em {HTML_PATH.name} (backup: index.html.bak)')


if __name__ == '__main__':
    main()
