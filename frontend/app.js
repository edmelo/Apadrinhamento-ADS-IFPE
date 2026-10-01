const API_BASE = location.protocol === 'file:' ? 'http://localhost:8080/api' : '/api';
const state = { token: localStorage.getItem('apadrinha_token'), user: null, mentorships: [], meetings: [] };

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
const dateTime = value => new Intl.DateTimeFormat('pt-BR',{dateStyle:'medium',timeStyle:'short'}).format(new Date(value));

async function api(path,options={}){
  const headers={'Content-Type':'application/json',...(options.headers||{})};
  if(state.token)headers.Authorization=`Bearer ${state.token}`;
  let response;
  try{response=await fetch(`${API_BASE}${path}`,{...options,headers})}catch{throw new Error('Não foi possível acessar a API. Inicie o backend na porta 8080.')}
  const body=response.status===204?null:await response.json().catch(()=>null);
  if(!response.ok){if(response.status===401&&state.token)logout();throw new Error(body?.error||`Erro ${response.status}`)}
  return body;
}

function view(id){
  document.querySelectorAll('.view').forEach(v=>v.classList.toggle('active',v.id===id));
  document.querySelectorAll('.nav-item[data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view===id));
  document.querySelector('.sidebar').classList.remove('open'); window.scrollTo({top:0,behavior:'smooth'});
  if(id==='admin'&&state.user?.role==='ADMIN')loadAdmin();
}

function setUser(user){
  state.user=user; document.getElementById('auth-screen').classList.add('hidden');
  const profile=document.querySelector('.profile-card'); profile.querySelector('.avatar').textContent=initials(user.name); profile.querySelector('strong').textContent=user.name; profile.querySelector('small').textContent=`${user.role==='AFILHADO'?'Afilhado':user.role==='PADRINHO'?'Padrinho':'Administrador'}${user.period?' · '+user.period:''}`;
  document.querySelector('.breadcrumb').innerHTML=`Olá, <strong>${escapeHtml(user.name.split(' ')[0])}!</strong>`;
  const adminNav=document.querySelector('.nav-item[data-view="admin"]'); adminNav.hidden=user.role!=='ADMIN';
  const findNav=document.querySelector('.nav-item[data-view="encontrar"]'); findNav.hidden=user.role!=='AFILHADO';
  document.querySelectorAll('.role-nav').forEach(n=>n.classList.toggle('visible',n.dataset.role===user.role));
  populateProfile(user);
}

async function bootstrap(){
  renderIcons(); renderCalendar(); bindEvents();
  if(!state.token)return;
  try{const user=await api('/auth/me');setUser(user);await loadData();view(user.role==='ADMIN'?'admin':user.role==='PADRINHO'?'solicitacoes':'inicio')}catch(e){showAuthError('login',e.message)}
}

async function login(email,password){const data=await api('/auth/login',{method:'POST',body:JSON.stringify({email,password})});state.token=data.token;localStorage.setItem('apadrinha_token',data.token);setUser(data.user);await loadData();view(data.user.role==='ADMIN'?'admin':data.user.role==='PADRINHO'?'solicitacoes':'inicio')}
function logout(){state.token=null;state.user=null;state.mentorships=[];localStorage.removeItem('apadrinha_token');document.getElementById('auth-screen').classList.remove('hidden')}
function showAuthError(kind,message){document.getElementById(`${kind}-error`).textContent=message}

async function loadData(){
  const [mentorships,meetings,questions,tips]=await Promise.all([api('/mentorships'),api('/meetings'),api('/questions'),api('/tips')]);
  state.mentorships=mentorships;state.meetings=meetings;renderMentorships();renderMeetings(meetings);renderQuestions(questions);renderTips(tips);
  if(state.user.role==='AFILHADO')renderMentors(await api('/mentors'));
  if(state.user.role==='ADMIN')await loadAdmin();
}

function renderMentors(mentors){
  const grid=document.getElementById('mentor-grid');
  grid.innerHTML=mentors.map((m,i)=>`<article class="card mentor-card"><div class="mentor-person"><span class="avatar ${i%2?'avatar-orange':'avatar-purple'} large">${initials(m.name)}</span><div><h2>${escapeHtml(m.name)}</h2><p class="course">${escapeHtml(m.period||'Veterano ADS')}</p></div></div><p class="bio">${escapeHtml(m.bio||'Disponível para apoiar quem está começando.')}</p><div class="pills">${String(m.interests||'ADS').split(',').map(x=>`<span class="pill">${escapeHtml(x.trim())}</span>`).join('')}</div><div class="mentor-actions"><button class="outline" data-toast="${escapeHtml(m.availability||'Disponibilidade a combinar')}">Disponibilidade</button><button class="primary request-match" data-id="${m.id}" data-name="${escapeHtml(m.name)}">Pedir match</button></div></article>`).join('')||'<div class="card empty-state">Nenhum padrinho disponível no momento.</div>';
}

function renderMentorships(){
  const list=document.getElementById('request-list');if(!list)return;
  renderHomeMentor();
  if(state.user.role!=='PADRINHO'){list.innerHTML='';return}
  list.innerHTML=state.mentorships.map(m=>`<article class="card request-card"><span class="avatar avatar-green large">${initials(m.godchild.name)}</span><div><h2>${escapeHtml(m.godchild.name)}</h2><div class="request-meta"><span>${escapeHtml(m.godchild.period||'Ingressante')}</span><span class="badge ${m.status==='PENDENTE'?'yellow':'blue'}">${m.status}</span></div><p>${escapeHtml(m.godchild.interests||'Interesses ainda não informados')}</p></div><div class="request-actions">${m.status==='PENDENTE'?`<button class="outline mentorship-action" data-id="${m.id}" data-status="RECUSADO">Recusar</button><button class="primary mentorship-action" data-id="${m.id}" data-status="ATIVO">Aceitar</button>`:`<button class="outline" data-open-modal="encontro" data-mentorship="${m.id}">Agendar encontro</button>`}</div></article>`).join('')||'<div class="card empty-state">Você ainda não possui solicitações ou acompanhamentos.</div>';
}

function renderHomeMentor(){
  if(state.user.role!=='AFILHADO')return;
  const active=state.mentorships.find(m=>m.status==='ATIVO');const card=document.querySelector('.mentor-summary');
  if(active){card.querySelector('h2').textContent=active.mentor.name;card.querySelector('.card-heading p:last-child').textContent=`${active.mentor.period||'Veterano ADS'} · ${active.mentor.interests||'ADS'}`;card.querySelector('.avatar').textContent=initials(active.mentor.name);card.querySelector('.mentor-footer span').textContent=active.mentor.bio||'Disponível para apoiar você.'}
  else{card.querySelector('h2').textContent='Encontre seu padrinho';card.querySelector('.card-heading p:last-child').textContent='Explore os perfis disponíveis';card.querySelector('.avatar').textContent='?';card.querySelector('.mentor-footer span').textContent='Seu vínculo ativo aparecerá aqui.'}
}

function renderMeetings(meetings){
  const schedule=document.querySelector('.schedule');if(!schedule)return;
  schedule.innerHTML='<p class="eyebrow">SEUS COMPROMISSOS</p><h2>Próximos encontros</h2>'+((meetings.length?meetings.map(m=>`<article class="event"><span class="time">${new Date(m.startsAt).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}</span><div><span class="event-type">${m.status}</span><h3>${escapeHtml(m.title)}</h3><p>${dateTime(m.startsAt)} · ${escapeHtml(m.format)}</p>${m.status==='PROPOSTO'?`<button class="text-button meeting-action" data-id="${m.id}" data-status="CONFIRMADO">Confirmar encontro <i data-icon="arrow"></i></button>`:''}</div></article>`).join(''):'<div class="card empty-state">Nenhum encontro agendado.</div>'));
  renderIcons(schedule);
}

function renderQuestions(questions){
  const list=document.getElementById('topic-list');
  list.innerHTML=questions.map((q,i)=>`<article class="topic"><div class="topic-top"><span class="avatar ${i%2?'avatar-orange':'avatar-green'}">${initials(q.author.name)}</span><div><h2>${escapeHtml(q.title)}</h2><span class="pill">${escapeHtml(q.category)}</span></div></div><p>${escapeHtml(q.content)}</p><div class="topic-meta"><button class="text-button" data-answer="${q.id}">${q.answerCount} resposta(s) · responder</button><span>${dateTime(q.createdAt)}</span></div></article>`).join('')||'<div class="card empty-state">Ainda não há perguntas.</div>';
}

function renderTips(tips){
  const grid=document.getElementById('mural-grid');const emojis=['🗺️','📚','💼','💡'];
  grid.innerHTML=tips.map((t,i)=>`<article class="card tip-card"><span class="tip-icon">${emojis[i%emojis.length]}</span><h2>${escapeHtml(t.title)}</h2><p>${escapeHtml(t.content)}</p><footer><span>Por ${escapeHtml(t.author.name)}</span><span>${escapeHtml(t.category||'Dica')}</span></footer></article>`).join('')||'<div class="card empty-state">Ainda não há dicas.</div>';
}

async function loadAdmin(){
  const [indicators,pending]=await Promise.all([api('/admin/indicators'),api('/admin/pending')]);
  const values=[indicators.afilhados,indicators.vinculosAtivos,indicators.perguntas,indicators.aguardandoMatch];document.querySelectorAll('.metrics .metric strong').forEach((el,i)=>el.textContent=String(values[i]??0).padStart(2,'0'));
  const table=document.querySelector('#admin .table');table.innerHTML='<div class="table-row table-head"><span>ESTUDANTE</span><span>PADRINHO</span><span>SITUAÇÃO</span><span></span></div>'+pending.map(m=>`<div class="table-row"><strong>${escapeHtml(m.godchild.name)}</strong><span>${escapeHtml(m.mentor.name)}</span><span class="badge yellow">${m.status}</span><button class="small-button admin-match" data-id="${m.id}">Ativar</button></div>`).join('');
}

function populateProfile(user){
  const form=document.getElementById('profile-form');const fields=form.querySelectorAll('input,select');fields[0].value=user.name||'';fields[1].value=user.period||'1º período';fields[2].value=user.interests||'';fields[3].value=user.availability||'Tardes durante a semana';form.querySelector('textarea').value=user.bio||'';
  form.querySelector('.profile-head h2').textContent=user.name;form.querySelector('.profile-head p').textContent=user.email;form.querySelector('.profile-avatar').textContent=initials(user.name);
}

function renderCalendar(){const days=document.getElementById('calendar-days');let output=['26','27','28','29','30','31'];for(let n=1;n<=31;n++)output.push(String(n));for(let n=1;n<=5;n++)output.push(String(n));days.innerHTML=output.map((n,i)=>`<span class="${i<6||i>36?'muted-day ':''}${n==='26'&&i>5?'today has-event':''}" ${n==='26'&&i>5?'data-number="26"':''}>${n==='26'&&i>5?'':n}${n==='26'&&i>5?'<i></i>':''}</span>`).join('')}

function modal(kind,context={}){
  let html='';const active=state.mentorships.find(m=>m.status==='ATIVO');
  if(kind==='encontro'){const d=new Date(Date.now()+86400000*2);const date=d.toISOString().slice(0,10);html=`<h2>Agendar encontro</h2><p>Proponha um horário para a mentoria.</p><form data-modal-form="encontro"><input type="hidden" name="mentorshipId" value="${context.mentorship||active?.id||''}"><label>Data<input name="date" type="date" min="${new Date().toISOString().slice(0,10)}" value="${date}" required></label><label>Horário<input name="time" type="time" value="14:00" required></label><label>Assunto<input name="title" placeholder="Ex.: dúvidas sobre Lógica" required></label><label>Formato<select name="format"><option>Videochamada</option><option>Presencial</option></select></label><button class="primary">Enviar convite</button></form>`}
  if(kind==='pergunta')html='<h2>Fazer uma pergunta</h2><p>A comunidade está aqui para ajudar.</p><form data-modal-form="pergunta"><label>Título<input name="title" required></label><label>Categoria<select name="category"><option>Lógica de programação</option><option>Rotina acadêmica</option><option>Carreira</option></select></label><label>Detalhes<textarea name="content" required></textarea></label><button class="primary">Publicar pergunta</button></form>';
  if(kind==='dica')html='<h2>Compartilhar uma dica</h2><p>Ajude quem está começando agora.</p><form data-modal-form="dica"><label>Título<input name="title" required></label><label>Categoria<input name="category" value="Experiência acadêmica"></label><label>Conteúdo<textarea name="content" required></textarea></label><button class="primary">Enviar dica</button></form>';
  if(kind==='resposta')html=`<h2>Responder pergunta</h2><p>Compartilhe uma resposta respeitosa e objetiva.</p><form data-modal-form="resposta"><input type="hidden" name="questionId" value="${context.questionId}"><label>Resposta<textarea name="content" required></textarea></label><button class="primary">Publicar resposta</button></form>`;
  if(kind==='avaliacao')html=`<h2>Avaliar mentoria</h2><p>Seu feedback ajuda a melhorar o programa.</p><form data-modal-form="avaliacao"><input type="hidden" name="mentorshipId" value="${active?.id||''}"><label>Nota<select name="rating"><option value="5">5 — Excelente</option><option value="4">4 — Muito boa</option><option value="3">3 — Boa</option><option value="2">2 — Regular</option><option value="1">1 — Ruim</option></select></label><label>Comentário<textarea name="comment" required></textarea></label><button class="primary">Enviar avaliação</button></form>`;
  document.getElementById('modal-content').innerHTML=html;document.getElementById('modal').classList.add('open');
}

async function submitModal(form){
  const data=Object.fromEntries(new FormData(form));
  if(form.dataset.modalForm==='encontro'){if(!data.mentorshipId)throw new Error('É necessário possuir um vínculo ativo');await api('/meetings',{method:'POST',body:JSON.stringify({mentorshipId:Number(data.mentorshipId),title:data.title,startsAt:`${data.date}T${data.time}:00`,durationMinutes:45,format:data.format})});}
  if(form.dataset.modalForm==='pergunta')await api('/questions',{method:'POST',body:JSON.stringify(data)});
  if(form.dataset.modalForm==='dica')await api('/tips',{method:'POST',body:JSON.stringify(data)});
  if(form.dataset.modalForm==='resposta')await api(`/questions/${data.questionId}/answers`,{method:'POST',body:JSON.stringify({content:data.content})});
  if(form.dataset.modalForm==='avaliacao'){if(!data.mentorshipId)throw new Error('Você ainda não possui vínculo ativo');await api('/reviews',{method:'POST',body:JSON.stringify({mentorshipId:Number(data.mentorshipId),rating:Number(data.rating),comment:data.comment})});}
  document.getElementById('modal').classList.remove('open');toast('Operação realizada com sucesso!');await loadData();
}

function bindEvents(){
  document.getElementById('login-form').addEventListener('submit',async e=>{e.preventDefault();showAuthError('login','');const d=Object.fromEntries(new FormData(e.currentTarget));try{await login(d.email,d.password)}catch(err){showAuthError('login',err.message)}});
  document.getElementById('register-form').addEventListener('submit',async e=>{e.preventDefault();showAuthError('register','');const d=Object.fromEntries(new FormData(e.currentTarget));try{const result=await api('/auth/register',{method:'POST',body:JSON.stringify(d)});state.token=result.token;localStorage.setItem('apadrinha_token',result.token);setUser(result.user);await loadData();view(result.user.role==='PADRINHO'?'solicitacoes':'inicio')}catch(err){showAuthError('register',err.message)}});
  document.getElementById('profile-form').addEventListener('submit',async e=>{e.preventDefault();const fields=e.currentTarget.querySelectorAll('input,select');try{const user=await api('/users/me',{method:'PUT',body:JSON.stringify({name:fields[0].value,period:fields[1].value,interests:fields[2].value,availability:fields[3].value,bio:e.currentTarget.querySelector('textarea').value})});setUser(user);toast('Perfil atualizado com sucesso!')}catch(err){toast(err.message)}});
  document.addEventListener('click',async e=>{
    const target=e.target.closest('[data-view]');if(target){e.preventDefault();view(target.dataset.view)}
    if(e.target.closest('.mobile-menu'))document.querySelector('.sidebar').classList.toggle('open');
    if(e.target.closest('[data-logout]'))logout();
    const tab=e.target.closest('[data-auth-tab]');if(tab){document.querySelectorAll('[data-auth-tab]').forEach(b=>b.classList.toggle('active',b===tab));document.getElementById('login-form').classList.toggle('hidden',tab.dataset.authTab!=='login');document.getElementById('register-form').classList.toggle('hidden',tab.dataset.authTab!=='register')}
    const demo=e.target.closest('[data-demo]');if(demo){const [email,password]=demo.dataset.demo.split('|');document.querySelector('#login-form [name=email]').value=email;document.querySelector('#login-form [name=password]').value=password}
    const open=e.target.closest('[data-open-modal]');if(open)modal(open.dataset.openModal,{mentorship:open.dataset.mentorship});
    const answer=e.target.closest('[data-answer]');if(answer)modal('resposta',{questionId:answer.dataset.answer});
    if(e.target.closest('[data-toast]'))toast(e.target.closest('[data-toast]').dataset.toast);
    const match=e.target.closest('.request-match');if(match)try{await api('/mentorships',{method:'POST',body:JSON.stringify({mentorId:Number(match.dataset.id)})});toast(`Solicitação enviada para ${match.dataset.name}!`);state.mentorships=await api('/mentorships')}catch(err){toast(err.message)}
    const mentorship=e.target.closest('.mentorship-action');if(mentorship)try{await api(`/mentorships/${mentorship.dataset.id}`,{method:'PATCH',body:JSON.stringify({status:mentorship.dataset.status})});toast('Vínculo atualizado!');state.mentorships=await api('/mentorships');renderMentorships()}catch(err){toast(err.message)}
    const admin=e.target.closest('.admin-match');if(admin)try{await api(`/mentorships/${admin.dataset.id}`,{method:'PATCH',body:JSON.stringify({status:'ATIVO'})});toast('Vínculo ativado!');await loadAdmin()}catch(err){toast(err.message)}
    const meeting=e.target.closest('.meeting-action');if(meeting)try{await api(`/meetings/${meeting.dataset.id}`,{method:'PATCH',body:JSON.stringify({status:meeting.dataset.status})});toast('Encontro confirmado!');state.meetings=await api('/meetings');renderMeetings(state.meetings)}catch(err){toast(err.message)}
  });
  document.querySelectorAll('.checklist input').forEach(input=>input.addEventListener('change',()=>{input.parentElement.classList.toggle('checked',input.checked);const all=[...document.querySelectorAll('.checklist input')],done=all.filter(x=>x.checked).length;document.querySelector('.checklist .card-heading strong').textContent=`${done}/4`;document.querySelector('.progress span').style.width=`${done*25}%`}));
  const modalEl=document.getElementById('modal');modalEl.addEventListener('click',e=>{if(e.target===modalEl||e.target.closest('.modal-close'))modalEl.classList.remove('open')});modalEl.addEventListener('submit',async e=>{e.preventDefault();try{await submitModal(e.target)}catch(err){toast(err.message)}});
}

function toast(message){const t=document.getElementById('toast');t.textContent=message;t.classList.add('show');clearTimeout(window.toastTimer);window.toastTimer=setTimeout(()=>t.classList.remove('show'),3500)}
bootstrap();
