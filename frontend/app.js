const API_BASE = location.protocol === 'file:' ? 'http://localhost:8080/api' : '/api';
const SYNC_INTERVAL = 60000;

const ONBOARDING_STEPS = [
  { id: 'conhecer_padrinho', label: 'Conhecer seu padrinho' },
  { id: 'guia_campus', label: 'Acessar o FAQ e guia do campus' },
  { id: 'primeiro_encontro', label: 'Participar do primeiro encontro' },
  { id: 'primeira_pergunta', label: 'Fazer sua primeira pergunta' }
];

const WEEKDAYS_MAP = {
  'Domingo': 0,
  'Segunda-feira': 1,
  'Terça-feira': 2,
  'Quarta-feira': 3,
  'Quinta-feira': 4,
  'Sexta-feira': 5,
  'Sábado': 6
};

const state = {
  token: localStorage.getItem('apadrinha_token'),
  user: null,
  mentors: [],
  mentorships: [],
  meetings: [],
  questions: [],
  tips: [],
  pending: [],
  notifications: [],
  calendar: null,
  selectedDate: null,
  syncTimer: null,
  lastSync: null,
  showCompletedSteps: false,
  profileSlots: [],
  forumCategory: '',
  forumTab: 'all',
  faqCategory: '',
  activeChatMentorshipId: null
};

const iconPaths = {
  home:'<path d="m3 10 9-7 9 7v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 21v-6h6v6"/>',
  users:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
  calendar:'<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  message:'<path d="M21 11.5a8.4 8.4 0 0 1-9 8.5 9.8 9.8 0 0 1-4.3-1L3 20l1.3-3.8A8.4 8.4 0 0 1 3 11.5a8.4 8.4 0 0 1 9-8.5 8.4 8.4 0 0 1 9 8.5z"/>',
  bookmark:'<path d="M19 21 12 16 5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>',
  chart:'<path d="M3 3v18h18"/><path d="m7 16 4-5 3 3 5-7"/>',
  more:'<circle cx="12" cy="5" r="1" fill="currentColor"/><circle cx="12" cy="12" r="1" fill="currentColor"/><circle cx="12" cy="19" r="1" fill="currentColor"/>',
  bell:'<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/>',
  menu:'<path d="M4 6h16M4 12h16M4 18h16"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  send:'<path d="m22 2-7 20-4-9-9-4z"/><path d="M22 2 11 13"/>',
  arrow:'<path d="M5 12h14M13 6l6 6-6 6"/>',
  clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  check:'<path d="m5 12 4 4L19 6"/>',
  book:'<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
  sliders:'<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3"/><path d="M1 14h6M9 8h6M17 16h6"/>',
  search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
  heart:'<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.9-8.6a5.5 5.5 0 0 0-.1-7.8z"/>',
  x:'<path d="m6 6 12 12M18 6 6 18"/>'
};

function renderIcons(root=document){
  root.querySelectorAll('[data-icon]').forEach(el=>{
    if(!el.querySelector('svg'))el.innerHTML=`<svg viewBox="0 0 24 24" aria-hidden="true">${iconPaths[el.dataset.icon]||''}</svg>`;
  });
}

const escapeHtml = value => String(value ?? '').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const initials = name => String(name||'?').split(/\s+/).slice(0,2).map(n=>n[0]).join('').toUpperCase();
const capitalize = value => String(value).replace(/^./,c=>c.toUpperCase());
const normalize = value => String(value||'').normalize('NFD').replace(/\p{Diacritic}/gu,'').toLowerCase().trim();
const roleLabel = role => ({AFILHADO:'Afilhado',PADRINHO:'Padrinho',ADMIN:'Administrador'}[role]||'');
const meetingLabels = {PROPOSTO:'Aguardando confirmação',CONFIRMADO:'Confirmado',CONCLUIDO:'Concluído',CANCELADO:'Cancelado'};

function avatarHtml(user, extraClass='avatar-green'){
  if(user?.avatarUrl){
    return `<span class="avatar ${extraClass}"><img src="${escapeHtml(user.avatarUrl)}" alt="${escapeHtml(user.name||'Foto de perfil')}" /></span>`;
  }
  return `<span class="avatar ${extraClass}">${escapeHtml(initials(user?.name))}</span>`;
}

function setAvatarElement(el, user){
  if(!el)return;
  if(user?.avatarUrl){
    el.innerHTML=`<img src="${escapeHtml(user.avatarUrl)}" alt="${escapeHtml(user.name||'Foto de perfil')}" />`;
  }else{
    el.textContent=initials(user?.name);
  }
}

// Disponibilidade estruturada (dias e horários específicos) -------------------
function parseAvailabilitySlots(user){
  if(!user)return [];
  const rawSlots=String(user.availabilitySlots||'').trim();
  if(rawSlots){
    return rawSlots.split(';').map(s=>s.trim()).filter(Boolean).map(item=>{
      const [day,start,end]=item.split('|').map(x=>String(x||'').trim());
      return day&&start?{day,start,end:end||''}:null;
    }).filter(Boolean);
  }
  const rawText=String(user.availability||'').trim();
  if(!rawText)return [];
  // Converte texto se já estiver no formato "Dia HH:MM às HH:MM"
  const parsed=[];
  rawText.split(/[,;]+/).map(s=>s.trim()).filter(Boolean).forEach(part=>{
    const m=part.match(/^([A-Za-zÀ-ÿ-]+)\s+(\d{1,2}:\d{2})(?:\s*(?:às|-|a)\s*(\d{1,2}:\d{2}))?/i);
    if(m){
      parsed.push({day:m[1],start:m[2].padStart(5,'0'),end:(m[3]||'').padStart(5,'0')});
    }
  });
  return parsed;
}

function serializeSlots(slots){
  return (slots||[]).map(s=>`${s.day}|${s.start}|${s.end||''}`).join(';');
}

function formatSlotsHuman(slots){
  if(!slots||!slots.length)return '';
  return slots.map(s=>s.end?`${s.day} ${s.start} às ${s.end}`:`${s.day} às ${s.start}`).join(', ');
}

function nextDateForWeekday(dayName){
  const targetDay=WEEKDAYS_MAP[dayName];
  const d=new Date();
  d.setDate(d.getDate()+1);
  if(targetDay===undefined)return localDate(d);
  while(d.getDay()!==targetDay){
    d.setDate(d.getDate()+1);
  }
  return localDate(d);
}

// Datas -----------------------------------------------------------------------
const pad = n => String(n).padStart(2,'0');
const localDate = d => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const parseLocalDate = key => new Date(`${key}T00:00:00`);
const dateTime = value => new Intl.DateTimeFormat('pt-BR',{dateStyle:'medium',timeStyle:'short'}).format(new Date(value));
const timeOf = d => d.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});
const longDate = d => capitalize(new Intl.DateTimeFormat('pt-BR',{weekday:'long',day:'numeric',month:'long'}).format(d));
const meetingStart = m => new Date(m.startsAt);
const meetingEnd = m => new Date(meetingStart(m).getTime()+(m.durationMinutes||45)*60000);
const utcStamp = d => d.toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');

function relativeTime(value){
  const diff=(new Date(value)-Date.now())/1000;
  const rtf=new Intl.RelativeTimeFormat('pt-BR',{numeric:'auto'});
  for(const [unit,seconds] of [['year',31536000],['month',2592000],['week',604800],['day',86400],['hour',3600],['minute',60]]){
    if(Math.abs(diff)>=seconds)return capitalize(rtf.format(Math.round(diff/seconds),unit));
  }
  return 'Agora mesmo';
}

async function api(path,options={}){
  const headers={'Content-Type':'application/json',...(options.headers||{})};
  if(state.token)headers.Authorization=`Bearer ${state.token}`;
  let response;
  try{
    response=await fetch(`${API_BASE}${path}`,{...options,headers});
  }catch{
    throw new Error('Não foi possível acessar a API. Inicie o backend na porta 8080.');
  }
  const body=response.status===204?null:await response.json().catch(()=>null);
  if(!response.ok){
    if(response.status===401&&state.token)logout();
    throw new Error(body?.error||(response.status===403?'Seu perfil não tem permissão para esta ação':`Erro ${response.status}`));
  }
  return body;
}

const canAccess = el => !el?.dataset.roles||Boolean(state.user&&el.dataset.roles.split(',').includes(state.user.role));
const homeView = () => state.user?.role==='ADMIN'?'admin':state.user?.role==='PADRINHO'?'solicitacoes':'inicio';

