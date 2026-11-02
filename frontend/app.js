const API_BASE = location.protocol === 'file:' ? 'http://localhost:8080/api' : '/api';
const SYNC_INTERVAL = 60000;
const state = { token: localStorage.getItem('apadrinha_token'), user: null, mentorships: [], meetings: [], questions: [], tips: [], pending: [], notifications: [], calendar: null, selectedDate: null, syncTimer: null, lastSync: null };

const iconPaths = {
  home:'<path d="m3 10 9-7 9 7v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 21v-6h6v6"/>',
  users:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
  calendar:'<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  message:'<path d="M21 11.5a8.4 8.4 0 0 1-9 8.5 9.8 9.8 0 0 1-4.3-1L3 20l1.3-3.8A8.4 8.4 0 0 1 3 11.5a8.4 8.4 0 0 1 9-8.5 8.4 8.4 0 0 1 9 8.5z"/>',
  bookmark:'<path d="M19 21 12 16 5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>',
  chart:'<path d="M3 3v18h18"/><path d="m7 16 4-5 3 3 5-7"/>', more:'<circle cx="12" cy="5" r="1" fill="currentColor"/><circle cx="12" cy="12" r="1" fill="currentColor"/><circle cx="12" cy="19" r="1" fill="currentColor"/>',
  bell:'<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/>', menu:'<path d="M4 6h16M4 12h16M4 18h16"/>',
  plus:'<path d="M12 5v14M5 12h14"/>', send:'<path d="m22 2-7 20-4-9-9-4z"/><path d="M22 2 11 13"/>', arrow:'<path d="M5 12h14M13 6l6 6-6 6"/>',
  clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>', check:'<path d="m5 12 4 4L19 6"/>', book:'<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
  sliders:'<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3"/><path d="M1 14h6M9 8h6M17 16h6"/>', search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
  heart:'<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.9-8.6a5.5 5.5 0 0 0-.1-7.8z"/>', x:'<path d="m6 6 12 12M18 6 6 18"/>'
};

function renderIcons(root=document){root.querySelectorAll('[data-icon]').forEach(el=>{if(!el.querySelector('svg'))el.innerHTML=`<svg viewBox="0 0 24 24" aria-hidden="true">${iconPaths[el.dataset.icon]||''}</svg>`})}
const escapeHtml = value => String(value ?? '').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const initials = name => String(name||'?').split(/\s+/).slice(0,2).map(n=>n[0]).join('').toUpperCase();
const capitalize = value => String(value).replace(/^./,c=>c.toUpperCase());
const normalize = value => String(value||'').normalize('NFD').replace(/\p{Diacritic}/gu,'').toLowerCase().trim();
const roleLabel = role => ({AFILHADO:'Afilhado',PADRINHO:'Padrinho',ADMIN:'Administrador'}[role]||'');
const meetingLabels = {PROPOSTO:'Aguardando confirmação',CONFIRMADO:'Confirmado',CONCLUIDO:'Concluído',CANCELADO:'Cancelado'};

// Datas: os encontros chegam como LocalDateTime ("2026-10-25T14:00:00") e são interpretados no fuso do navegador.
const pad = n => String(n).padStart(2,'0');
const localDate = d => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const parseLocalDate = key => new Date(`${key}T00:00:00`);
const dateTime = value => new Intl.DateTimeFormat('pt-BR',{dateStyle:'medium',timeStyle:'short'}).format(new Date(value));
const timeOf = d => d.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});
const longDate = d => capitalize(new Intl.DateTimeFormat('pt-BR',{weekday:'long',day:'numeric',month:'long'}).format(d));
const meetingStart = m => new Date(m.startsAt);
const meetingEnd = m => new Date(meetingStart(m).getTime()+(m.durationMinutes||45)*60000);
const utcStamp = d => d.toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');
function relativeTime(value){const diff=(new Date(value)-Date.now())/1000;const rtf=new Intl.RelativeTimeFormat('pt-BR',{numeric:'auto'});for(const [unit,seconds] of [['year',31536000],['month',2592000],['week',604800],['day',86400],['hour',3600],['minute',60]])if(Math.abs(diff)>=seconds)return capitalize(rtf.format(Math.round(diff/seconds),unit));return 'Agora mesmo'}

async function api(path,options={}){
  const headers={'Content-Type':'application/json',...(options.headers||{})};
  if(state.token)headers.Authorization=`Bearer ${state.token}`;
  let response;
  try{response=await fetch(`${API_BASE}${path}`,{...options,headers})}catch{throw new Error('Não foi possível acessar a API. Inicie o backend na porta 8080.')}
  const body=response.status===204?null:await response.json().catch(()=>null);
  if(!response.ok){if(response.status===401&&state.token)logout();throw new Error(body?.error||(response.status===403?'Seu perfil não tem permissão para esta ação':`Erro ${response.status}`))}
  return body;
}

const canAccess = el => !el?.dataset.roles||Boolean(state.user&&el.dataset.roles.split(',').includes(state.user.role));
const homeView = () => state.user?.role==='ADMIN'?'admin':state.user?.role==='PADRINHO'?'solicitacoes':'inicio';

