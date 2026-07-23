// ===== STATE =====
let S = {jogadores:[],resultados:{},sponsors:[],duplas:{},params:{uniforme:70,trofeuQtd:24,trofeuVal:33,arbQtd:8,arbVal:300,premiacao:4040}};
const CATS = ['Bronze','Iniciante','Mista Iniciante','Estreante'];
const PRECOS = {1:120,2:200,3:260};
const PREMIOS = {Bronze:[1000,500,250,100],Iniciante:[600,350,150,0],'Mista Iniciante':[450,300,100,0],Estreante:[240,0,0,0]};
const POSICOES = ['🥇 1º lugar','🥈 2º lugar','🥉 3º lugar','4º lugar'];
const IDEAL = 96;
const PAT_BASE = 800;
let editingId = null;
let chartDuplas=null,chartFin=null,chartCats=null;

function getParams(){return Object.assign({uniforme:70,trofeuQtd:24,trofeuVal:33,arbQtd:8,arbVal:300,premiacao:4040,trafegoPago:0},S.params||{});}
function calcDespesasFixas(){const p=getParams();return p.trofeuQtd*p.trofeuVal+p.arbQtd*p.arbVal+p.premiacao+p.trafegoPago;}

function fmt(n){return 'R$ '+Math.round(n).toLocaleString('pt-BR');}
function preco(n){return PRECOS[Math.min(n,3)]||260;}
function uid(){return Date.now()+Math.random();}

function toast(msg,type='lime'){
  const el=document.getElementById('toast');
  el.textContent=msg; el.className='toast show '+type;
  setTimeout(()=>el.classList.remove('show'),2800);
}

const catBadge={Bronze:'badge-amber',Iniciante:'badge-purple','Mista Iniciante':'badge-lime',Estreante:'badge-pink'};
const pagBadge={Pago:'badge-lime',Pendente:'badge-amber'};
const statusBadge={Confirmado:'badge-lime','Em análise':'badge-amber',Enviada:'badge-purple',Fora:'badge-red'};