function view(id){
  const section=document.getElementById(id);
  if(!section?.classList.contains('view')||!canAccess(section)){
    if(state.user)toast('Esta área não está disponível para o seu perfil.');
    id=homeView();
  }
  document.querySelectorAll('.view').forEach(v=>v.classList.toggle('active',v.id===id));
  document.querySelectorAll('.nav-item[data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view===id));
  document.querySelector('.sidebar').classList.remove('open');
  closeModal();
  toggleNotifications(false);
  window.scrollTo({top:0,behavior:'smooth'});
  if(id==='admin')loadAdmin().catch(err=>toast(err.message));
  if(id==='mural'&&state.user?.role==='AFILHADO'){
    markStepCompletedSilently('guia_campus');
  }
}

const profileComplete = user => ['period','interests','availability','bio'].every(k=>String(user?.[k]||'').trim());

function setUser(user){
  state.user=user;
  document.getElementById('auth-screen').classList.add('hidden');
  const profile=document.querySelector('.profile-card');
  setAvatarElement(profile.querySelector('.avatar'),user);
  profile.querySelector('strong').textContent=user.name;
  profile.querySelector('small').textContent=`${roleLabel(user.role)}${user.period?' · '+user.period:''}`;
  document.querySelector('.breadcrumb').innerHTML=`Olá, <strong>${escapeHtml(user.name.split(' ')[0])}!</strong>`;
  document.querySelectorAll('[data-roles]').forEach(el=>el.hidden=!canAccess(el));
  document.getElementById('profile-banner').hidden=user.role!=='AFILHADO'||profileComplete(user);
  populateProfile(user);
  renderChecklist();
  renderMentorAgendaManager();
}

async function bootstrap(){
  renderIcons();
  resetCalendar();
  bindEvents();
  if(!state.token)return;
  try{
    const user=await api('/auth/me');
    await startSession(user);
  }catch(e){
    showAuthError('login',e.message);
  }
}

async function startSession(user){
  setUser(user);
  await loadData();
  view(homeView());
  clearInterval(state.syncTimer);
  state.syncTimer=setInterval(sync,SYNC_INTERVAL);
}

function storeToken(token){
  state.token=token;
  localStorage.setItem('apadrinha_token',token);
}

async function login(email,password){
  const data=await api('/auth/login',{method:'POST',body:JSON.stringify({email,password})});
  storeToken(data.token);
  await startSession(data.user);
}

function logout(){
  clearInterval(state.syncTimer);
  Object.assign(state,{
    token:null,user:null,mentors:[],mentorships:[],meetings:[],questions:[],tips:[],pending:[],notifications:[],selectedDate:null,profileSlots:[]
  });
  localStorage.removeItem('apadrinha_token');
  closeModal();
  toggleNotifications(false);
  resetCalendar();
  document.getElementById('auth-screen').classList.remove('hidden');
}

function showAuthError(kind,message){
  document.getElementById(`${kind}-error`).textContent=message;
}

function sync(){
  if(state.token&&state.user&&!document.hidden)loadData().catch(()=>{});
}

async function loadData(){
  const [me,mentorships,meetings,questions,tips]=await Promise.all([
    api('/users/me'),
    api('/mentorships'),
    api('/meetings'),
    api('/questions'),
    api('/tips')
  ]);
  state.user=me;
  Object.assign(state,{mentorships,meetings,questions,tips,lastSync:new Date()});
  setUser(me);
  if(state.user.role==='AFILHADO'){
    state.mentors=await api('/mentors');
    renderMentors();
  }
  renderMentorships();
  renderAgenda();
  renderNextMeeting();
  renderQuestions();
  renderTips();
  renderActivity();
  renderChecklist();
  if(state.user.role==='ADMIN')await loadAdmin();
  renderNotifications();
}

// 1. Primeiros Passos (Persistidos no banco e ocultados conforme avançam) ----
function getCompletedStepIds(){
  const list=Array.isArray(state.user?.completedSteps)?state.user.completedSteps:[];
  return new Set(list.filter(Boolean));
}

async function markStepCompletedSilently(stepId){
  if(!state.user||state.user.role!=='AFILHADO')return;
  const set=getCompletedStepIds();
  if(set.has(stepId))return;
  set.add(stepId);
  try{
    const updated=await api('/users/me/steps',{method:'PUT',body:JSON.stringify({completedSteps:[...set]})});
    state.user=updated;
    renderChecklist();
  }catch{}
}

async function toggleChecklistStep(stepId,checked){
  if(!state.user)return;
  const set=getCompletedStepIds();
  if(checked)set.add(stepId);
  else set.delete(stepId);
  try{
    const updated=await api('/users/me/steps',{method:'PUT',body:JSON.stringify({completedSteps:[...set]})});
    state.user=updated;
    renderChecklist();
    toast(checked?'Passo concluído e salvo no seu progresso!':'Passo reaberto na lista.');
  }catch(err){
    toast(err.message);
    renderChecklist();
  }
}

function renderChecklist(){
  const container=document.getElementById('checklist-items');
  const counter=document.getElementById('checklist-counter');
  const bar=document.getElementById('checklist-progress-bar');
  const footer=document.getElementById('checklist-footer');
  if(!container||!state.user||state.user.role!=='AFILHADO')return;

  const completed=getCompletedStepIds();
  const total=ONBOARDING_STEPS.length;
  const doneCount=ONBOARDING_STEPS.filter(s=>completed.has(s.id)).length;
  counter.textContent=`${doneCount}/${total}`;
  bar.style.width=`${Math.round((doneCount/total)*100)}%`;

  const visibleSteps=state.showCompletedSteps
    ? ONBOARDING_STEPS
    : ONBOARDING_STEPS.filter(s=>!completed.has(s.id));

  if(doneCount===total && !state.showCompletedSteps){
    container.innerHTML=`<div class="checklist-done-box">🎉 Parabéns! Todos os primeiros passos foram concluídos!</div>`;
  }else if(!visibleSteps.length){
    container.innerHTML=`<div class="checklist-done-box">Nenhuma etapa pendente no momento.</div>`;
  }else{
    container.innerHTML=visibleSteps.map(s=>{
      const isDone=completed.has(s.id);
      return `<label class="${isDone?'checked':''}"><input type="checkbox" data-step-id="${escapeHtml(s.id)}" ${isDone?'checked':''} /> <span>${escapeHtml(s.label)}</span></label>`;
    }).join('');
  }

  if(doneCount>0){
    footer.innerHTML=`<span>${doneCount} ${doneCount===1?'item concluído e ocultado':'itens concluídos e ocultados'}</span><button type="button" class="text-button" data-toggle-completed-steps>${state.showCompletedSteps?'Ocultar concluídos':'Ver concluídos'}</button>`;
  }else{
    footer.innerHTML=`<span>Marque os itens conforme avançar na jornada</span>`;
  }
}

// 4, 5 e 6. Encontrar Padrinho (Filtros, Disponibilidade Específica e Botão Match) ----
function mentorMatchesTimeFilter(mentor,timeFilter){
  if(!timeFilter)return true;
  const slots=parseAvailabilitySlots(mentor);
  const raw=normalize(`${mentor.availability||''} ${mentor.availabilitySlots||''}`);
  if(timeFilter==='manha'){
    if(slots.length)return slots.some(s=>{const h= parseInt(s.start.split(':')[0],10);return h>=6&&h<12;});
    return raw.includes('manha')||raw.includes('08:')||raw.includes('09:')||raw.includes('10:')||raw.includes('11:');
  }
  if(timeFilter==='tarde'){
    if(slots.length)return slots.some(s=>{const h=parseInt(s.start.split(':')[0],10);return h>=12&&h<18;});
    return raw.includes('tarde')||raw.includes('13:')||raw.includes('14:')||raw.includes('15:')||raw.includes('16:')||raw.includes('17:');
  }
  if(timeFilter==='noite'){
    if(slots.length)return slots.some(s=>{const h=parseInt(s.start.split(':')[0],10);return h>=18&&h<=23;});
    return raw.includes('noite')||raw.includes('18:')||raw.includes('19:')||raw.includes('20:')||raw.includes('21:');
  }
  if(slots.length){
    return slots.some(s=>s.start<=timeFilter && (!s.end || s.end>=timeFilter));
  }
  return raw.includes(normalize(timeFilter));
}

function renderMentors(){
  const grid=document.getElementById('mentor-grid');
  if(!grid)return;
  const subjectTerm=normalize(document.getElementById('mentor-filter-subject')?.value||'');
  const periodFilter=normalize(document.getElementById('mentor-filter-period')?.value||'');
  const dayFilter=normalize(document.getElementById('mentor-filter-day')?.value||'');
  const timeFilter=document.getElementById('mentor-filter-time')?.value||'';

  const filtered=(state.mentors||[]).filter(m=>{
    if(subjectTerm && !normalize(`${m.name} ${m.interests} ${m.bio}`).includes(subjectTerm))return false;
    if(periodFilter && normalize(m.period)!==periodFilter)return false;
    if(dayFilter && !normalize(`${m.availability} ${m.availabilitySlots}`).includes(dayFilter))return false;
    if(timeFilter && !mentorMatchesTimeFilter(m,timeFilter))return false;
    return true;
  });

  grid.innerHTML=filtered.map((m,i)=>{
    const slots=parseAvailabilitySlots(m);
    const slotsHtml=slots.length
      ? `<div class="slot-chips">${slots.map(s=>`<span class="slot-chip green">📅 ${escapeHtml(s.day)} · ${escapeHtml(s.start)}${s.end?' às '+escapeHtml(s.end):''}</span>`).join('')}</div>`
      : `<div class="slot-chips"><span class="slot-chip">📅 ${escapeHtml(m.availability||'Horários específicos a combinar')}</span></div>`;

    const existing=state.mentorships.find(ms=>ms.mentor?.id===m.id && ['PENDENTE','ATIVO'].includes(ms.status));
    let actionButtonsHtml='';
    if(existing?.status==='ATIVO'){
      actionButtonsHtml=`
        <button type="button" class="outline" data-open-modal="encontro" data-mentorship="${existing.id}">Solicitar encontro</button>
        <button type="button" class="match-active-btn" data-open-chat="${existing.id}">✓ Vínculo ativo · Mensagens</button>
      `;
    }else if(existing?.status==='PENDENTE'){
      actionButtonsHtml=`
        <button type="button" class="match-sent-btn" data-cancel-match="${existing.id}" data-mentor-id="${m.id}" data-name="${escapeHtml(m.name)}" title="Clique para cancelar a solicitação">Solicitação enviada</button>
        <button type="button" class="cancel-match-btn" data-cancel-match="${existing.id}" data-mentor-id="${m.id}" data-name="${escapeHtml(m.name)}">Cancelar solicitação</button>
      `;
    }else{
      actionButtonsHtml=`
        <button type="button" class="outline" data-mentor-availability="${m.id}">Ver horários</button>
        <button type="button" class="primary request-match" data-id="${m.id}" data-name="${escapeHtml(m.name)}">Pedir match</button>
      `;
    }

    return `<article class="card mentor-card">
      <div>
        <div class="mentor-person">
          ${avatarHtml(m, `${i%2?'avatar-orange':'avatar-purple'} large`)}
          <div>
            <h2>${escapeHtml(m.name)}</h2>
            <p class="course">${escapeHtml(m.period||'Veterano ADS')}</p>
          </div>
        </div>
        <p class="bio">${escapeHtml(m.bio||'Disponível para apoiar quem está começando.')}</p>
        <div class="pills">${String(m.interests||'ADS').split(',').map(x=>`<span class="pill">${escapeHtml(x.trim())}</span>`).join('')}</div>
        <div class="mentor-card-availability">
          <strong>Dias e horários disponíveis</strong>
          ${slotsHtml}
        </div>
      </div>
      <div class="mentor-actions">${actionButtonsHtml}</div>
    </article>`;
  }).join('')||'<div class="card empty-state" style="grid-column:1/-1">Nenhum padrinho encontrado com os filtros selecionados. Experimente limpar os filtros.</div>';
}

async function handleRequestMatch(btn){
  const mentorId=Number(btn.dataset.id);
  const mentorName=btn.dataset.name||'o padrinho';
  // Feedback visual imediato ao clicar
  btn.disabled=true;
  btn.className='match-sent-btn';
  btn.textContent='Solicitação enviada';
  try{
    const created=await api('/mentorships',{method:'POST',body:JSON.stringify({mentorId})});
    state.mentorships.unshift(created);
    renderMentors();
    renderMentorships();
    toast(`Solicitação enviada para ${mentorName}!`);
  }catch(err){
    btn.disabled=false;
    btn.className='primary request-match';
    btn.textContent='Pedir match';
    toast(err.message);
  }
}

async function handleCancelMatch(btn){
  const mentorshipId=Number(btn.dataset.cancelMatch);
  const mentorName=btn.dataset.name||'o padrinho';
  btn.disabled=true;
  try{
    await api(`/mentorships/${mentorshipId}`,{method:'DELETE'});
    state.mentorships=state.mentorships.filter(m=>m.id!==mentorshipId);
    renderMentors();
    renderMentorships();
    toast(`Solicitação para ${mentorName} cancelada.`);
  }catch(err){
    btn.disabled=false;
    toast(err.message);
  }
}

// Convites, Vínculos e Resumo do Padrinho ------------------------------------
function hasConfirmedMeeting(mentorshipId){
  return state.meetings.some(m=>m.mentorshipId===Number(mentorshipId)&&['CONFIRMADO','CONCLUIDO'].includes(m.status));
}

function renderMentorships(){
  const list=document.getElementById('request-list');
  if(!list)return;
  renderHomeMentor();
  if(state.user.role!=='PADRINHO'){list.innerHTML='';return;}

  list.innerHTML=state.mentorships.map(m=>{
    const childSlots=parseAvailabilitySlots(m.godchild);
    const childAvail=childSlots.length
      ? formatSlotsHuman(childSlots)
      : (m.godchild.availability||'Horários ainda não informados');
    const chatUnlocked=hasConfirmedMeeting(m.id);

    let actions='';
    if(m.status==='PENDENTE'){
      actions=`
        <button class="outline mentorship-action" data-id="${m.id}" data-status="RECUSADO">Recusar</button>
        <button class="primary mentorship-action" data-id="${m.id}" data-status="ATIVO">Aceitar solicitação</button>
      `;
    }else if(m.status==='ATIVO'){
      actions=`
        <button class="outline" data-open-modal="encontro" data-mentorship="${m.id}"><i data-icon="calendar"></i>Agendar encontro</button>
        <button class="${chatUnlocked?'primary':'outline'}" data-open-chat="${m.id}"><i data-icon="message"></i>Mensagens${chatUnlocked?'':' (após confirmar)'}</button>
      `;
    }

    return `<article class="card request-card">
      ${avatarHtml(m.godchild,'avatar-green large')}
      <div>
        <h2>${escapeHtml(m.godchild.name)}</h2>
        <div class="request-meta">
          <span>${escapeHtml(m.godchild.period||'Ingressante')}</span>
          <span class="badge ${m.status==='PENDENTE'?'yellow':'blue'}">${m.status}</span>
          ${chatUnlocked?'<span class="badge green" style="background:var(--green-light);color:var(--green)">Encontro confirmado · Chat ativo</span>':''}
        </div>
        <p><strong>Interesses:</strong> ${escapeHtml(m.godchild.interests||'Ainda não informados')}</p>
        <p style="margin-top:4px"><strong>Disponibilidade do afilhado:</strong> ${escapeHtml(childAvail)}</p>
      </div>
      <div class="request-actions">${actions}</div>
    </article>`;
  }).join('')||'<div class="card empty-state">Você ainda não possui solicitações ou acompanhamentos.</div>';
  renderIcons(list);
}

function renderHomeMentor(){
  if(state.user.role!=='AFILHADO')return;
  const active=state.mentorships.find(m=>m.status==='ATIVO');
  const card=document.querySelector('.mentor-summary');
  const availBox=document.getElementById('home-mentor-availability');
  const chatBtn=document.getElementById('home-chat-button');
  const reqMeetingBtn=document.getElementById('home-request-meeting-btn');
  const profileMentorBox=document.getElementById('profile-mentor-availability-box');

  if(active){
    card.querySelector('h2').textContent=active.mentor.name;
    card.querySelector('.card-heading p:last-child').textContent=`${active.mentor.period||'Veterano ADS'} · ${active.mentor.interests||'ADS'}`;
    setAvatarElement(document.getElementById('home-mentor-avatar'),active.mentor);
    document.getElementById('home-mentor-bio').textContent=active.mentor.bio||'Disponível para apoiar você.';
    chatBtn.dataset.openChat=String(active.id);
    if(reqMeetingBtn){
      reqMeetingBtn.hidden=false;
      reqMeetingBtn.dataset.mentorship=String(active.id);
    }
    const slots=parseAvailabilitySlots(active.mentor);
    const chips=slots.length
      ? slots.map(s=>`<span class="slot-chip green">📅 ${escapeHtml(s.day)} · ${escapeHtml(s.start)}${s.end?' às '+escapeHtml(s.end):''}</span>`).join('')
      : `<span class="slot-chip">📅 ${escapeHtml(active.mentor.availability||'Horários a combinar')}</span>`;
    if(availBox){
      availBox.hidden=false;
      availBox.innerHTML=`<small>Disponibilidade cadastrada pelo padrinho</small><div class="slot-chips">${chips}</div>`;
    }
    if(profileMentorBox){
      profileMentorBox.hidden=false;
      profileMentorBox.innerHTML=`
        <strong>Disponibilidade do seu padrinho (${escapeHtml(active.mentor.name)})</strong>
        <div class="slot-chips" style="margin-bottom:8px">${chips}</div>
        <button type="button" class="outline" data-open-modal="encontro" data-mentorship="${active.id}">Solicitar encontro com ${escapeHtml(active.mentor.name.split(' ')[0])}</button>
      `;
    }
  }else{
    card.querySelector('h2').textContent='Encontre seu padrinho';
    card.querySelector('.card-heading p:last-child').textContent='Explore os perfis disponíveis em Encontrar padrinho';
    document.getElementById('home-mentor-avatar').textContent='?';
    document.getElementById('home-mentor-bio').textContent='Seu vínculo ativo aparecerá aqui.';
    chatBtn.dataset.openChat='';
    if(reqMeetingBtn)reqMeetingBtn.hidden=true;
    if(availBox){availBox.hidden=true;availBox.innerHTML='';}
    if(profileMentorBox){profileMentorBox.hidden=true;profileMentorBox.innerHTML='';}
  }
}

// 7. Gestão de Agenda do Padrinho e Disponibilidade no Perfil -----------------
function renderMentorAgendaManager(){
  const section=document.getElementById('mentor-agenda-manager');
  if(!section||!state.user||state.user.role!=='PADRINHO')return;
  const list=document.getElementById('agenda-slots-list');
  const slots=parseAvailabilitySlots(state.user);
  list.innerHTML=slots.length
    ? slots.map((s,idx)=>`<span class="slot-chip green">📅 ${escapeHtml(s.day)} · ${escapeHtml(s.start)}${s.end?' às '+escapeHtml(s.end):''} <button type="button" data-remove-agenda-slot="${idx}" aria-label="Remover horário">×</button></span>`).join('')
    : '<span class="field-hint">Nenhum dia e horário específico cadastrado ainda. Adicione abaixo para que seus afilhados visualizem.</span>';
}

async function saveMentorAgendaSlots(slots){
  const availabilitySlots=serializeSlots(slots);
  const availability=formatSlotsHuman(slots);
  const updated=await api('/users/me/availability',{
    method:'PUT',
    body:JSON.stringify({availability,availabilitySlots})
  });
  setUser(updated);
  toast('Agenda de disponibilidade atualizada com sucesso!');
}

function renderProfileSlots(){
  const list=document.getElementById('profile-slots-list');
  const hiddenInput=document.getElementById('profile-availability-input');
  if(!list)return;
  const slots=state.profileSlots||[];
  if(hiddenInput)hiddenInput.value=formatSlotsHuman(slots);
  list.innerHTML=slots.length
    ? slots.map((s,idx)=>`<span class="slot-chip green">📅 ${escapeHtml(s.day)} · ${escapeHtml(s.start)}${s.end?' às '+escapeHtml(s.end):''} <button type="button" data-remove-profile-slot="${idx}" aria-label="Remover horário">×</button></span>`).join('')
    : '<span class="field-hint">Adicione pelo menos um dia e horário específico disponível usando os campos abaixo.</span>';
}

// Agenda, Agendamentos, Conflitos e Botão de Mensagens -----------------------
function counterpart(meeting){
  const m=state.mentorships.find(x=>x.id===meeting.mentorshipId);
  if(!m)return '';
  return state.user.role==='PADRINHO'?m.godchild.name:m.mentor.name;
}

const upcomingMeetings = () => state.meetings.filter(m=>['PROPOSTO','CONFIRMADO'].includes(m.status)&&meetingEnd(m)>=new Date()).sort((a,b)=>meetingStart(a)-meetingStart(b));

function resetCalendar(){
  const now=new Date();
  state.calendar={year:now.getFullYear(),month:now.getMonth()};
  state.selectedDate=null;
}

function renderAgenda(){
  if(state.user){
    renderMentorAgendaManager();
    renderCalendar();
    renderSchedule();
  }
}

function renderCalendar(){
  const {year,month}=state.calendar;
  const first=new Date(year,month,1);
  const today=localDate(new Date());
  const busy=new Set(state.meetings.filter(m=>m.status!=='CANCELADO').map(m=>localDate(meetingStart(m))));
  document.getElementById('calendar-title').textContent=capitalize(new Intl.DateTimeFormat('pt-BR',{month:'long',year:'numeric'}).format(first));
  const days=[];
  for(let i=0;i<42;i++){
    const d=new Date(year,month,1-first.getDay()+i);
    const key=localDate(d);
    const classes=['day',d.getMonth()!==month&&'muted-day',key===today&&'is-today',key===state.selectedDate&&'selected',busy.has(key)&&'has-event'].filter(Boolean).join(' ');
    days.push(`<button type="button" class="${classes}" data-date="${key}" aria-label="${escapeHtml(longDate(d))}${busy.has(key)?', possui encontro':''}"${key===state.selectedDate?' aria-pressed="true"':''}><span>${d.getDate()}</span>${busy.has(key)?'<i></i>':''}</button>`);
  }
  document.getElementById('calendar-days').innerHTML=days.join('');
  document.getElementById('calendar-sync').textContent=state.lastSync?`Sincronizado às ${timeOf(state.lastSync)} · atualização automática a cada minuto`:'';
}

function meetingActions(m){
  const role=state.user.role,future=meetingStart(m)>new Date(),actions=[];
  const proposedBy=m.proposedBy||'PADRINHO';
  const button=(status,label,extra='')=>`<button class="text-button meeting-action ${extra}" data-id="${m.id}" data-status="${status}">${label}</button>`;

  if(m.status==='PROPOSTO'&&future){
    if(role==='AFILHADO'&&proposedBy==='PADRINHO'){
      actions.push(button('CONFIRMADO','Confirmar presença'),button('CANCELADO','Recusar','danger'));
    }else if(role==='PADRINHO'&&proposedBy==='AFILHADO'){
      actions.push(button('CONFIRMADO','Aceitar horário solicitado'),button('CANCELADO','Recusar','danger'));
    }else{
      actions.push(button('CANCELADO','Cancelar solicitação','danger'));
    }
  }
  if(m.status==='CONFIRMADO'&&future){
    actions.push(button('CANCELADO','Cancelar encontro','danger'));
  }
  if(role==='PADRINHO'&&m.status==='CONFIRMADO'&&!future){
    actions.push(button('CONCLUIDO','Marcar como concluído'));
  }
  if(['CONFIRMADO','CONCLUIDO'].includes(m.status)){
    actions.push(`<button class="text-button" data-open-chat="${m.mentorshipId}"><i data-icon="message"></i> Mensagens</button>`);
  }else if(m.status==='PROPOSTO'){
    actions.push(`<button class="text-button" data-open-chat="${m.mentorshipId}" title="Disponível após confirmar o agendamento"><i data-icon="message"></i> Mensagens (após confirmar)</button>`);
  }
  if(['PROPOSTO','CONFIRMADO'].includes(m.status)&&meetingEnd(m)>=new Date()){
    actions.push(`<a class="text-button" href="${googleCalendarLink(m)}" target="_blank" rel="noopener">Google Agenda</a>`,`<button class="text-button" data-ics="${m.id}">Baixar .ics</button>`);
  }
  return actions.length?`<div class="event-actions">${actions.join('')}</div>`:'';
}

function renderSchedule(){
  const schedule=document.getElementById('schedule');
  const selected=state.selectedDate;
  const meetings=selected
    ? state.meetings.filter(m=>localDate(meetingStart(m))===selected).sort((a,b)=>meetingStart(a)-meetingStart(b))
    : upcomingMeetings();
  const empty=selected
    ? 'Nenhum encontro neste dia.'
    : state.user.role==='PADRINHO'
      ? 'Nenhum encontro agendado. Use “Novo encontro” para convidar seu afilhado.'
      : 'Nenhum encontro agendado. Você pode clicar em “Solicitar encontro” para escolher um horário do seu padrinho ou propor um dia e horário específico.';

  schedule.innerHTML=`<p class="eyebrow">${selected?escapeHtml(longDate(parseLocalDate(selected)).toUpperCase()):'SEUS COMPROMISSOS'}</p><h2>${selected?'Encontros do dia':'Próximos encontros e convites'}</h2>${selected?'<button class="text-button" data-clear-date>Ver todos os próximos encontros <i data-icon="arrow"></i></button>':''}`+(meetings.length?meetings.map(m=>{
    const start=meetingStart(m),who=counterpart(m);
    const originBadge=m.proposedBy==='AFILHADO'?' · Solicitado pelo afilhado':' · Proposto pelo padrinho';
    return `<article class="event${['CANCELADO','CONCLUIDO'].includes(m.status)?' muted-event':''}"><span class="time">${timeOf(start)}</span><div><span class="event-type">${escapeHtml(meetingLabels[m.status]||m.status).toUpperCase()}${escapeHtml(originBadge)}</span><h3>${escapeHtml(m.title)}</h3><p>${escapeHtml(longDate(start))} · ${timeOf(start)}–${timeOf(meetingEnd(m))}${who?` · com ${escapeHtml(who)}`:''} · ${escapeHtml(m.format||'A combinar')}</p>${meetingActions(m)}</div></article>`;
  }).join(''):`<div class="card empty-state">${empty}</div>`);
  renderIcons(schedule);
}

function renderNextMeeting(){
  const card=document.getElementById('next-meeting');
  const next=upcomingMeetings()[0];
  if(!next){
    card.innerHTML=`<p class="eyebrow">PRÓXIMO ENCONTRO</p><div><h2>Nenhum encontro agendado</h2><p>${state.user.role==='PADRINHO'?'Agende um encontro com seu afilhado.':'Solicite um horário da disponibilidade do seu padrinho ou proponha um dia e horário específico.'}</p><div style="display:flex;gap:12px;margin-top:10px;flex-wrap:wrap"><button class="text-button" data-open-modal="encontro">${state.user.role==='PADRINHO'?'Agendar agora':'Solicitar encontro'} <i data-icon="arrow"></i></button><button class="text-button" data-view="agenda">Abrir agenda <i data-icon="arrow"></i></button></div></div>`;
  }else{
    const start=meetingStart(next);
    const canChat=['CONFIRMADO','CONCLUIDO'].includes(next.status);
    card.innerHTML=`<p class="eyebrow">PRÓXIMO ENCONTRO</p><span class="calendar-chip"><strong>${start.getDate()}</strong><small>${new Intl.DateTimeFormat('pt-BR',{month:'short'}).format(start).replace('.','').toUpperCase()}</small></span><div><h2>${escapeHtml(next.title)}</h2><p><i data-icon="clock"></i> ${capitalize(start.toLocaleDateString('pt-BR',{weekday:'long'}))} · ${timeOf(start)} — ${timeOf(meetingEnd(next))}</p><div style="display:flex;gap:12px;margin-top:8px;flex-wrap:wrap"><button class="text-button" data-view="agenda" data-date="${localDate(start)}">Ver detalhes <i data-icon="arrow"></i></button>${canChat?`<button class="text-button" data-open-chat="${next.mentorshipId}"><i data-icon="message"></i> Mensagens</button>`:''}</div></div>`;
  }
  renderIcons(card);
}

function selectDate(key){
  const d=parseLocalDate(key);
  state.selectedDate=key;
  state.calendar={year:d.getFullYear(),month:d.getMonth()};
  renderAgenda();
}

function googleCalendarLink(m){
  const params=new URLSearchParams({action:'TEMPLATE',text:m.title,dates:`${utcStamp(meetingStart(m))}/${utcStamp(meetingEnd(m))}`,details:`Encontro de apadrinhamento ADS IFPE${counterpart(m)?' com '+counterpart(m):''}.`,location:m.format||''});
  return `https://calendar.google.com/calendar/render?${params}`;
}
const icsText = value => String(value||'').replace(/[\\;,]/g,c=>'\\'+c).replace(/\r?\n/g,'\\n');
function downloadIcs(meetings,filename){
  if(!meetings.length){toast('Não há encontros futuros para exportar.');return;}
  const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Apadrinhamento ADS IFPE//Agenda//PT-BR','CALSCALE:GREGORIAN','METHOD:PUBLISH'];
  meetings.forEach(m=>lines.push('BEGIN:VEVENT',`UID:encontro-${m.id}@apadrinhamento-ads-ifpe`,`DTSTAMP:${utcStamp(new Date())}`,`DTSTART:${utcStamp(meetingStart(m))}`,`DTEND:${utcStamp(meetingEnd(m))}`,`SUMMARY:${icsText(m.title)}`,`DESCRIPTION:${icsText(`Encontro de apadrinhamento${counterpart(m)?' com '+counterpart(m):''}`)}`,`LOCATION:${icsText(m.format)}`,`STATUS:${m.status==='CONFIRMADO'?'CONFIRMED':'TENTATIVE'}`,'END:VEVENT'));
  lines.push('END:VCALENDAR');
  const link=document.createElement('a');
  link.href=URL.createObjectURL(new Blob([lines.join('\r\n')],{type:'text/calendar;charset=utf-8'}));
  link.download=filename;
  link.click();
  setTimeout(()=>URL.revokeObjectURL(link.href),1000);
}

// 10. Validação de conflito de agendamento -----------------------------------
function findConflictingMeeting(startsAtIso,durationMinutes){
  const start=new Date(startsAtIso);
  if(isNaN(start.getTime()))return null;
  const end=new Date(start.getTime()+(Number(durationMinutes)||45)*60000);
  return state.meetings.find(m=>{
    if(!['PROPOSTO','CONFIRMADO'].includes(m.status))return false;
    const exStart=meetingStart(m);
    const exEnd=meetingEnd(m);
    return exStart<end && start<exEnd;
  })||null;
}

// 3. Chat / Troca de mensagens após confirmação de agendamento ---------------
async function openChatModal(mentorshipId){
  const targetId=Number(mentorshipId)||state.mentorships.find(m=>m.status==='ATIVO')?.id;
  if(!targetId){
    toast('Você precisa ter um vínculo de apadrinhamento ativo para enviar mensagens.');
    return;
  }
  const mentorship=state.mentorships.find(m=>m.id===targetId);
  if(!mentorship){
    toast('Vínculo não encontrado.');
    return;
  }
  state.activeChatMentorshipId=targetId;
  const other=state.user.role==='PADRINHO'?mentorship.godchild:mentorship.mentor;
  const unlocked=hasConfirmedMeeting(targetId);
  let msgs=[];
  try{
    msgs=await api(`/mentorships/${targetId}/messages`);
  }catch{}

  const messagesHtml=msgs.length
    ? msgs.map(msg=>{
        const mine=msg.sender.id===state.user.id;
        return `<div class="chat-bubble ${mine?'mine':''}">
          <span class="chat-bubble-meta">${escapeHtml(mine?'Você':msg.sender.name)} · ${relativeTime(msg.createdAt)}</span>
          <p>${escapeHtml(msg.content)}</p>
        </div>`;
      }).join('')
    : `<p class="empty-state" style="padding:24px 10px;margin:0">${unlocked?'Nenhuma mensagem ainda. Envie um “Olá” para combinar os detalhes do encontro!':'As mensagens aparecerão aqui assim que o agendamento for confirmado.'}</p>`;

  showModal(`
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px">
      ${avatarHtml(other,'avatar-purple large')}
      <div>
        <p class="eyebrow" style="margin:0">MENSAGENS DO APADRINHAMENTO</p>
        <h2 style="margin:2px 0">${escapeHtml(other.name)}</h2>
        <p style="margin:0">${escapeHtml(roleLabel(other.role))} · ${escapeHtml(other.period||'ADS')}</p>
      </div>
    </div>
    <div class="chat-status-banner ${unlocked?'unlocked':'locked'}">
      <i data-icon="${unlocked?'check':'clock'}"></i>
      <span>${unlocked?'Agendamento confirmado! A troca de mensagens está liberada.':'A troca de mensagens é liberada após a confirmação de um agendamento na Agenda.'}</span>
    </div>
    <div class="chat-messages-box" id="chat-messages-box">${messagesHtml}</div>
    ${unlocked
      ? `<form data-modal-form="chat">
          <input type="hidden" name="mentorshipId" value="${targetId}" />
          <div class="chat-input-row">
            <textarea name="content" placeholder="Escreva sua mensagem para ${escapeHtml(other.name.split(' ')[0])}..." required maxlength="2000"></textarea>
            <button type="submit" class="primary"><i data-icon="send"></i>Enviar</button>
          </div>
        </form>`
      : `<div class="help-actions"><button type="button" class="primary" data-view="agenda"><i data-icon="calendar"></i>Ir para a Agenda confirmar encontro</button><button type="button" class="outline modal-close-button">Fechar</button></div>`
    }
  `,true);
  const box=document.getElementById('chat-messages-box');
  if(box)box.scrollTop=box.scrollHeight;
}

// 8. Fórum Colaborativo (Mais visual, cards, categorias e interação) ---------
const CATEGORY_ICONS = {
  'Lógica de programação':'💻',
  'Rotina acadêmica':'📅',
  'Professores e disciplinas':'🎓',
  'Provas e avaliações':'📝',
  'Estágio':'🚀',
  'Carreira':'💼',
  'Vida no campus':'🏫',
  'Organização':'🗂️'
};

function renderQuestions(){
  const list=document.getElementById('topic-list');
  const statsBanner=document.getElementById('forum-stats-banner');
  if(!list)return;

  const totalQuestions=state.questions.length;
  const totalAnswers=state.questions.reduce((acc,q)=>acc+(q.answerCount||0),0);
  const unansweredCount=state.questions.filter(q=>!q.answerCount).length;
  const totalLikes=state.questions.reduce((acc,q)=>acc+(q.likes||0),0);

  if(statsBanner){
    statsBanner.innerHTML=`
      <div class="forum-stat-card"><span class="activity-icon green"><i data-icon="message"></i></span><div><strong>${totalQuestions}</strong><span>Discussões ativas</span></div></div>
      <div class="forum-stat-card"><span class="activity-icon purple"><i data-icon="check"></i></span><div><strong>${totalAnswers}</strong><span>Respostas compartilhadas</span></div></div>
      <div class="forum-stat-card"><span class="activity-icon orange"><i data-icon="clock"></i></span><div><strong>${unansweredCount}</strong><span>Aguardando resposta</span></div></div>
      <div class="forum-stat-card"><span class="activity-icon green"><i data-icon="heart"></i></span><div><strong>${totalLikes}</strong><span>Interações úteis</span></div></div>
    `;
    renderIcons(statsBanner);
  }

  const term=normalize(document.getElementById('forum-search')?.value||'');
  const catFilter=normalize(state.forumCategory);
  document.querySelectorAll('[data-forum-filter]').forEach(b=>b.classList.toggle('active',term&&normalize(b.dataset.forumFilter)===term));
  document.querySelectorAll('[data-forum-category]').forEach(b=>b.classList.toggle('active',normalize(b.dataset.forumCategory)===catFilter));
  document.querySelectorAll('[data-forum-tab]').forEach(b=>b.classList.toggle('active',b.dataset.forumTab===state.forumTab));

  let questions=state.questions.filter(q=>{
    if(catFilter && normalize(q.category)!==catFilter)return false;
    if(term && !normalize(`${q.title} ${q.content} ${q.category} ${q.author.name}`).includes(term))return false;
    if(state.forumTab==='unanswered' && q.answerCount>0)return false;
    if(state.forumTab==='mine' && q.author.id!==state.user?.id)return false;
    return true;
  });

  if(state.forumTab==='popular'){
    questions=[...questions].sort((a,b)=>(b.likes||0)+(b.answerCount||0)-((a.likes||0)+(a.answerCount||0)));
  }

  list.innerHTML=questions.map((q,i)=>{
    const icon=CATEGORY_ICONS[q.category]||'💬';
    const answered=q.answerCount>0;
    return `<article class="topic-card">
      <div class="topic-card-header">
        <div class="topic-author">
          ${avatarHtml(q.author,i%2?'avatar-orange':'avatar-green')}
          <div>
            <strong>${escapeHtml(q.author.name)}</strong>
            <small>${escapeHtml(roleLabel(q.author.role))}${q.author.period?' · '+escapeHtml(q.author.period):''} · ${relativeTime(q.createdAt)}</small>
          </div>
        </div>
        <div class="topic-badges">
          <span class="cat-badge">${icon} ${escapeHtml(q.category)}</span>
          <span class="status-badge ${answered?'answered':'pending'}">${answered?`✓ ${q.answerCount} ${q.answerCount===1?'resposta':'respostas'}`:'💬 Aguardando ajuda'}</span>
        </div>
      </div>
      <h2><button type="button" data-topic="${q.id}">${escapeHtml(q.title)}</button></h2>
      <p>${escapeHtml(q.content)}</p>
      <div class="topic-card-footer">
        <div class="topic-actions">
          <button type="button" class="like-btn" data-like-question="${q.id}">👍 Útil (${q.likes||0})</button>
          <button type="button" class="discuss-btn" data-topic="${q.id}">💬 Ver discussão (${q.answerCount})</button>
        </div>
        <button type="button" class="reply-cta-btn" data-answer="${q.id}">Responder tópico →</button>
      </div>
    </article>`;
  }).join('')||`<div class="card empty-state">Nenhuma discussão encontrada para este filtro. Que tal iniciar uma nova pergunta?</div>`;
}

async function openTopic(questionId){
  const q=state.questions.find(x=>x.id===Number(questionId));
  if(!q){toast('Tópico não encontrado.');return;}
  const answers=await api(`/questions/${q.id}/answers`);
  const icon=CATEGORY_ICONS[q.category]||'💬';
  showModal(`
    <div class="topic-badges" style="margin-bottom:8px">
      <span class="cat-badge">${icon} ${escapeHtml(q.category)}</span>
      <span class="status-badge ${answers.length?'answered':'pending'}">${answers.length} ${answers.length===1?'resposta':'respostas'}</span>
    </div>
    <h2>${escapeHtml(q.title)}</h2>
    <p>Publicado por <strong>${escapeHtml(q.author.name)}</strong> (${escapeHtml(roleLabel(q.author.role))}) · ${dateTime(q.createdAt)}</p>
    <p class="topic-body" style="background:var(--canvas);padding:14px;border-radius:10px;border:1px solid var(--line)">${escapeHtml(q.content)}</p>
    <div style="display:flex;justify-content:space-between;align-items:center;margin:16px 0 8px">
      <h3 style="margin:0">Respostas da comunidade (${answers.length})</h3>
      <button type="button" class="like-btn" data-like-question="${q.id}">👍 Útil (${q.likes||0})</button>
    </div>
    <div class="answer-list">${answers.map(a=>`<article class="answer">${avatarHtml(a.author,a.author.role==='PADRINHO'?'avatar-purple':'avatar-green')}<div><strong>${escapeHtml(a.author.name)}</strong> <span class="badge ${a.author.role==='PADRINHO'?'blue':'yellow'}" style="display:inline-block;margin-left:4px">${escapeHtml(roleLabel(a.author.role))}</span> <small>· ${relativeTime(a.createdAt)}</small><p>${escapeHtml(a.content)}</p></div></article>`).join('')||'<p class="empty-state" style="padding:18px">Ninguém respondeu ainda. Seja o primeiro a ajudar!</p>'}</div>
    <form data-modal-form="resposta">
      <input type="hidden" name="questionId" value="${q.id}">
      <label>Contribuir com uma resposta<textarea name="content" required maxlength="3000" placeholder="Compartilhe uma dica prática, explicação ou recomendação..."></textarea></label>
      <button class="primary">Publicar resposta</button>
    </form>
  `,true);
}

// 9. Mural convertido em FAQ Categorizado ------------------------------------
function renderTips(){
  const grid=document.getElementById('mural-grid');
  if(!grid)return;
  const searchTerm=normalize(document.getElementById('faq-search')?.value||'');
  const catFilter=normalize(state.faqCategory);

  document.querySelectorAll('[data-faq-cat]').forEach(b=>b.classList.toggle('active',normalize(b.dataset.faqCat)===catFilter));

  const filtered=state.tips.filter(t=>{
    if(catFilter && normalize(t.category)!==catFilter)return false;
    if(searchTerm && !normalize(`${t.title} ${t.content} ${t.category}`).includes(searchTerm))return false;
    return true;
  });

  grid.innerHTML=filtered.map((t,i)=>`
    <details class="faq-item" ${i===0?'open':''}>
      <summary>
        <div class="faq-summary-left">
          <span class="faq-cat-pill">${escapeHtml(t.category||'Geral')}</span>
          <span>${escapeHtml(t.title)}</span>
        </div>
        <span class="faq-chevron">▾</span>
      </summary>
      <div class="faq-answer">
        <p>${escapeHtml(t.content)}</p>
        <footer>
          <span>Respondido por ${escapeHtml(t.author.name)} (${escapeHtml(roleLabel(t.author.role))})</span>
          <span>Atualizado em ${dateTime(t.createdAt)}</span>
        </footer>
      </div>
    </details>
  `).join('')||`<div class="card empty-state">Nenhuma pergunta frequente encontrada para este critério. Pergunte também no <button type="button" class="text-button" data-view="forum">Fórum Colaborativo</button>!</div>`;
}

function renderActivity(){
  const items=[
    ...state.questions.map(q=>({icon:'message',color:'green',title:q.author.id===state.user.id?'Você publicou uma dúvida no fórum':`Nova dúvida de ${q.author.name}`,text:q.title,date:q.createdAt})),
    ...state.tips.map(t=>({icon:'book',color:'orange',title:'Novo tópico no FAQ',text:t.title,date:t.createdAt}))
  ].sort((a,b)=>new Date(b.date)-new Date(a.date)).slice(0,4);
  document.getElementById('activity-list').innerHTML=items.map(a=>`<div class="activity-row"><span class="activity-icon ${a.color}"><i data-icon="${a.icon}"></i></span><div><strong>${escapeHtml(a.title)}</strong><p>${escapeHtml(a.text)}</p><small>${relativeTime(a.date)}</small></div></div>`).join('')||'<p>Nenhuma atividade recente.</p>';
  renderIcons(document.getElementById('activity-list'));
}

// 2. Sistema de Notificações (Marcar como lidas e Arquivar) ------------------
const readKey = () => `apadrinha_lidas_${state.user?.id||'0'}`;
const archivedKey = () => `apadrinha_arquivadas_${state.user?.id||'0'}`;

function readIds(){
  const local=JSON.parse(localStorage.getItem(readKey())||'[]');
  const server=Array.isArray(state.user?.readNotifications)?state.user.readNotifications:[];
  return new Set([...local,...server]);
}

function archivedIds(){
  const local=JSON.parse(localStorage.getItem(archivedKey())||'[]');
  const server=Array.isArray(state.user?.archivedNotifications)?state.user.archivedNotifications:[];
  return new Set([...local,...server]);
}

async function markRead(ids){
  if(!ids||!ids.length||!state.user)return;
  const read=readIds();
  ids.forEach(id=>read.add(id));
  localStorage.setItem(readKey(),JSON.stringify([...read].slice(-300)));
  if(state.user){
    state.user.readNotifications=[...read];
  }
  renderNotifications();
  try{
    const updated=await api('/notifications/read',{method:'POST',body:JSON.stringify({ids})});
    state.user=updated;
    renderNotifications();
  }catch{}
}

async function archiveNotifications(ids){
  if(!ids||!ids.length||!state.user)return;
  const arch=archivedIds();
  const read=readIds();
  ids.forEach(id=>{arch.add(id);read.add(id);});
  localStorage.setItem(archivedKey(),JSON.stringify([...arch].slice(-300)));
  localStorage.setItem(readKey(),JSON.stringify([...read].slice(-300)));
  if(state.user){
    state.user.archivedNotifications=[...arch];
    state.user.readNotifications=[...read];
  }
  renderNotifications();
  try{
    const updated=await api('/notifications/archive',{method:'POST',body:JSON.stringify({ids})});
    state.user=updated;
    renderNotifications();
  }catch{}
}

function buildNotifications(){
  const u=state.user,list=[],now=new Date(),archived=archivedIds();
  if(!u)return [];
  if(u.role==='PADRINHO'){
    state.mentorships.filter(m=>m.status==='PENDENTE').forEach(m=>list.push({id:`mentorship-${m.id}-PENDENTE`,icon:'heart',title:`Nova solicitação de ${m.godchild.name}`,text:'Avalie o pedido de apadrinhamento.',view:'solicitacoes'}));
  }
  if(u.role==='AFILHADO'){
    state.mentorships.filter(m=>m.status!=='PENDENTE').forEach(m=>list.push({id:`mentorship-${m.id}-${m.status}`,icon:'users',title:{ATIVO:`${m.mentor.name} aceitou sua solicitação`,RECUSADO:`${m.mentor.name} recusou sua solicitação`,ENCERRADO:`Vínculo com ${m.mentor.name} encerrado`}[m.status],text:m.status==='RECUSADO'?'Você pode procurar outro padrinho.':'Acompanhe seu apadrinhamento.',view:m.status==='RECUSADO'?'encontrar':'inicio'}));
  }
  state.meetings.filter(m=>meetingEnd(m)>=now).forEach(m=>{
    const when=`${longDate(meetingStart(m))} · ${timeOf(meetingStart(m))}`,date=localDate(meetingStart(m));
    const proposedBy=m.proposedBy||'PADRINHO';
    if(u.role==='AFILHADO'&&m.status==='PROPOSTO'&&proposedBy==='PADRINHO')list.push({id:`meeting-${m.id}-PROPOSTO`,icon:'calendar',title:`Convite para encontro: ${m.title}`,text:`${when} · confirme sua presença`,view:'agenda',date});
    if(u.role==='PADRINHO'&&m.status==='PROPOSTO'&&proposedBy==='AFILHADO')list.push({id:`meeting-${m.id}-SOLICITADO`,icon:'calendar',title:`Solicitação de encontro: ${m.title}`,text:`${when} · confirme o horário solicitado`,view:'agenda',date});
    if(m.status==='CONFIRMADO')list.push({id:`meeting-${m.id}-CONFIRMADO`,icon:'check',title:`Encontro confirmado: ${m.title}`,text:`${when} · mensagens liberadas`,view:'agenda',date});
    if(m.status==='CANCELADO')list.push({id:`meeting-${m.id}-CANCELADO`,icon:'x',title:`Encontro cancelado: ${m.title}`,text:when,view:'agenda',date});
  });
  state.questions.filter(q=>q.author.id===u.id&&q.answerCount>0).forEach(q=>list.push({id:`question-${q.id}-${q.answerCount}`,icon:'message',title:`Sua pergunta recebeu ${q.answerCount} ${q.answerCount===1?'resposta':'respostas'}`,text:q.title,topic:q.id}));
  state.tips.filter(t=>t.author.id!==u.id&&now-new Date(t.createdAt)<=7*86400000).forEach(t=>list.push({id:`tip-${t.id}`,icon:'book',title:'Novo item no FAQ',text:t.title,view:'mural'}));
  if(u.role==='ADMIN'){
    state.pending.forEach(m=>list.push({id:`admin-pending-${m.id}`,icon:'heart',title:'Solicitação aguardando ação',text:`${m.godchild.name} → ${m.mentor.name}`,view:'admin'}));
  }
  return list.filter(n=>!archived.has(n.id));
}

function renderNotifications(){
  if(!state.user)return;
  state.notifications=buildNotifications();
  const read=readIds();
  const unread=state.notifications.filter(n=>!read.has(n.id)).length;
  const badge=document.querySelector('#notifications-button b');
  badge.hidden=!unread;
  badge.textContent=unread>9?'9+':unread;
  document.getElementById('notifications-button').setAttribute('aria-label',unread?`Notificações: ${unread} não lida(s)`:'Notificações');
  const list=document.getElementById('notifications-list');
  list.innerHTML=state.notifications.map(n=>{
    const isRead=read.has(n.id);
    return `<div class="notification-row${isRead?'':' unread'}">
      <button type="button" class="notification-item" data-notification="${escapeHtml(n.id)}">
        <span class="activity-icon green"><i data-icon="${n.icon}"></i></span>
        <span><strong>${escapeHtml(n.title)}</strong><p>${escapeHtml(n.text)}</p></span>
      </button>
      <div class="notification-item-actions">
        ${!isRead?`<button type="button" class="notif-action-btn" data-notification-mark-read="${escapeHtml(n.id)}" title="Marcar como lida"><i data-icon="check"></i>Lida</button>`:''}
        <button type="button" class="notif-action-btn archive" data-notification-archive="${escapeHtml(n.id)}" title="Arquivar notificação"><i data-icon="x"></i>Arquivar</button>
      </div>
    </div>`;
  }).join('')||'<p class="notifications-empty">Você está em dia! Nenhuma notificação ativa no momento.</p>';
  renderIcons(list);
}

function toggleNotifications(open){
  const panel=document.getElementById('notifications-panel');
  const show=open??panel.hidden;
  panel.hidden=!show;
  document.getElementById('notifications-button').setAttribute('aria-expanded',String(show));
}

function openNotification(id){
  const n=state.notifications.find(x=>x.id===id);
  if(!n)return;
  markRead([id]);
  toggleNotifications(false);
  if(n.topic){
    view('forum');
    openTopic(n.topic).catch(err=>toast(err.message));
    return;
  }
  view(n.view);
  if(n.date)selectDate(n.date);
}

// Administração e Perfil (11. Alterar foto e 5. Disponibilidade específica) ---
async function loadAdmin(){
  if(state.user?.role!=='ADMIN')return;
  const [indicators,pending]=await Promise.all([api('/admin/indicators'),api('/admin/pending')]);
  state.pending=pending;
  const values=[indicators.afilhados,indicators.vinculosAtivos,indicators.perguntas,indicators.aguardandoMatch];
  document.querySelectorAll('.metrics .metric strong').forEach((el,i)=>el.textContent=String(values[i]??0).padStart(2,'0'));
  const table=document.querySelector('#admin .table');
  table.innerHTML='<div class="table-row table-head"><span>ESTUDANTE</span><span>PADRINHO</span><span>SITUAÇÃO</span><span></span></div>'+pending.map(m=>`<div class="table-row"><strong>${escapeHtml(m.godchild.name)}</strong><span>${escapeHtml(m.mentor.name)}</span><span class="badge yellow">${m.status}</span><button class="small-button admin-match" data-id="${m.id}">Ativar</button></div>`).join('');
}

function populateProfile(user){
  const nameInput=document.getElementById('profile-name-input');
  const periodSelect=document.getElementById('profile-period-select');
  const interestsInput=document.getElementById('profile-interests-input');
  const bioInput=document.getElementById('profile-bio-input');
  if(!nameInput)return;

  nameInput.value=user.name||'';
  periodSelect.value=user.period||'1º período';
  interestsInput.value=user.interests||'';
  bioInput.value=user.bio||'';

  document.getElementById('profile-name-heading').textContent=user.name;
  document.getElementById('profile-email-heading').textContent=user.email;
  setAvatarElement(document.getElementById('profile-avatar-preview'),user);
  const removeBtn=document.getElementById('remove-photo-btn');
  if(removeBtn)removeBtn.hidden=!user.avatarUrl;

  state.profileSlots=parseAvailabilitySlots(user);
  renderProfileSlots();
}

function compressImageFile(file,maxSize=320){
  return new Promise((resolve,reject)=>{
    if(!file||!file.type.startsWith('image/')){
      reject(new Error('Selecione um arquivo de imagem válido (JPG, PNG, WEBP).'));
      return;
    }
    const reader=new FileReader();
    reader.onerror=()=>reject(new Error('Erro ao ler a imagem selecionada.'));
    reader.onload=()=>{
      const img=new Image();
      img.onerror=()=>reject(new Error('Formato de imagem inválido.'));
      img.onload=()=>{
        const canvas=document.createElement('canvas');
        let {width,height}=img;
        if(width>height && width>maxSize){
          height=Math.round((height*maxSize)/width);
          width=maxSize;
        }else if(height>=width && height>maxSize){
          width=Math.round((width*maxSize)/height);
          height=maxSize;
        }
        canvas.width=width;
        canvas.height=height;
        const ctx=canvas.getContext('2d');
        ctx.drawImage(img,0,0,width,height);
        resolve(canvas.toDataURL('image/jpeg',0.86));
      };
      img.src=reader.result;
    };
    reader.readAsDataURL(file);
  });
}

async function handlePhotoUpload(file){
  if(!file)return;
  try{
    const dataUrl=await compressImageFile(file);
    const updated=await api('/users/me/photo',{method:'POST',body:JSON.stringify({avatarUrl:dataUrl})});
    setUser(updated);
    await loadData();
    toast('Foto de perfil atualizada com sucesso!');
  }catch(err){
    toast(err.message);
  }
}

async function handleRemovePhoto(){
  try{
    const updated=await api('/users/me/photo',{method:'POST',body:JSON.stringify({avatarUrl:''})});
    setUser(updated);
    await loadData();
    toast('Foto de perfil removida.');
  }catch(err){
    toast(err.message);
  }
}

// Cadastro --------------------------------------------------------------------
const INSTITUTIONAL_EMAIL = /^[a-z0-9._%+-]+@([a-z0-9-]+\.)*ifpe\.edu\.br$/i;
const STRONG_PASSWORD = /^(?=.*[A-Za-z])(?=.*\d)\S{8,64}$/;
function validateRegister(d){
  const errors={};
  if(String(d.name||'').trim().length<3)errors.name='Informe seu nome completo.';
  if(!String(d.email||'').trim())errors.email='Informe seu e-mail institucional.';
  else if(!INSTITUTIONAL_EMAIL.test(d.email.trim()))errors.email='Use seu e-mail institucional do IFPE (ex.: nome@discente.ifpe.edu.br).';
  if(!STRONG_PASSWORD.test(d.password||''))errors.password='A senha deve ter de 8 a 64 caracteres, com letras e números e sem espaços.';
  if(!d.confirmPassword)errors.confirmPassword='Confirme sua senha.';
  else if(d.password!==d.confirmPassword)errors.confirmPassword='As senhas não coincidem.';
  return errors;
}
function setFieldError(form,name,message){
  const input=form.querySelector(`[name="${name}"]`);
  const slot=form.querySelector(`[data-error-for="${name}"]`);
  if(slot)slot.textContent=message||'';
  if(input){
    if(message)input.setAttribute('aria-invalid','true');
    else input.removeAttribute('aria-invalid');
  }
}

async function register(form){
  showAuthError('register','');
  const d=Object.fromEntries(new FormData(form));
  const errors=validateRegister(d);
  ['name','email','password','confirmPassword'].forEach(f=>setFieldError(form,f,errors[f]));
  const firstInvalid=Object.keys(errors)[0];
  if(firstInvalid){form.querySelector(`[name="${firstInvalid}"]`).focus();return;}
  const result=await api('/auth/register',{method:'POST',body:JSON.stringify({name:d.name.trim(),email:d.email.trim().toLowerCase(),password:d.password,role:d.role})});
  storeToken(result.token);
  form.reset();
  await startSession(result.user);
}

// Modais ----------------------------------------------------------------------
function showModal(html,wide=false){
  const modal=document.getElementById('modal');
  modal.querySelector('.modal').classList.toggle('modal-wide',wide);
  document.getElementById('modal-content').innerHTML=html;
  renderIcons(modal);
  modal.classList.add('open');
  modal.querySelector('input:not([type=hidden]),textarea,select')?.focus();
}
function closeModal(){
  document.getElementById('modal').classList.remove('open');
}

function helpContent(){
  const role=state.user?.role;
  const items=[
    ['Como funciona o apadrinhamento?','Afilhados escolhem um padrinho em “Encontrar padrinho” usando filtros de assunto, período, dia e horário. Quando o padrinho aceita, o vínculo fica ativo.'],
    ['Quem pode agendar ou solicitar encontros?','Padrinhos podem agendar encontros e afilhados podem solicitar horários da disponibilidade cadastrada pelo padrinho ou propor um dia e horário específico. O sistema valida conflitos automaticamente.'],
    ['Como funciona o chat de mensagens?','Após a confirmação de um agendamento na Agenda, o botão de Mensagens fica liberado para conversa direta entre afilhado e padrinho.'],
    ['Como funciona a lista de Primeiros Passos?','Cada item marcado pelo afilhado é salvo automaticamente no banco de dados e ocultado da lista ativa conforme você avança.'],
    ['Como gerenciar notificações?','Você pode marcar notificações individuais ou todas como lidas, e arquivá-las para que desapareçam da lista de notificações.']
  ];
  return `<h2>Central de ajuda</h2><p>Respostas rápidas sobre o uso da plataforma${role?` para o perfil ${roleLabel(role).toLowerCase()}`:''}.</p><div class="help-list">${items.map(([q,a],i)=>`<details${i===0?' open':''}><summary>${q}</summary><p>${a}</p></details>`).join('')}</div><div class="help-actions"><button class="primary" data-view="mural">Abrir FAQ Completo</button><button class="outline" data-open-modal="pergunta"><i data-icon="message"></i>Perguntar no fórum</button><button class="outline modal-close-button">Fechar</button></div>`;
}

function showMentorAvailabilityModal(mentorId){
  const mentor=state.mentors.find(m=>m.id===Number(mentorId));
  if(!mentor)return;
  const slots=parseAvailabilitySlots(mentor);
  const slotsHtml=slots.length
    ? slots.map(s=>`<div class="slot-option-btn"><span>📅 ${escapeHtml(s.day)}</span><strong>${escapeHtml(s.start)}${s.end?' às '+escapeHtml(s.end):''}</strong></div>`).join('')
    : `<p>${escapeHtml(mentor.availability||'Horários a combinar')}</p>`;
  const existing=state.mentorships.find(ms=>ms.mentor?.id===mentor.id && ['PENDENTE','ATIVO'].includes(ms.status));
  showModal(`
    <p class="eyebrow">DISPONIBILIDADE DO PADRINHO</p>
    <h2>${escapeHtml(mentor.name)}</h2>
    <p>${escapeHtml(mentor.period||'Veterano ADS')} · ${escapeHtml(mentor.interests||'ADS')}</p>
    <div class="mentor-slots-picker">${slotsHtml}</div>
    <p class="field-hint">Após ter um vínculo ativo, você poderá solicitar qualquer um desses horários ou propor um dia e horário específico.</p>
    <div class="help-actions">
      ${existing?.status==='ATIVO'
        ? `<button type="button" class="primary" data-open-modal="encontro" data-mentorship="${existing.id}">Solicitar encontro</button>`
        : existing?.status==='PENDENTE'
          ? `<button type="button" class="match-sent-btn" data-cancel-match="${existing.id}" data-name="${escapeHtml(mentor.name)}">Solicitação enviada (Cancelar)</button>`
          : `<button type="button" class="primary request-match" data-id="${mentor.id}" data-name="${escapeHtml(mentor.name)}">Pedir match com ${escapeHtml(mentor.name.split(' ')[0])}</button>`
      }
      <button type="button" class="outline modal-close-button">Fechar</button>
    </div>
  `);
}

function modal(kind,context={}){
  let html='';
  if(kind==='encontro'){
    const active=state.mentorships.filter(m=>m.status==='ATIVO');
    if(!active.length){
      html=state.user.role==='PADRINHO'
        ? '<h2>Agendar encontro</h2><p>Você precisa ter ao menos um afilhado com vínculo ativo para agendar um encontro.</p><button class="primary" data-view="solicitacoes">Ver solicitações</button>'
        : '<h2>Solicitar encontro</h2><p>Você precisa ter um vínculo ativo com um padrinho para solicitar um encontro.</p><button class="primary" data-view="encontrar">Encontrar padrinho</button>';
    }else{
      const selectedMentorship=active.find(m=>String(m.id)===String(context.mentorship))||active[0];
      const isChild=state.user.role==='AFILHADO';
      const mentorSlots=parseAvailabilitySlots(selectedMentorship.mentor);
      const tomorrow=new Date(Date.now()+86400000);
      const defaultDate=state.selectedDate&&state.selectedDate>=localDate(new Date())?state.selectedDate:localDate(tomorrow);

      const slotsPickerHtml=isChild
        ? `<div style="margin:12px 0">
            <strong style="font-size:12px;display:block;margin-bottom:6px">Disponibilidade cadastrada por ${escapeHtml(selectedMentorship.mentor.name)} (clique para preencher ou escolha outro dia/horário abaixo):</strong>
            <div class="mentor-slots-picker">
              ${mentorSlots.length
                ? mentorSlots.map(s=>{
                    const nextDate=nextDateForWeekday(s.day);
                    return `<button type="button" class="slot-option-btn" data-pick-slot-date="${nextDate}" data-pick-slot-time="${escapeHtml(s.start)}">
                      <span>📅 ${escapeHtml(s.day)} (${escapeHtml(s.start)}${s.end?' às '+escapeHtml(s.end):''})</span>
                      <small>Próxima data: ${nextDate.split('-').reverse().join('/')}</small>
                    </button>`;
                  }).join('')
                : `<p class="field-hint">O padrinho não cadastrou turnos fixos. Escolha abaixo o dia e horário específico desejado.</p>`
              }
            </div>
          </div>`
        : '';

      html=`
        <h2>${isChild?'Solicitar encontro ao padrinho':'Agendar encontro'}</h2>
        <p>${isChild?'Selecione um horário disponível do seu padrinho ou solicite um dia e horário específico para o encontro.':'Proponha um dia e horário; o sistema verifica conflitos automaticamente.'}</p>
        <form data-modal-form="encontro" id="meeting-modal-form">
          <label>${isChild?'Padrinho':'Afilhado'}
            <select name="mentorshipId" required>
              ${active.map(m=>`<option value="${m.id}"${m.id===selectedMentorship.id?' selected':''}>${escapeHtml(isChild?m.mentor.name:m.godchild.name)}</option>`).join('')}
            </select>
          </label>
          ${slotsPickerHtml}
          <div class="form-grid" style="margin-top:8px">
            <label>Data específica<input name="date" id="meeting-date-input" type="date" min="${localDate(new Date())}" value="${defaultDate}" required></label>
            <label>Horário específico<input name="time" id="meeting-time-input" type="time" value="14:00" required></label>
          </div>
          <div class="form-grid">
            <label>Duração
              <select name="durationMinutes" id="meeting-duration-input">
                <option value="30">30 minutos</option>
                <option value="45" selected>45 minutos</option>
                <option value="60">1 hora</option>
                <option value="90">1h30</option>
              </select>
            </label>
            <label>Formato
              <select name="format">
                <option>Videochamada</option>
                <option>Presencial</option>
              </select>
            </label>
          </div>
          <label>Assunto do encontro<input name="title" placeholder="Ex.: Dúvidas sobre Lógica e organização de estudos" required maxlength="255"></label>
          <div id="meeting-conflict-alert" class="conflict-warning" hidden></div>
          <button class="primary" type="submit">${isChild?'Enviar solicitação de encontro':'Enviar convite de encontro'}</button>
        </form>
      `;
    }
  }
  if(kind==='pergunta'){
    html='<h2>Fazer uma pergunta no Fórum</h2><p>Compartilhe sua dúvida com os colegas e padrinhos de ADS.</p><form data-modal-form="pergunta"><label>Título da dúvida<input name="title" placeholder="Ex.: Como me preparar para a primeira prova de Lógica?" required maxlength="255"></label><label>Categoria<select name="category"><option>Lógica de programação</option><option>Rotina acadêmica</option><option>Professores e disciplinas</option><option>Provas e avaliações</option><option>Estágio</option><option>Carreira</option><option>Vida no campus</option><option>Organização</option></select></label><label>Detalhes<textarea name="content" placeholder="Explique sua dúvida com detalhes para receber respostas melhores..." required maxlength="3000"></textarea></label><button class="primary">Publicar pergunta</button></form>';
  }
  if(kind==='dica'){
    html=state.user.role==='PADRINHO'
      ? '<h2>Adicionar pergunta e resposta ao FAQ</h2><p>Cadastre uma dúvida frequente e sua resposta para orientar os calouros.</p><form data-modal-form="dica"><label>Pergunta frequente<input name="title" placeholder="Ex.: Como acessar os laboratórios fora do horário de aula?" required maxlength="255"></label><label>Categoria do FAQ<select name="category"><option value="Vida no campus">Vida no campus</option><option value="Rotina acadêmica">Rotina acadêmica</option><option value="Estudos e programação">Estudos e programação</option><option value="Organização">Organização</option><option value="Estágio e carreira">Estágio e carreira</option><option value="Sobre o apadrinhamento">Sobre o apadrinhamento</option></select></label><label>Resposta detalhada<textarea name="content" required maxlength="5000"></textarea></label><button class="primary">Publicar no FAQ</button></form>'
      : '<h2>Publicação restrita</h2><p>Somente padrinhos podem adicionar novos itens ao FAQ.</p>';
  }
  if(kind==='resposta'){
    html=`<h2>Responder pergunta</h2><p>Compartilhe uma resposta respeitosa e objetiva.</p><form data-modal-form="resposta"><input type="hidden" name="questionId" value="${context.questionId}"><label>Resposta<textarea name="content" required maxlength="3000"></textarea></label><button class="primary">Publicar resposta</button></form>`;
  }
  if(kind==='avaliacao'){
    const active=state.mentorships.find(m=>m.status==='ATIVO');
    html=`<h2>Avaliar mentoria</h2><p>Seu feedback ajuda a melhorar o programa.</p><form data-modal-form="avaliacao"><input type="hidden" name="mentorshipId" value="${active?.id||''}"><label>Nota<select name="rating"><option value="5">5 — Excelente</option><option value="4">4 — Muito boa</option><option value="3">3 — Boa</option><option value="2">2 — Regular</option><option value="1">1 — Ruim</option></select></label><label>Comentário<textarea name="comment" required></textarea></label><button class="primary">Enviar avaliação</button></form>`;
  }
  if(kind==='ajuda')html=helpContent();
  showModal(html);
  if(kind==='encontro')updateMeetingConflictWarning();
}

function updateMeetingConflictWarning(){
  const dateEl=document.getElementById('meeting-date-input');
  const timeEl=document.getElementById('meeting-time-input');
  const durEl=document.getElementById('meeting-duration-input');
  const alertEl=document.getElementById('meeting-conflict-alert');
  if(!dateEl||!timeEl||!alertEl)return;
  const startsAt=`${dateEl.value}T${timeEl.value}:00`;
  const conflict=findConflictingMeeting(startsAt,durEl?.value||45);
  if(conflict){
    alertEl.hidden=false;
    alertEl.textContent=`⚠️ Conflito de horário: já existe o encontro "${conflict.title}" agendado/solicitado neste mesmo dia e período (${timeOf(meetingStart(conflict))}–${timeOf(meetingEnd(conflict))}). Escolha outro horário.`;
  }else{
    alertEl.hidden=true;
    alertEl.textContent='';
  }
}

async function submitModal(form){
  const data=Object.fromEntries(new FormData(form));
  const kind=form.dataset.modalForm;
  if(kind==='encontro'){
    const startsAt=`${data.date}T${data.time}:00`;
    if(new Date(startsAt)<=new Date())throw new Error('Escolha uma data e horário no futuro.');
    const conflict=findConflictingMeeting(startsAt,data.durationMinutes);
    if(conflict)throw new Error('Conflito de agendamento: já existe um encontro solicitado ou agendado para este mesmo dia e horário.');
    await api('/meetings',{method:'POST',body:JSON.stringify({mentorshipId:Number(data.mentorshipId),title:data.title,startsAt,durationMinutes:Number(data.durationMinutes),format:data.format})});
    state.selectedDate=data.date;
  }
  if(kind==='pergunta'){
    await api('/questions',{method:'POST',body:JSON.stringify(data)});
    if(state.user?.role==='AFILHADO')await markStepCompletedSilently('primeira_pergunta');
  }
  if(kind==='dica')await api('/tips',{method:'POST',body:JSON.stringify(data)});
  if(kind==='resposta')await api(`/questions/${data.questionId}/answers`,{method:'POST',body:JSON.stringify({content:data.content})});
  if(kind==='avaliacao'){
    if(!data.mentorshipId)throw new Error('Você ainda não possui vínculo ativo');
    await api('/reviews',{method:'POST',body:JSON.stringify({mentorshipId:Number(data.mentorshipId),rating:Number(data.rating),comment:data.comment})});
  }
  if(kind==='chat'){
    await api(`/mentorships/${data.mentorshipId}/messages`,{method:'POST',body:JSON.stringify({content:data.content})});
    await openChatModal(Number(data.mentorshipId));
    return;
  }
  closeModal();
  toast(kind==='encontro'
    ? (state.user.role==='AFILHADO'?'Solicitação de encontro enviada ao padrinho!':'Convite enviado! O afilhado será notificado.')
    : 'Operação realizada com sucesso!');
  await loadData();
  if(kind==='encontro'){
    const d=parseLocalDate(data.date);
    state.calendar={year:d.getFullYear(),month:d.getMonth()};
    renderAgenda();
  }
  if(kind==='resposta')await openTopic(data.questionId);
}

async function run(action,success){
  try{
    await action();
    if(success)toast(success);
    await loadData();
  }catch(err){
    toast(err.message);
  }
}

function bindEvents(){
  document.getElementById('login-form').addEventListener('submit',async e=>{
    e.preventDefault();
    showAuthError('login','');
    const d=Object.fromEntries(new FormData(e.currentTarget));
    try{await login(d.email.trim(),d.password);}catch(err){showAuthError('login',err.message);}
  });

  const registerForm=document.getElementById('register-form');
  registerForm.addEventListener('submit',async e=>{
    e.preventDefault();
    try{await register(e.currentTarget);}catch(err){showAuthError('register',err.message);}
  });
  registerForm.addEventListener('input',e=>{
    if(e.target.getAttribute('aria-invalid')==='true'){
      const errors=validateRegister(Object.fromEntries(new FormData(registerForm)));
      setFieldError(registerForm,e.target.name,errors[e.target.name]);
    }
  });

  // Salvar Perfil (com disponibilidade específica de dias e horários)
  document.getElementById('profile-form').addEventListener('submit',async e=>{
    e.preventDefault();
    const name=document.getElementById('profile-name-input').value.trim();
    const period=document.getElementById('profile-period-select').value;
    const interests=document.getElementById('profile-interests-input').value.trim();
    const bio=document.getElementById('profile-bio-input').value.trim();
    const availabilitySlots=serializeSlots(state.profileSlots);
    const availability=formatSlotsHuman(state.profileSlots);
    if(!availability){
      toast('Adicione pelo menos um dia e horário específico na sua disponibilidade.');
      return;
    }
    try{
      const user=await api('/users/me',{
        method:'PUT',
        body:JSON.stringify({name,period,interests,availability,availabilitySlots,bio,avatarUrl:state.user?.avatarUrl||null})
      });
      setUser(user);
      toast(profileComplete(user)?'Perfil e horários atualizados com sucesso!':'Perfil salvo. Preencha interesses e expectativas para completá-lo.');
    }catch(err){
      toast(err.message);
    }
  });

  document.getElementById('profile-cancel-btn')?.addEventListener('click',()=>{
    if(state.user)populateProfile(state.user);
    toast('Alterações descartadas.');
  });

  // Upload e remoção de foto de perfil
  const photoInput=document.getElementById('profile-photo-input');
  document.getElementById('change-photo-btn')?.addEventListener('click',()=>photoInput?.click());
  photoInput?.addEventListener('change',e=>{
    const file=e.target.files?.[0];
    if(file)handlePhotoUpload(file);
    e.target.value='';
  });
  document.getElementById('remove-photo-btn')?.addEventListener('click',handleRemovePhoto);

  // Adicionar horário no Perfil
  document.getElementById('profile-add-slot-btn')?.addEventListener('click',()=>{
    const day=document.getElementById('profile-slot-day').value;
    const start=document.getElementById('profile-slot-start').value;
    const end=document.getElementById('profile-slot-end').value;
    if(!day||!start||!end){toast('Informe dia, horário de início e término.');return;}
    if(end<=start){toast('O horário de término deve ser posterior ao início.');return;}
    if(state.profileSlots.some(s=>s.day===day&&s.start===start&&s.end===end)){
      toast('Este dia e horário já está na sua lista.');
      return;
    }
    state.profileSlots.push({day,start,end});
    renderProfileSlots();
  });

  // Adicionar horário na Gestão de Agenda do Padrinho
  document.getElementById('agenda-add-slot-btn')?.addEventListener('click',async ()=>{
    const day=document.getElementById('agenda-slot-day').value;
    const start=document.getElementById('agenda-slot-start').value;
    const end=document.getElementById('agenda-slot-end').value;
    if(!day||!start||!end){toast('Informe dia, horário de início e término.');return;}
    if(end<=start){toast('O horário de término deve ser posterior ao início.');return;}
    const current=parseAvailabilitySlots(state.user);
    if(current.some(s=>s.day===day&&s.start===start&&s.end===end)){
      toast('Este dia e horário já foi adicionado.');
      return;
    }
    current.push({day,start,end});
    try{await saveMentorAgendaSlots(current);}catch(err){toast(err.message);}
  });

  // Filtros Encontrar Padrinho
  ['mentor-filter-subject','mentor-filter-period','mentor-filter-day','mentor-filter-time'].forEach(id=>{
    const el=document.getElementById(id);
    if(el){
      el.addEventListener('input',renderMentors);
      el.addEventListener('change',renderMentors);
    }
  });

  document.getElementById('clear-mentor-filters')?.addEventListener('click',()=>{
    document.getElementById('mentor-filter-subject').value='';
    document.getElementById('mentor-filter-period').value='';
    document.getElementById('mentor-filter-day').value='';
    document.getElementById('mentor-filter-time').value='';
    document.querySelectorAll('[data-mentor-quick]').forEach((b,i)=>b.classList.toggle('active',i===0));
    renderMentors();
  });

  // Busca do Fórum e FAQ
  document.getElementById('forum-search')?.addEventListener('input',renderQuestions);
  document.getElementById('faq-search')?.addEventListener('input',renderTips);

  // Primeiros Passos: mudança em checkboxes
  document.getElementById('onboarding-checklist')?.addEventListener('change',e=>{
    const checkbox=e.target.closest('input[data-step-id]');
    if(checkbox){
      toggleChecklistStep(checkbox.dataset.stepId,checkbox.checked);
    }
  });

  document.addEventListener('visibilitychange',sync);
  document.addEventListener('keydown',e=>{
    if(e.key==='Escape'){closeModal();toggleNotifications(false);}
  });

  document.addEventListener('input',e=>{
    if(e.target.closest('#meeting-modal-form'))updateMeetingConflictWarning();
  });

  document.addEventListener('click',async e=>{
    const panelOpen=!document.getElementById('notifications-panel').hidden;
    if(panelOpen&&!e.target.closest('#notifications'))toggleNotifications(false);
    if(e.target.closest('#notifications-button')){toggleNotifications();return;}
    if(e.target.closest('[data-notifications-read]')){
      await markRead(state.notifications.map(n=>n.id));
      toast('Todas as notificações foram marcadas como lidas.');
      return;
    }
    if(e.target.closest('[data-notifications-archive-all]')){
      if(!state.notifications.length)return;
      await archiveNotifications(state.notifications.map(n=>n.id));
      toast('Notificações arquivadas.');
      return;
    }
    const markSingleRead=e.target.closest('[data-notification-mark-read]');
    if(markSingleRead){
      e.stopPropagation();
      await markRead([markSingleRead.dataset.notificationMarkRead]);
      return;
    }
    const archiveSingle=e.target.closest('[data-notification-archive]');
    if(archiveSingle){
      e.stopPropagation();
      await archiveNotifications([archiveSingle.dataset.notificationArchive]);
      toast('Notificação arquivada.');
      return;
    }
    const notification=e.target.closest('[data-notification]');
    if(notification){openNotification(notification.dataset.notification);return;}

    if(e.target.closest('[data-toggle-completed-steps]')){
      state.showCompletedSteps=!state.showCompletedSteps;
      renderChecklist();
      return;
    }

    const removeProfileSlot=e.target.closest('[data-remove-profile-slot]');
    if(removeProfileSlot){
      const idx=Number(removeProfileSlot.dataset.removeProfileSlot);
      state.profileSlots.splice(idx,1);
      renderProfileSlots();
      return;
    }

    const removeAgendaSlot=e.target.closest('[data-remove-agenda-slot]');
    if(removeAgendaSlot){
      const idx=Number(removeAgendaSlot.dataset.removeAgendaSlot);
      const slots=parseAvailabilitySlots(state.user);
      slots.splice(idx,1);
      try{await saveMentorAgendaSlots(slots);}catch(err){toast(err.message);}
      return;
    }

    const quickMentor=e.target.closest('[data-mentor-quick]');
    if(quickMentor){
      document.querySelectorAll('[data-mentor-quick]').forEach(b=>b.classList.toggle('active',b===quickMentor));
      document.getElementById('mentor-filter-subject').value=quickMentor.dataset.mentorQuick||'';
      renderMentors();
      return;
    }

    const mentorAvailBtn=e.target.closest('[data-mentor-availability]');
    if(mentorAvailBtn){
      showMentorAvailabilityModal(mentorAvailBtn.dataset.mentorAvailability);
      return;
    }

    const pickSlot=e.target.closest('[data-pick-slot-date]');
    if(pickSlot){
      document.querySelectorAll('[data-pick-slot-date]').forEach(b=>b.classList.toggle('selected',b===pickSlot));
      const dateInput=document.getElementById('meeting-date-input');
      const timeInput=document.getElementById('meeting-time-input');
      if(dateInput)dateInput.value=pickSlot.dataset.pickSlotDate;
      if(timeInput)timeInput.value=pickSlot.dataset.pickSlotTime;
      updateMeetingConflictWarning();
      return;
    }

    const chatTrigger=e.target.closest('[data-open-chat]');
    if(chatTrigger){
      await openChatModal(chatTrigger.dataset.openChat);
      return;
    }

    const forumCat=e.target.closest('[data-forum-category]');
    if(forumCat){
      state.forumCategory=forumCat.dataset.forumCategory||'';
      renderQuestions();
      return;
    }

    const forumTab=e.target.closest('[data-forum-tab]');
    if(forumTab){
      state.forumTab=forumTab.dataset.forumTab||'all';
      renderQuestions();
      return;
    }

    const likeBtn=e.target.closest('[data-like-question]');
    if(likeBtn){
      const qId=Number(likeBtn.dataset.likeQuestion);
      try{
        const updatedQ=await api(`/questions/${qId}/like`,{method:'POST'});
        state.questions=state.questions.map(q=>q.id===qId?updatedQ:q);
        renderQuestions();
        if(document.getElementById('modal').classList.contains('open')){
          await openTopic(qId);
        }
      }catch(err){toast(err.message);}
      return;
    }

    const faqCat=e.target.closest('[data-faq-cat]');
    if(faqCat){
      state.faqCategory=faqCat.dataset.faqCat||'';
      renderTips();
      return;
    }

    if(e.target.closest('#help-button')){modal('ajuda');return;}
    const target=e.target.closest('[data-view]');
    if(target){
      e.preventDefault();
      view(target.dataset.view);
      if(target.dataset.date&&state.user)selectDate(target.dataset.date);
      return;
    }
    if(e.target.closest('.mobile-menu'))document.querySelector('.sidebar').classList.toggle('open');
    if(e.target.closest('[data-logout]'))logout();

    const tab=e.target.closest('[data-auth-tab]');
    if(tab){
      document.querySelectorAll('[data-auth-tab]').forEach(b=>b.classList.toggle('active',b===tab));
      document.getElementById('login-form').classList.toggle('hidden',tab.dataset.authTab!=='login');
      document.getElementById('register-form').classList.toggle('hidden',tab.dataset.authTab!=='register');
    }
    const demo=e.target.closest('[data-demo]');
    if(demo){
      const [email,password]=demo.dataset.demo.split('|');
      document.querySelector('#login-form [name=email]').value=email;
      document.querySelector('#login-form [name=password]').value=password;
    }
    const open=e.target.closest('[data-open-modal]');
    if(open)modal(open.dataset.openModal,{mentorship:open.dataset.mentorship});
    if(e.target.closest('.modal-close-button'))closeModal();

    const answer=e.target.closest('[data-answer]');
    if(answer)modal('resposta',{questionId:answer.dataset.answer});
    const topic=e.target.closest('[data-topic]');
    if(topic)openTopic(topic.dataset.topic).catch(err=>toast(err.message));

    const filter=e.target.closest('[data-forum-filter]');
    if(filter){
      const search=document.getElementById('forum-search');
      search.value=normalize(search.value)===normalize(filter.dataset.forumFilter)?'':filter.dataset.forumFilter;
      renderQuestions();
    }
    const nav=e.target.closest('[data-calendar]');
    if(nav){
      const step=Number(nav.dataset.calendar);
      if(step===0){resetCalendar();state.selectedDate=localDate(new Date());}
      else{const d=new Date(state.calendar.year,state.calendar.month+step,1);state.calendar={year:d.getFullYear(),month:d.getMonth()};}
      renderAgenda();
    }
    const day=e.target.closest('#calendar-days [data-date]');
    if(day){
      if(state.selectedDate===day.dataset.date){state.selectedDate=null;renderAgenda();}
      else selectDate(day.dataset.date);
    }
    if(e.target.closest('[data-clear-date]')){state.selectedDate=null;renderAgenda();}
    if(e.target.closest('[data-export-ics]'))downloadIcs(upcomingMeetings(),'agenda-apadrinhamento.ics');
    const ics=e.target.closest('[data-ics]');
    if(ics){
      const m=state.meetings.find(x=>x.id===Number(ics.dataset.ics));
      if(m)downloadIcs([m],`encontro-${m.id}.ics`);
    }
    if(e.target.closest('[data-toast]'))toast(e.target.closest('[data-toast]').dataset.toast);

    const match=e.target.closest('.request-match');
    if(match){await handleRequestMatch(match);return;}

    const cancelMatch=e.target.closest('[data-cancel-match]');
    if(cancelMatch){await handleCancelMatch(cancelMatch);return;}

    const mentorship=e.target.closest('.mentorship-action');
    if(mentorship)await run(()=>api(`/mentorships/${mentorship.dataset.id}`,{method:'PATCH',body:JSON.stringify({status:mentorship.dataset.status})}),'Vínculo atualizado!');
    const admin=e.target.closest('.admin-match');
    if(admin)await run(()=>api(`/mentorships/${admin.dataset.id}`,{method:'PATCH',body:JSON.stringify({status:'ATIVO'})}),'Vínculo ativado!');
    const meeting=e.target.closest('.meeting-action');
    if(meeting){
      const status=meeting.dataset.status;
      if(status==='CANCELADO'&&!confirm('Deseja realmente cancelar este encontro?'))return;
      await run(async ()=>{
        await api(`/meetings/${meeting.dataset.id}`,{method:'PATCH',body:JSON.stringify({status})});
        if(status==='CONFIRMADO'&&state.user?.role==='AFILHADO'){
          await markStepCompletedSilently('primeiro_encontro');
        }
      },{CONFIRMADO:'Encontro confirmado! As mensagens com seu par foram liberadas.',CANCELADO:'Encontro cancelado.',CONCLUIDO:'Encontro concluído!'}[status]);
    }
  });

  const modalEl=document.getElementById('modal');
  modalEl.addEventListener('click',e=>{
    if(e.target===modalEl||e.target.closest('.modal-close'))closeModal();
  });
  modalEl.addEventListener('submit',async e=>{
    e.preventDefault();
    const button=e.target.querySelector('button.primary');
    if(button)button.disabled=true;
    try{await submitModal(e.target);}catch(err){toast(err.message);}finally{if(button)button.disabled=false;}
  });
}

function toast(message){
  const t=document.getElementById('toast');
  t.textContent=message;
  t.classList.add('show');
  clearTimeout(window.toastTimer);
  window.toastTimer=setTimeout(()=>t.classList.remove('show'),3500);
}

bootstrap();