function view(id){
  const section=document.getElementById(id);
  if(!section?.classList.contains('view')||!canAccess(section)){if(state.user)toast('Esta área não está disponível para o seu perfil.');id=homeView()}
  document.querySelectorAll('.view').forEach(v=>v.classList.toggle('active',v.id===id));
  document.querySelectorAll('.nav-item[data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view===id));
  document.querySelector('.sidebar').classList.remove('open');closeModal();toggleNotifications(false);window.scrollTo({top:0,behavior:'smooth'});
  if(id==='admin')loadAdmin().catch(err=>toast(err.message));
}

const profileComplete = user => ['period','interests','availability','bio'].every(k=>String(user[k]||'').trim());

function setUser(user){
  state.user=user; document.getElementById('auth-screen').classList.add('hidden');
  const profile=document.querySelector('.profile-card'); profile.querySelector('.avatar').textContent=initials(user.name); profile.querySelector('strong').textContent=user.name; profile.querySelector('small').textContent=`${roleLabel(user.role)}${user.period?' · '+user.period:''}`;
  document.querySelector('.breadcrumb').innerHTML=`Olá, <strong>${escapeHtml(user.name.split(' ')[0])}!</strong>`;
  document.querySelectorAll('[data-roles]').forEach(el=>el.hidden=!canAccess(el));
  document.getElementById('profile-banner').hidden=user.role!=='AFILHADO'||profileComplete(user);
  populateProfile(user);
}

async function bootstrap(){
  renderIcons(); resetCalendar(); bindEvents();
  if(!state.token)return;
  try{const user=await api('/auth/me');await startSession(user)}catch(e){showAuthError('login',e.message)}
}

async function startSession(user){setUser(user);await loadData();view(homeView());clearInterval(state.syncTimer);state.syncTimer=setInterval(sync,SYNC_INTERVAL)}
function storeToken(token){state.token=token;localStorage.setItem('apadrinha_token',token)}
async function login(email,password){const data=await api('/auth/login',{method:'POST',body:JSON.stringify({email,password})});storeToken(data.token);await startSession(data.user)}
function logout(){clearInterval(state.syncTimer);Object.assign(state,{token:null,user:null,mentorships:[],meetings:[],questions:[],tips:[],pending:[],notifications:[],selectedDate:null});localStorage.removeItem('apadrinha_token');closeModal();toggleNotifications(false);resetCalendar();document.getElementById('auth-screen').classList.remove('hidden')}
function showAuthError(kind,message){document.getElementById(`${kind}-error`).textContent=message}
function sync(){if(state.token&&state.user&&!document.hidden)loadData().catch(()=>{})}

async function loadData(){
  const [mentorships,meetings,questions,tips]=await Promise.all([api('/mentorships'),api('/meetings'),api('/questions'),api('/tips')]);
  Object.assign(state,{mentorships,meetings,questions,tips,lastSync:new Date()});
  renderMentorships();renderAgenda();renderNextMeeting();renderQuestions();renderTips();renderActivity();
  if(state.user.role==='AFILHADO')renderMentors(await api('/mentors'));
  if(state.user.role==='ADMIN')await loadAdmin();
  renderNotifications();
}

function renderMentors(mentors){
  const grid=document.getElementById('mentor-grid');
  grid.innerHTML=mentors.map((m,i)=>`<article class="card mentor-card"><div class="mentor-person"><span class="avatar ${i%2?'avatar-orange':'avatar-purple'} large">${initials(m.name)}</span><div><h2>${escapeHtml(m.name)}</h2><p class="course">${escapeHtml(m.period||'Veterano ADS')}</p></div></div><p class="bio">${escapeHtml(m.bio||'Disponível para apoiar quem está começando.')}</p><div class="pills">${String(m.interests||'ADS').split(',').map(x=>`<span class="pill">${escapeHtml(x.trim())}</span>`).join('')}</div><div class="mentor-actions"><button class="outline" data-toast="${escapeHtml(m.availability||'Disponibilidade a combinar')}">Disponibilidade</button><button class="primary request-match" data-id="${m.id}" data-name="${escapeHtml(m.name)}">Pedir match</button></div></article>`).join('')||'<div class="card empty-state">Nenhum padrinho disponível no momento.</div>';
}

function renderMentorships(){
  const list=document.getElementById('request-list');if(!list)return;
  renderHomeMentor();
  if(state.user.role!=='PADRINHO'){list.innerHTML='';return}
  const actions=m=>m.status==='PENDENTE'?`<button class="outline mentorship-action" data-id="${m.id}" data-status="RECUSADO">Recusar</button><button class="primary mentorship-action" data-id="${m.id}" data-status="ATIVO">Aceitar</button>`:m.status==='ATIVO'?`<button class="outline" data-open-modal="encontro" data-mentorship="${m.id}">Agendar encontro</button>`:'';
  list.innerHTML=state.mentorships.map(m=>`<article class="card request-card"><span class="avatar avatar-green large">${initials(m.godchild.name)}</span><div><h2>${escapeHtml(m.godchild.name)}</h2><div class="request-meta"><span>${escapeHtml(m.godchild.period||'Ingressante')}</span><span class="badge ${m.status==='PENDENTE'?'yellow':'blue'}">${m.status}</span></div><p>${escapeHtml(m.godchild.interests||'Interesses ainda não informados')}</p></div><div class="request-actions">${actions(m)}</div></article>`).join('')||'<div class="card empty-state">Você ainda não possui solicitações ou acompanhamentos.</div>';
}

function renderHomeMentor(){
  if(state.user.role!=='AFILHADO')return;
  const active=state.mentorships.find(m=>m.status==='ATIVO');const card=document.querySelector('.mentor-summary');
  if(active){card.querySelector('h2').textContent=active.mentor.name;card.querySelector('.card-heading p:last-child').textContent=`${active.mentor.period||'Veterano ADS'} · ${active.mentor.interests||'ADS'}`;card.querySelector('.avatar').textContent=initials(active.mentor.name);card.querySelector('.mentor-footer span').textContent=active.mentor.bio||'Disponível para apoiar você.'}
  else{card.querySelector('h2').textContent='Encontre seu padrinho';card.querySelector('.card-heading p:last-child').textContent='Explore os perfis disponíveis';card.querySelector('.avatar').textContent='?';card.querySelector('.mentor-footer span').textContent='Seu vínculo ativo aparecerá aqui.'}
}

// Agenda --------------------------------------------------------------------
function counterpart(meeting){const m=state.mentorships.find(x=>x.id===meeting.mentorshipId);if(!m)return '';return state.user.role==='PADRINHO'?m.godchild.name:m.mentor.name}
const upcomingMeetings = () => state.meetings.filter(m=>['PROPOSTO','CONFIRMADO'].includes(m.status)&&meetingEnd(m)>=new Date()).sort((a,b)=>meetingStart(a)-meetingStart(b));
function resetCalendar(){const now=new Date();state.calendar={year:now.getFullYear(),month:now.getMonth()};state.selectedDate=null}
function renderAgenda(){if(state.user){renderCalendar();renderSchedule()}}

function renderCalendar(){
  const {year,month}=state.calendar;const first=new Date(year,month,1);const today=localDate(new Date());
  const busy=new Set(state.meetings.filter(m=>m.status!=='CANCELADO').map(m=>localDate(meetingStart(m))));
  document.getElementById('calendar-title').textContent=capitalize(new Intl.DateTimeFormat('pt-BR',{month:'long',year:'numeric'}).format(first));
  const days=[];
  for(let i=0;i<42;i++){const d=new Date(year,month,1-first.getDay()+i);const key=localDate(d);const classes=['day',d.getMonth()!==month&&'muted-day',key===today&&'is-today',key===state.selectedDate&&'selected',busy.has(key)&&'has-event'].filter(Boolean).join(' ');days.push(`<button type="button" class="${classes}" data-date="${key}" aria-label="${escapeHtml(longDate(d))}${busy.has(key)?', possui encontro':''}"${key===state.selectedDate?' aria-pressed="true"':''}><span>${d.getDate()}</span>${busy.has(key)?'<i></i>':''}</button>`)}
  document.getElementById('calendar-days').innerHTML=days.join('');
  document.getElementById('calendar-sync').textContent=state.lastSync?`Sincronizado às ${timeOf(state.lastSync)} · atualização automática a cada minuto`:'';
}

function meetingActions(m){
  const role=state.user.role,future=meetingStart(m)>new Date(),actions=[];
  const button=(status,label,extra='')=>`<button class="text-button meeting-action ${extra}" data-id="${m.id}" data-status="${status}">${label}</button>`;
  if(role==='AFILHADO'&&m.status==='PROPOSTO'&&future)actions.push(button('CONFIRMADO','Confirmar presença'),button('CANCELADO','Recusar','danger'));
  if(role==='AFILHADO'&&m.status==='CONFIRMADO'&&future)actions.push(button('CANCELADO','Cancelar presença','danger'));
  if(role==='PADRINHO'&&['PROPOSTO','CONFIRMADO'].includes(m.status)&&future)actions.push(button('CANCELADO','Cancelar encontro','danger'));
  if(role==='PADRINHO'&&m.status==='CONFIRMADO'&&!future)actions.push(button('CONCLUIDO','Marcar como concluído'));
  if(['PROPOSTO','CONFIRMADO'].includes(m.status)&&meetingEnd(m)>=new Date())actions.push(`<a class="text-button" href="${googleCalendarLink(m)}" target="_blank" rel="noopener">Google Agenda</a>`,`<button class="text-button" data-ics="${m.id}">Baixar .ics</button>`);
  return actions.length?`<div class="event-actions">${actions.join('')}</div>`:'';
}

function renderSchedule(){
  const schedule=document.getElementById('schedule');const selected=state.selectedDate;
  // o problema e que essa linha de codigo pega ate os horaros cancelados;
  //const meetings=selected?state.meetings.filter(m=>localDate(meetingStart(m))===selected).sort((a,b)=>meetingStart(a)-meetingStart(b)):upcomingMeetings();
  //agora eu escondo os cancelados e concluidos;
  const meetings=selected?state.meetings.filter(m=>localDate(meetingStart(m))===selected&&m.status!=='CANCELADO'&&m.status!=='CONCLUIDO').sort((a,b)=>meetingStart(a)-meetingStart(b)):upcomingMeetings();
  const empty=selected?'Nenhum encontro neste dia.':state.user.role==='PADRINHO'?'Nenhum encontro agendado. Use “Novo encontro” para convidar seu afilhado.':'Nenhum encontro agendado. Seu padrinho enviará um convite por aqui.';
  schedule.innerHTML=`<p class="eyebrow">${selected?escapeHtml(longDate(parseLocalDate(selected)).toUpperCase()):'SEUS COMPROMISSOS'}</p><h2>${selected?'Encontros do dia':'Próximos encontros'}</h2>${selected?'<button class="text-button" data-clear-date>Ver todos os próximos encontros <i data-icon="arrow"></i></button>':''}`+(meetings.length?meetings.map(m=>{const start=meetingStart(m),who=counterpart(m);return `<article class="event${['CANCELADO','CONCLUIDO'].includes(m.status)?' muted-event':''}"><span class="time">${timeOf(start)}</span><div><span class="event-type">${escapeHtml(meetingLabels[m.status]||m.status).toUpperCase()}</span><h3>${escapeHtml(m.title)}</h3><p>${escapeHtml(longDate(start))} · ${timeOf(start)}–${timeOf(meetingEnd(m))}${who?` · com ${escapeHtml(who)}`:''} · ${escapeHtml(m.format||'A combinar')}</p>${meetingActions(m)}</div></article>`}).join(''):`<div class="card empty-state">${empty}</div>`);
  renderIcons(schedule);
}

function renderNextMeeting(){
  const card=document.getElementById('next-meeting');const next=upcomingMeetings()[0];
  if(!next)card.innerHTML=`<p class="eyebrow">PRÓXIMO ENCONTRO</p><div><h2>Nenhum encontro agendado</h2><p>${state.user.role==='PADRINHO'?'Agende um encontro com seu afilhado.':'Quando seu padrinho agendar um encontro, ele aparecerá aqui.'}</p><button class="text-button" data-view="agenda">Abrir agenda <i data-icon="arrow"></i></button></div>`;
  else{const start=meetingStart(next);card.innerHTML=`<p class="eyebrow">PRÓXIMO ENCONTRO</p><span class="calendar-chip"><strong>${start.getDate()}</strong><small>${new Intl.DateTimeFormat('pt-BR',{month:'short'}).format(start).replace('.','').toUpperCase()}</small></span><div><h2>${escapeHtml(next.title)}</h2><p><i data-icon="clock"></i> ${capitalize(start.toLocaleDateString('pt-BR',{weekday:'long'}))} · ${timeOf(start)} — ${timeOf(meetingEnd(next))}</p><button class="text-button" data-view="agenda" data-date="${localDate(start)}">Ver detalhes <i data-icon="arrow"></i></button></div>`}
  renderIcons(card);
}

function selectDate(key){const d=parseLocalDate(key);state.selectedDate=key;state.calendar={year:d.getFullYear(),month:d.getMonth()};renderAgenda()}

function googleCalendarLink(m){const params=new URLSearchParams({action:'TEMPLATE',text:m.title,dates:`${utcStamp(meetingStart(m))}/${utcStamp(meetingEnd(m))}`,details:`Encontro de apadrinhamento ADS IFPE${counterpart(m)?' com '+counterpart(m):''}.`,location:m.format||''});return `https://calendar.google.com/calendar/render?${params}`}
const icsText = value => String(value||'').replace(/[\\;,]/g,c=>'\\'+c).replace(/\r?\n/g,'\\n');
function downloadIcs(meetings,filename){
  if(!meetings.length){toast('Não há encontros futuros para exportar.');return}
  const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Apadrinhamento ADS IFPE//Agenda//PT-BR','CALSCALE:GREGORIAN','METHOD:PUBLISH'];
  meetings.forEach(m=>lines.push('BEGIN:VEVENT',`UID:encontro-${m.id}@apadrinhamento-ads-ifpe`,`DTSTAMP:${utcStamp(new Date())}`,`DTSTART:${utcStamp(meetingStart(m))}`,`DTEND:${utcStamp(meetingEnd(m))}`,`SUMMARY:${icsText(m.title)}`,`DESCRIPTION:${icsText(`Encontro de apadrinhamento${counterpart(m)?' com '+counterpart(m):''}`)}`,`LOCATION:${icsText(m.format)}`,`STATUS:${m.status==='CONFIRMADO'?'CONFIRMED':'TENTATIVE'}`,'END:VEVENT'));
  lines.push('END:VCALENDAR');
  const link=document.createElement('a');link.href=URL.createObjectURL(new Blob([lines.join('\r\n')],{type:'text/calendar;charset=utf-8'}));link.download=filename;link.click();setTimeout(()=>URL.revokeObjectURL(link.href),1000);
}

// Fórum e mural -------------------------------------------------------------
function renderQuestions(){
  const list=document.getElementById('topic-list');const term=normalize(document.getElementById('forum-search').value);
  document.querySelectorAll('[data-forum-filter]').forEach(b=>b.classList.toggle('active',term&&normalize(b.dataset.forumFilter)===term));
  const questions=state.questions.filter(q=>!term||normalize(`${q.title} ${q.content} ${q.category} ${q.author.name}`).includes(term));
  list.innerHTML=questions.map((q,i)=>`<article class="topic"><div class="topic-top"><span class="avatar ${i%2?'avatar-orange':'avatar-green'}">${initials(q.author.name)}</span><div><h2><button data-topic="${q.id}">${escapeHtml(q.title)}</button></h2><span class="pill">${escapeHtml(q.category)}</span></div></div><p>${escapeHtml(q.content)}</p><div class="topic-meta"><div><button class="text-button" data-topic="${q.id}">Ver discussão (${q.answerCount} ${q.answerCount===1?'resposta':'respostas'})</button><button class="text-button" data-answer="${q.id}">Responder</button></div><span>${escapeHtml(q.author.name)} · ${dateTime(q.createdAt)}</span></div></article>`).join('')||`<div class="card empty-state">${term?`Nenhum tópico encontrado para “${escapeHtml(document.getElementById('forum-search').value)}”.`:'Ainda não há perguntas. Que tal abrir a primeira discussão?'}</div>`;
}

async function openTopic(questionId){
  const q=state.questions.find(x=>x.id===Number(questionId));if(!q){toast('Tópico não encontrado.');return}
  const answers=await api(`/questions/${q.id}/answers`);
  showModal(`<p class="eyebrow">${escapeHtml(q.category).toUpperCase()}</p><h2>${escapeHtml(q.title)}</h2><p>Por ${escapeHtml(q.author.name)} · ${dateTime(q.createdAt)}</p><p class="topic-body">${escapeHtml(q.content)}</p><h3>${answers.length} ${answers.length===1?'resposta':'respostas'}</h3><div class="answer-list">${answers.map(a=>`<article class="answer"><span class="avatar avatar-green">${initials(a.author.name)}</span><div><strong>${escapeHtml(a.author.name)}</strong> <small>${roleLabel(a.author.role)} · ${relativeTime(a.createdAt)}</small><p>${escapeHtml(a.content)}</p></div></article>`).join('')||'<p>Ninguém respondeu ainda. Seja o primeiro!</p>'}</div><form data-modal-form="resposta"><input type="hidden" name="questionId" value="${q.id}"><label>Sua resposta<textarea name="content" required maxlength="3000" placeholder="Compartilhe uma resposta respeitosa e objetiva"></textarea></label><button class="primary">Publicar resposta</button></form>`,true);
}

function renderTips(){
  const grid=document.getElementById('mural-grid');const emojis=['🗺️','📚','💼','💡'];
  grid.innerHTML=state.tips.map((t,i)=>`<article class="card tip-card"><span class="tip-icon">${emojis[i%emojis.length]}</span><h2>${escapeHtml(t.title)}</h2><p>${escapeHtml(t.content)}</p><footer><span>Por ${escapeHtml(t.author.name)}</span><span>${escapeHtml(t.category||'Dica')}</span></footer></article>`).join('')||`<div class="card empty-state">${state.user.role==='PADRINHO'?'Ainda não há dicas. Compartilhe a primeira!':'Ainda não há dicas. Em breve os padrinhos publicarão novidades por aqui.'}</div>`;
}

function renderActivity(){
  const items=[...state.questions.map(q=>({icon:'message',color:'green',title:q.author.id===state.user.id?'Você publicou uma pergunta':`Nova pergunta de ${q.author.name}`,text:q.title,date:q.createdAt})),...state.tips.map(t=>({icon:'book',color:'orange',title:'Nova dica no mural',text:t.title,date:t.createdAt}))].sort((a,b)=>new Date(b.date)-new Date(a.date)).slice(0,4);
  document.getElementById('activity-list').innerHTML=items.map(a=>`<div class="activity-row"><span class="activity-icon ${a.color}"><i data-icon="${a.icon}"></i></span><div><strong>${escapeHtml(a.title)}</strong><p>${escapeHtml(a.text)}</p><small>${relativeTime(a.date)}</small></div></div>`).join('')||'<p>Nenhuma atividade recente.</p>';
  renderIcons(document.getElementById('activity-list'));
}

// Notificações ----------------------------------------------------------------
const readKey = () => `apadrinha_lidas_${state.user.id}`;
const readIds = () => new Set(JSON.parse(localStorage.getItem(readKey())||'[]'));
function markRead(ids){const read=readIds();ids.forEach(id=>read.add(id));localStorage.setItem(readKey(),JSON.stringify([...read].slice(-300)))}

function buildNotifications(){
  const u=state.user,list=[],now=new Date();
  if(u.role==='PADRINHO')state.mentorships.filter(m=>m.status==='PENDENTE').forEach(m=>list.push({id:`mentorship-${m.id}-PENDENTE`,icon:'heart',title:`Nova solicitação de ${m.godchild.name}`,text:'Avalie o pedido de apadrinhamento.',view:'solicitacoes'}));
  if(u.role==='AFILHADO')state.mentorships.filter(m=>m.status!=='PENDENTE').forEach(m=>list.push({id:`mentorship-${m.id}-${m.status}`,icon:'users',title:{ATIVO:`${m.mentor.name} aceitou sua solicitação`,RECUSADO:`${m.mentor.name} recusou sua solicitação`,ENCERRADO:`Vínculo com ${m.mentor.name} encerrado`}[m.status],text:m.status==='RECUSADO'?'Você pode procurar outro padrinho.':'Acompanhe seu apadrinhamento.',view:m.status==='RECUSADO'?'encontrar':'inicio'}));
  state.meetings.filter(m=>meetingEnd(m)>=now).forEach(m=>{
    const when=`${longDate(meetingStart(m))} · ${timeOf(meetingStart(m))}`,date=localDate(meetingStart(m));
    if(u.role==='AFILHADO'&&m.status==='PROPOSTO')list.push({id:`meeting-${m.id}-PROPOSTO`,icon:'calendar',title:`Convite para encontro: ${m.title}`,text:`${when} · confirme sua presença`,view:'agenda',date});
    if(u.role==='PADRINHO'&&m.status==='CONFIRMADO')list.push({id:`meeting-${m.id}-CONFIRMADO`,icon:'check',title:`${counterpart(m)||'Seu afilhado'} confirmou o encontro`,text:`${m.title} · ${when}`,view:'agenda',date});
    if(m.status==='CANCELADO')list.push({id:`meeting-${m.id}-CANCELADO`,icon:'x',title:`Encontro cancelado: ${m.title}`,text:when,view:'agenda',date});
    if(m.status==='CONFIRMADO'&&meetingStart(m)-now<=86400000)list.push({id:`meeting-${m.id}-lembrete`,icon:'clock',title:`Lembrete: ${m.title}`,text:`Começa ${relativeTime(m.startsAt).toLowerCase()}`,view:'agenda',date});
  });
  state.questions.filter(q=>q.author.id===u.id&&q.answerCount>0).forEach(q=>list.push({id:`question-${q.id}-${q.answerCount}`,icon:'message',title:`Sua pergunta recebeu ${q.answerCount} ${q.answerCount===1?'resposta':'respostas'}`,text:q.title,topic:q.id}));
  state.tips.filter(t=>t.author.id!==u.id&&now-new Date(t.createdAt)<=7*86400000).forEach(t=>list.push({id:`tip-${t.id}`,icon:'book',title:'Nova dica no mural',text:t.title,view:'mural'}));
  if(u.role==='ADMIN')state.pending.forEach(m=>list.push({id:`admin-pending-${m.id}`,icon:'heart',title:'Solicitação aguardando ação',text:`${m.godchild.name} → ${m.mentor.name}`,view:'admin'}));
  return list;
}

function renderNotifications(){
  if(!state.user)return;
  state.notifications=buildNotifications();const read=readIds();const unread=state.notifications.filter(n=>!read.has(n.id)).length;
  const badge=document.querySelector('#notifications-button b');badge.hidden=!unread;badge.textContent=unread>9?'9+':unread;
  document.getElementById('notifications-button').setAttribute('aria-label',unread?`Notificações: ${unread} não lida(s)`:'Notificações');
  const list=document.getElementById('notifications-list');
  list.innerHTML=state.notifications.map(n=>`<button class="notification-item${read.has(n.id)?'':' unread'}" data-notification="${escapeHtml(n.id)}"><span class="activity-icon green"><i data-icon="${n.icon}"></i></span><span><strong>${escapeHtml(n.title)}</strong><p>${escapeHtml(n.text)}</p></span></button>`).join('')||'<p class="notifications-empty">Você está em dia! Nenhuma notificação por enquanto.</p>';
  renderIcons(list);
}

function toggleNotifications(open){const panel=document.getElementById('notifications-panel');const show=open??panel.hidden;panel.hidden=!show;document.getElementById('notifications-button').setAttribute('aria-expanded',String(show))}

function openNotification(id){
  const n=state.notifications.find(x=>x.id===id);if(!n)return;
  markRead([id]);renderNotifications();toggleNotifications(false);
  if(n.topic){view('forum');openTopic(n.topic).catch(err=>toast(err.message));return}
  view(n.view);if(n.date)selectDate(n.date);
}

// Administração e perfil ------------------------------------------------------
async function loadAdmin(){
  if(state.user?.role!=='ADMIN')return;
  const [indicators,pending]=await Promise.all([api('/admin/indicators'),api('/admin/pending')]);state.pending=pending;
  const values=[indicators.afilhados,indicators.vinculosAtivos,indicators.perguntas,indicators.aguardandoMatch];document.querySelectorAll('.metrics .metric strong').forEach((el,i)=>el.textContent=String(values[i]??0).padStart(2,'0'));
  const table=document.querySelector('#admin .table');table.innerHTML='<div class="table-row table-head"><span>ESTUDANTE</span><span>PADRINHO</span><span>SITUAÇÃO</span><span></span></div>'+pending.map(m=>`<div class="table-row"><strong>${escapeHtml(m.godchild.name)}</strong><span>${escapeHtml(m.mentor.name)}</span><span class="badge yellow">${m.status}</span><button class="small-button admin-match" data-id="${m.id}">Ativar</button></div>`).join('');
}

function populateProfile(user){
  const form=document.getElementById('profile-form');const fields=form.querySelectorAll('input,select');fields[0].value=user.name||'';fields[1].value=user.period||'1º período';fields[2].value=user.interests||'';fields[3].value=user.availability||'Tardes durante a semana';form.querySelector('textarea').value=user.bio||'';
  form.querySelector('.profile-head h2').textContent=user.name;form.querySelector('.profile-head p').textContent=user.email;form.querySelector('.profile-avatar').textContent=initials(user.name);
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
function setFieldError(form,name,message){const input=form.querySelector(`[name="${name}"]`);const slot=form.querySelector(`[data-error-for="${name}"]`);if(slot)slot.textContent=message||'';if(input){if(message)input.setAttribute('aria-invalid','true');else input.removeAttribute('aria-invalid')}}

async function register(form){
  showAuthError('register','');const d=Object.fromEntries(new FormData(form));const errors=validateRegister(d);
  ['name','email','password','confirmPassword'].forEach(f=>setFieldError(form,f,errors[f]));
  const firstInvalid=Object.keys(errors)[0];if(firstInvalid){form.querySelector(`[name="${firstInvalid}"]`).focus();return}
  const result=await api('/auth/register',{method:'POST',body:JSON.stringify({name:d.name.trim(),email:d.email.trim().toLowerCase(),password:d.password,role:d.role})});
  storeToken(result.token);form.reset();await startSession(result.user);
}

// Modais ----------------------------------------------------------------------
function showModal(html,wide=false){const modal=document.getElementById('modal');modal.querySelector('.modal').classList.toggle('modal-wide',wide);document.getElementById('modal-content').innerHTML=html;renderIcons(modal);modal.classList.add('open');modal.querySelector('input:not([type=hidden]),textarea,select')?.focus()}
function closeModal(){document.getElementById('modal').classList.remove('open')}

function helpContent(){
  const role=state.user?.role;
  const items=[['Como funciona o apadrinhamento?','Afilhados (ingressantes) escolhem um padrinho (veterano) em “Encontrar padrinho”. Depois que o padrinho aceita, o vínculo fica ativo e vocês passam a combinar encontros pela agenda.'],['Quem pode agendar encontros?','Somente o padrinho agenda encontros. O afilhado recebe o convite na agenda e nas notificações e pode confirmar ou recusar a presença.'],['Como levo os encontros para meu calendário?','Na Agenda, use “Google Agenda” em cada encontro ou “Exportar agenda (.ics)” para importar todos os próximos encontros no Google Agenda, Outlook ou calendário do celular. A agenda da plataforma é atualizada automaticamente a cada minuto.'],['Como uso o fórum?','Qualquer participante pode abrir uma pergunta, buscar tópicos e responder. Clique no título de um tópico para ver todas as respostas.'],['Quem publica no mural de dicas?','As dicas são compartilhadas pelos padrinhos. Afilhados podem ler todas as dicas publicadas.'],['O que aparece nas notificações?','Solicitações de apadrinhamento, convites e confirmações de encontros, lembretes, respostas às suas perguntas e novas dicas no mural.']];
  if(role==='AFILHADO')items.unshift(['Por que completar meu perfil?','Período, interesses, disponibilidade e expectativas ajudam o padrinho a entender como apoiar você. O aviso da página inicial some assim que o perfil estiver completo.']);
  if(role==='ADMIN')items.push(['O que posso fazer na Administração?','Acompanhar indicadores da comunidade e ativar solicitações de apadrinhamento pendentes.']);
  return `<h2>Central de ajuda</h2><p>Respostas rápidas sobre o uso da plataforma${role?` para o perfil ${roleLabel(role).toLowerCase()}`:''}.</p><div class="help-list">${items.map(([q,a],i)=>`<details${i===0?' open':''}><summary>${q}</summary><p>${a}</p></details>`).join('')}</div><p>Não encontrou o que procurava? Pergunte à comunidade ou procure a coordenação do curso de ADS.</p><div class="help-actions"><button class="primary" data-open-modal="pergunta"><i data-icon="message"></i>Perguntar no fórum</button><button class="outline modal-close-button">Fechar</button></div>`;
}

function modal(kind,context={}){
  let html='';
  // if(kind==='encontro'){
  //   const active=state.mentorships.filter(m=>m.status==='ATIVO');
  //   if(state.user.role!=='PADRINHO')html='<h2>Agendamento restrito</h2><p>Somente padrinhos podem agendar encontros. Quando seu padrinho enviar um convite, ele aparecerá na agenda e nas notificações para você confirmar.</p>';
  //   else if(!active.length)html='<h2>Agendar encontro</h2><p>Você precisa ter ao menos um afilhado com vínculo ativo para agendar um encontro.</p><button class="primary" data-view="solicitacoes">Ver solicitações</button>';
  //   else{const tomorrow=new Date(Date.now()+86400000);html=`<h2>Agendar encontro</h2><p>Proponha um horário; seu afilhado receberá o convite para confirmar.</p><form data-modal-form="encontro"><label>Afilhado<select name="mentorshipId" required>${active.map(m=>`<option value="${m.id}"${String(m.id)===String(context.mentorship)?' selected':''}>${escapeHtml(m.godchild.name)}</option>`).join('')}</select></label><label>Data<input name="date" type="date" min="${localDate(new Date())}" value="${state.selectedDate&&state.selectedDate>=localDate(new Date())?state.selectedDate:localDate(tomorrow)}" required></label><label>Horário<input name="time" type="time" value="14:00" required></label><label>Duração<select name="durationMinutes"><option value="30">30 minutos</option><option value="45" selected>45 minutos</option><option value="60">1 hora</option><option value="90">1h30</option></select></label><label>Assunto<input name="title" placeholder="Ex.: dúvidas sobre Lógica" required maxlength="255"></label><label>Formato<select name="format"><option>Videochamada</option><option>Presencial</option></select></label><button class="primary">Enviar convite</button></form>`}
  // }
  if(kind==='encontro'){
    const active=state.mentorships.filter(m=>m.status==='ATIVO');
    if(state.user.role!=='PADRINHO'){
        html='<h2>Agendamento restrito</h2><p>Somente padrinhos podem agendar encontros. Quando seu padrinho enviar um convite, ele aparecerá na agenda e nas notificações para você confirmar.</p>';
    }
    else if(!active.length){
        html='<h2>Agendar encontro</h2><p>Você precisa ter ao menos um afilhado com vínculo ativo para agendar um encontro.</p><button class="primary" data-view="solicitacoes">Ver solicitações</button>';
    }
    else{
        const tomorrow=new Date(Date.now()+86400000);
        html=`<h2>Agendar encontro</h2><p>Proponha um horário; seu afilhado receberá o convite para confirmar.</p>
        <form data-modal-form="encontro">
            <label>Afilhado<select name="mentorshipId" required>
                ${active.map(m=>`<option value="${m.id}"${String(m.id)===String(context.mentorship)?' selected':''}>${escapeHtml(m.godchild.name)}</option>`).join('')}
            </select></label>
            <label>Data<input name="date" type="date" min="${localDate(new Date())}" value="${state.selectedDate&&state.selectedDate>=localDate(new Date())?state.selectedDate:localDate(tomorrow)}" required></label>
            <label>Horário<input name="time" type="time" value="14:00" required></label>
            <label>Duração<select name="durationMinutes">
                <option value="30">30 minutos</option>
                <option value="45" selected>45 minutos</option>
                <option value="60">1 hora</option>
                <option value="90">1h30</option>
            </select></label>
            <label>Assunto<input name="title" placeholder="Ex.: dúvidas sobre Lógica" required maxlength="255"></label>
            <label>Formato<select name="format"><option>Videochamada</option><option>Presencial</option></select></label>
            <button class="primary">Enviar convite</button>
        </form>`;
    }
}
  if(kind==='pergunta')html='<h2>Fazer uma pergunta</h2><p>A comunidade está aqui para ajudar.</p><form data-modal-form="pergunta"><label>Título<input name="title" required maxlength="255"></label><label>Categoria<select name="category"><option>Lógica de programação</option><option>Rotina acadêmica</option><option>Professores e disciplinas</option><option>Provas e avaliações</option><option>Estágio</option><option>Carreira</option><option>Vida no campus</option><option>Organização</option></select></label><label>Detalhes<textarea name="content" required maxlength="3000"></textarea></label><button class="primary">Publicar pergunta</button></form>';
  if(kind==='dica')html=state.user.role==='PADRINHO'?'<h2>Compartilhar uma dica</h2><p>Ajude quem está começando agora.</p><form data-modal-form="dica"><label>Título<input name="title" required maxlength="255"></label><label>Categoria<input name="category" value="Experiência acadêmica" maxlength="255"></label><label>Conteúdo<textarea name="content" required maxlength="5000"></textarea></label><button class="primary">Enviar dica</button></form>':'<h2>Publicação restrita</h2><p>Somente padrinhos podem compartilhar dicas no mural. Você pode ler todas as dicas publicadas.</p>';
  if(kind==='resposta')html=`<h2>Responder pergunta</h2><p>Compartilhe uma resposta respeitosa e objetiva.</p><form data-modal-form="resposta"><input type="hidden" name="questionId" value="${context.questionId}"><label>Resposta<textarea name="content" required maxlength="3000"></textarea></label><button class="primary">Publicar resposta</button></form>`;
  if(kind==='avaliacao'){const active=state.mentorships.find(m=>m.status==='ATIVO');html=`<h2>Avaliar mentoria</h2><p>Seu feedback ajuda a melhorar o programa.</p><form data-modal-form="avaliacao"><input type="hidden" name="mentorshipId" value="${active?.id||''}"><label>Nota<select name="rating"><option value="5">5 — Excelente</option><option value="4">4 — Muito boa</option><option value="3">3 — Boa</option><option value="2">2 — Regular</option><option value="1">1 — Ruim</option></select></label><label>Comentário<textarea name="comment" required></textarea></label><button class="primary">Enviar avaliação</button></form>`}
  if(kind==='ajuda')html=helpContent();
  showModal(html);
}

// async function submitModal(form){
//   const data=Object.fromEntries(new FormData(form));const kind=form.dataset.modalForm;
//   if(kind==='encontro'){const startsAt=`${data.date}T${data.time}:00`;if(new Date(startsAt)<=new Date())throw new Error('Escolha uma data e horário no futuro');await api('/meetings',{method:'POST',body:JSON.stringify({mentorshipId:Number(data.mentorshipId),title:data.title,startsAt,durationMinutes:Number(data.durationMinutes),format:data.format})});state.selectedDate=data.date}
//   if(kind==='pergunta')await api('/questions',{method:'POST',body:JSON.stringify(data)});
//   if(kind==='dica')await api('/tips',{method:'POST',body:JSON.stringify(data)});
//   if(kind==='resposta')await api(`/questions/${data.questionId}/answers`,{method:'POST',body:JSON.stringify({content:data.content})});
//   if(kind==='avaliacao'){if(!data.mentorshipId)throw new Error('Você ainda não possui vínculo ativo');await api('/reviews',{method:'POST',body:JSON.stringify({mentorshipId:Number(data.mentorshipId),rating:Number(data.rating),comment:data.comment})});}
//   closeModal();toast(kind==='encontro'?'Convite enviado! O afilhado será notificado.':'Operação realizada com sucesso!');await loadData();
//   if(kind==='encontro'){const d=parseLocalDate(data.date);state.calendar={year:d.getFullYear(),month:d.getMonth()};renderAgenda()}
//   if(kind==='resposta')await openTopic(data.questionId);
// }
async function submitModal(form){
    const data=Object.fromEntries(new FormData(form));
    const kind=form.dataset.modalForm;

    if(kind==='encontro'){
        const startsAt=`${data.date}T${data.time}:00`;
        if(new Date(startsAt)<=new Date()) throw new Error('Escolha uma data e horário no futuro');
        await api('/meetings',{method:'POST',body:JSON.stringify({
            mentorshipId:Number(data.mentorshipId),
            title:data.title,
            startsAt,
            durationMinutes:Number(data.durationMinutes),
            format:data.format
        })});
        state.selectedDate=data.date;
    }
    if(kind==='pergunta') await api('/questions',{method:'POST',body:JSON.stringify(data)});
    if(kind==='dica') await api('/tips',{method:'POST',body:JSON.stringify(data)});
    if(kind==='resposta') await api(`/questions/${data.questionId}/answers`,{method:'POST',body:JSON.stringify({content:data.content})});
    if(kind==='avaliacao'){
        if(!data.mentorshipId) throw new Error('Você ainda não possui vínculo ativo');
        await api('/reviews',{method:'POST',body:JSON.stringify({
            mentorshipId:Number(data.mentorshipId),
            rating:Number(data.rating),
            comment:data.comment
        })});
    }

    closeModal();
    toast(kind==='encontro'?'Convite enviado! O afilhado será notificado.':'Operação realizada com sucesso!');
    await loadData();
    if(kind==='encontro'){
        const d=parseLocalDate(data.date);
        state.calendar={year:d.getFullYear(),month:d.getMonth()};
        renderAgenda();
    }
    if(kind==='resposta') await openTopic(data.questionId);
}

async function run(action,success){try{await action();if(success)toast(success);await loadData()}catch(err){toast(err.message)}}

function bindEvents(){
  document.getElementById('login-form').addEventListener('submit',async e=>{e.preventDefault();showAuthError('login','');const d=Object.fromEntries(new FormData(e.currentTarget));try{await login(d.email.trim(),d.password)}catch(err){showAuthError('login',err.message)}});
  const registerForm=document.getElementById('register-form');
  registerForm.addEventListener('submit',async e=>{e.preventDefault();try{await register(e.currentTarget)}catch(err){showAuthError('register',err.message)}});
  registerForm.addEventListener('input',e=>{if(e.target.getAttribute('aria-invalid')==='true'){const errors=validateRegister(Object.fromEntries(new FormData(registerForm)));setFieldError(registerForm,e.target.name,errors[e.target.name])}});
  document.getElementById('profile-form').addEventListener('submit',async e=>{e.preventDefault();const fields=e.currentTarget.querySelectorAll('input,select');try{const user=await api('/users/me',{method:'PUT',body:JSON.stringify({name:fields[0].value,period:fields[1].value,interests:fields[2].value,availability:fields[3].value,bio:e.currentTarget.querySelector('textarea').value})});setUser(user);toast(profileComplete(user)?'Perfil atualizado com sucesso!':'Perfil salvo. Preencha interesses e expectativas para completá-lo.')}catch(err){toast(err.message)}});
  document.getElementById('forum-search').addEventListener('input',renderQuestions);
  document.addEventListener('visibilitychange',sync);
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeModal();toggleNotifications(false)}});
  document.addEventListener('click',async e=>{
    const panelOpen=!document.getElementById('notifications-panel').hidden;
    if(panelOpen&&!e.target.closest('#notifications'))toggleNotifications(false);
    if(e.target.closest('#notifications-button')){toggleNotifications();return}
    if(e.target.closest('[data-notifications-read]')){markRead(state.notifications.map(n=>n.id));renderNotifications();return}
    const notification=e.target.closest('[data-notification]');if(notification){openNotification(notification.dataset.notification);return}
    if(e.target.closest('#help-button')){modal('ajuda');return}
    const target=e.target.closest('[data-view]');if(target){e.preventDefault();view(target.dataset.view);if(target.dataset.date&&state.user)selectDate(target.dataset.date)}
    if(e.target.closest('.mobile-menu'))document.querySelector('.sidebar').classList.toggle('open');
    if(e.target.closest('[data-logout]'))logout();
    const tab=e.target.closest('[data-auth-tab]');if(tab){document.querySelectorAll('[data-auth-tab]').forEach(b=>b.classList.toggle('active',b===tab));document.getElementById('login-form').classList.toggle('hidden',tab.dataset.authTab!=='login');document.getElementById('register-form').classList.toggle('hidden',tab.dataset.authTab!=='register')}
    const demo=e.target.closest('[data-demo]');if(demo){const [email,password]=demo.dataset.demo.split('|');document.querySelector('#login-form [name=email]').value=email;document.querySelector('#login-form [name=password]').value=password}
    const open=e.target.closest('[data-open-modal]');if(open)modal(open.dataset.openModal,{mentorship:open.dataset.mentorship});
    if(e.target.closest('.modal-close-button'))closeModal();
    const answer=e.target.closest('[data-answer]');if(answer)modal('resposta',{questionId:answer.dataset.answer});
    const topic=e.target.closest('[data-topic]');if(topic)openTopic(topic.dataset.topic).catch(err=>toast(err.message));
    const filter=e.target.closest('[data-forum-filter]');if(filter){const search=document.getElementById('forum-search');search.value=normalize(search.value)===normalize(filter.dataset.forumFilter)?'':filter.dataset.forumFilter;renderQuestions()}
    const nav=e.target.closest('[data-calendar]');if(nav){const step=Number(nav.dataset.calendar);if(step===0){resetCalendar();state.selectedDate=localDate(new Date())}else{const d=new Date(state.calendar.year,state.calendar.month+step,1);state.calendar={year:d.getFullYear(),month:d.getMonth()}}renderAgenda()}
    const day=e.target.closest('#calendar-days [data-date]');if(day){if(state.selectedDate===day.dataset.date){state.selectedDate=null;renderAgenda()}else selectDate(day.dataset.date)}
    if(e.target.closest('[data-clear-date]')){state.selectedDate=null;renderAgenda()}
    if(e.target.closest('[data-export-ics]'))downloadIcs(upcomingMeetings(),'agenda-apadrinhamento.ics');
    const ics=e.target.closest('[data-ics]');if(ics){const m=state.meetings.find(x=>x.id===Number(ics.dataset.ics));if(m)downloadIcs([m],`encontro-${m.id}.ics`)}
    if(e.target.closest('[data-toast]'))toast(e.target.closest('[data-toast]').dataset.toast);
    const match=e.target.closest('.request-match');if(match)await run(()=>api('/mentorships',{method:'POST',body:JSON.stringify({mentorId:Number(match.dataset.id)})}),`Solicitação enviada para ${match.dataset.name}!`);
    const mentorship=e.target.closest('.mentorship-action');if(mentorship)await run(()=>api(`/mentorships/${mentorship.dataset.id}`,{method:'PATCH',body:JSON.stringify({status:mentorship.dataset.status})}),'Vínculo atualizado!');
    const admin=e.target.closest('.admin-match');if(admin)await run(()=>api(`/mentorships/${admin.dataset.id}`,{method:'PATCH',body:JSON.stringify({status:'ATIVO'})}),'Vínculo ativado!');
    const meeting=e.target.closest('.meeting-action');if(meeting){const status=meeting.dataset.status;if(status==='CANCELADO'&&!confirm('Deseja realmente cancelar este encontro?'))return;await run(()=>api(`/meetings/${meeting.dataset.id}`,{method:'PATCH',body:JSON.stringify({status})}),{CONFIRMADO:'Presença confirmada!',CANCELADO:'Encontro cancelado.',CONCLUIDO:'Encontro concluído!'}[status])}
  });
  document.querySelectorAll('.checklist input').forEach(input=>input.addEventListener('change',()=>{input.parentElement.classList.toggle('checked',input.checked);const all=[...document.querySelectorAll('.checklist input')],done=all.filter(x=>x.checked).length;document.querySelector('.checklist .card-heading strong').textContent=`${done}/4`;document.querySelector('.progress span').style.width=`${done*25}%`}));
  const modalEl=document.getElementById('modal');modalEl.addEventListener('click',e=>{if(e.target===modalEl||e.target.closest('.modal-close'))closeModal()});modalEl.addEventListener('submit',async e=>{e.preventDefault();const button=e.target.querySelector('button.primary');if(button)button.disabled=true;try{await submitModal(e.target)}catch(err){toast(err.message)}finally{if(button)button.disabled=false}});
}

function toast(message){const t=document.getElementById('toast');t.textContent=message;t.classList.add('show');clearTimeout(window.toastTimer);window.toastTimer=setTimeout(()=>t.classList.remove('show'),3500)}
bootstrap();
