import { useState } from 'react';
import Icon from '../components/Icon';
import { useToast } from '../context/ToastContext';
import type { AgendaEvent, EventStatus } from '../types';
import {
  todayDate,
  todayIso,
  clampYear,
  initialEvents,
  emptyEventForm,
  typeMeta,
  formatDateLabel,
  isPast,
} from '../data/agenda';
import {
  AgendaCalendar,
  EventCard,
  StatusBadge,
  EventDetailModal,
  EventFormModal,
} from '../components/AgendaComponents';

export default function Agenda() {
  const { showToast } = useToast();

  const [events, setEvents] = useState<AgendaEvent[]>(initialEvents);
  const [viewYear, setViewYear] = useState(clampYear(todayDate.getFullYear()));
  const [viewMonth, setViewMonth] = useState(todayDate.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(todayIso);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState<'create' | 'edit' | null>(null);
  const [formData, setFormData] = useState<Omit<AgendaEvent, 'id'>>(emptyEventForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  const goToMonth = (delta: number) => {
    let m = viewMonth + delta;
    let y = viewYear;
    if (m < 0) { m = 11; y -= 1; }
    else if (m > 11) { m = 0; y += 1; }
    setViewYear(clampYear(y));
    setViewMonth(m);
  };

  const goToToday = () => {
    setViewYear(clampYear(todayDate.getFullYear()));
    setViewMonth(todayDate.getMonth());
    setSelectedDate(todayIso);
  };

  const upcoming = events.filter((e) => !isPast(e)).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  const nextEvent = upcoming[0];
  const aguardandoCount = events.filter((e) => e.status === 'aguardando' && !isPast(e)).length;
  const canceladosCount = events.filter((e) => e.status === 'cancelado').length;

  const reminders: { icon: string; color: string; text: string }[] = [];
  const hojeEvents = events.filter((e) => e.date === todayIso && e.status !== 'cancelado');
  if (hojeEvents.length > 0) reminders.push({ icon: 'clock', color: 'purple', text: `Você tem ${hojeEvents.length} compromisso(s) hoje.` });
  if (aguardandoCount > 0) reminders.push({ icon: 'bell', color: 'orange', text: `${aguardandoCount} encontro(s) aguardando confirmação.` });
  if (canceladosCount > 0) reminders.push({ icon: 'x', color: 'orange', text: `${canceladosCount} encontro(s) cancelado(s).` });

  const selectedDayEvents = selectedDate ? events.filter((e) => e.date === selectedDate) : [];
  const history = events.filter(isPast).sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time));
  const detailEvent = detailId ? events.find((e) => e.id === detailId) ?? null : null;

  const openCreateForm = (dateOverride?: string) => {
    setFormData({ ...emptyEventForm, date: dateOverride ?? selectedDate ?? todayIso });
    setEditingId(null);
    setFormOpen('create');
  };

  const openEditForm = (event: AgendaEvent) => {
    const { id, ...rest } = event;
    setFormData(rest);
    setEditingId(id);
    setFormOpen('edit');
    setDetailId(null);
  };

  const saveForm = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showToast('Dê um título/assunto para o encontro.');
      return;
    }
    if (editingId) {
      setEvents((prev) => prev.map((ev) => (ev.id === editingId ? { ...formData, id: editingId } : ev)));
      showToast('Encontro atualizado com sucesso!');
    } else {
      setEvents((prev) => [...prev, { ...formData, id: Date.now().toString() }]);
      showToast('Encontro criado com sucesso!');
    }
    setFormOpen(null);
  };

  const updateStatus = (id: string, status: EventStatus) => {
    setEvents((prev) => prev.map((ev) => (ev.id === id ? { ...ev, status } : ev)));
    setDetailId(null);
    showToast(status === 'concluido' ? 'Encontro marcado como concluído.' : 'Encontro cancelado.');
  };

  return (
    <section className="view active" id="agenda">
      <div className="page-heading">
        <div>
          <p className="eyebrow">AGENDA</p>
          <h1>Organize seus encontros.</h1>
          <p className="subtitle">Acompanhe e organize sua relação de apadrinhamento.</p>
        </div>
        <button className="primary" onClick={() => openCreateForm()}>
          <Icon name="plus" />
          Novo encontro
        </button>
      </div>

      <div className="metrics" style={{ marginBottom: 16 }}>
        <article className="metric">
          <span className="metric-icon purple"><Icon name="clock" /></span>
          <div>
            <p>PRÓXIMO ENCONTRO</p>
            <strong>{nextEvent ? nextEvent.time : '—'}</strong>
            <small>{nextEvent ? formatDateLabel(nextEvent.date) : 'Nenhum agendado'}</small>
          </div>
        </article>
        <article className="metric">
          <span className="metric-icon blue"><Icon name="calendar" /></span>
          <div>
            <p>ENCONTROS AGENDADOS</p>
            <strong>{upcoming.length}</strong>
          </div>
        </article>
        <article className="metric">
          <span className="metric-icon green"><Icon name="check" /></span>
          <div>
            <p>ENCONTROS CONCLUÍDOS</p>
            <strong>{events.filter((e) => e.status === 'concluido').length}</strong>
          </div>
        </article>
      </div>

      {reminders.length > 0 && (
        <section className="card activity" style={{ marginBottom: 20 }}>
          <div className="card-heading">
            <div>
              <p className="eyebrow">LEMBRETES</p>
              <h2>Fique de olho</h2>
            </div>
          </div>
          {reminders.map((r, i) => (
            <div className="activity-row" key={i}>
              <span className={`activity-icon ${r.color}`}><Icon name={r.icon} /></span>
              <div><strong>{r.text}</strong></div>
            </div>
          ))}
        </section>
      )}

      {nextEvent && (
        <article
          className="card"
          style={{ marginBottom: 20, borderLeft: `4px solid ${typeMeta[nextEvent.type].color}`, display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', cursor: 'pointer' }}
          onClick={() => setDetailId(nextEvent.id)}
        >
          <div>
            <p className="eyebrow">SEU PRÓXIMO ENCONTRO</p>
            <h2 style={{ margin: '2px 0 6px' }}>{nextEvent.title}</h2>
            <p style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '0 0 4px', fontSize: 13 }}>
              <Icon name="calendar" /> {formatDateLabel(nextEvent.date)} · {nextEvent.time}
            </p>
            {nextEvent.personName && (
              <p style={{ margin: '0 0 4px', fontSize: 13 }}>
                Com {nextEvent.personName} · {nextEvent.mode === 'virtual' ? 'Google Meet' : nextEvent.location || 'Presencial'}
              </p>
            )}
            <div style={{ marginTop: 10 }}><StatusBadge status={nextEvent.status} /></div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, justifyContent: 'center' }}>
            <button className="outline" onClick={(e) => { e.stopPropagation(); setDetailId(nextEvent.id); }}>
              Ver detalhes
            </button>
          </div>
        </article>
      )}

      <div className="agenda-layout">
        <AgendaCalendar
          events={events}
          viewYear={viewYear}
          viewMonth={viewMonth}
          selectedDate={selectedDate}
          onChangeMonth={goToMonth}
          onSetYear={setViewYear}
          onSetMonth={setViewMonth}
          onSelectDate={setSelectedDate}
          onGoToToday={goToToday}
        />

        <section className="schedule">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p className="eyebrow">{selectedDate ? formatDateLabel(selectedDate).toUpperCase() : 'SELECIONE UM DIA'}</p>
              <h2>Compromissos do dia</h2>
            </div>
            {selectedDate && (
              <button className="text-button" onClick={() => openCreateForm(selectedDate)}>
                <Icon name="plus" /> Adicionar
              </button>
            )}
          </div>
          {selectedDayEvents.length === 0 && (
            <p style={{ fontSize: 13, color: '#666' }}>Nenhum compromisso neste dia.</p>
          )}
          {selectedDayEvents.map((event) => (
            <EventCard key={event.id} event={event} onClick={() => setDetailId(event.id)} />
          ))}
        </section>
      </div>

      <section className="card" style={{ marginTop: 20 }}>
        <div className="card-heading">
          <div>
            <p className="eyebrow">HISTÓRICO</p>
            <h2>Encontros anteriores</h2>
          </div>
        </div>
        {history.length === 0 && <p style={{ fontSize: 13, color: '#666' }}>Nenhum encontro concluído ainda.</p>}
        {history.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            onClick={() => setDetailId(event.id)}
            showDateInsteadOfTime
            muted
          />
        ))}
      </section>

      {detailEvent && (
        <EventDetailModal
          event={detailEvent}
          onClose={() => setDetailId(null)}
          onEdit={openEditForm}
          onUpdateStatus={updateStatus}
          onJoinMeeting={() => showToast('Link do Google Meet copiado')}
        />
      )}

      {formOpen && (
        <EventFormModal
          formData={formData}
          isEditing={formOpen === 'edit'}
          onChange={setFormData}
          onClose={() => setFormOpen(null)}
          onSubmit={saveForm}
        />
      )}
    </section>
  );
}
