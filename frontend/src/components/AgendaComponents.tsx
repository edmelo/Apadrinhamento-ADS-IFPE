import { useMemo } from 'react';
import Icon from './Icon';
import type { AgendaEvent, EventType, EventStatus, EventMode } from '../types';
import {
  monthNames,
  typeMeta,
  statusMeta,
  clampYear,
  buildMonthGrid,
  formatDateLabel,
  isPast,
  MIN_YEAR,
  MAX_YEAR,
} from '../data/agenda';

/* StatusBadge */

interface StatusBadgeProps {
  status: EventStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const meta = statusMeta[status];
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700, color: meta.color }}>
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: meta.color }} />
      {meta.label.toUpperCase()}
    </span>
  );
}

/* EventCard */

interface EventCardProps {
  event: AgendaEvent;
  onClick: () => void;
  showDateInsteadOfTime?: boolean;
  muted?: boolean;
}

export function EventCard({ event, onClick, showDateInsteadOfTime, muted }: EventCardProps) {
  const meta = typeMeta[event.type];

  return (
    <article
      className={`event${muted ? ' muted-event' : ''}`}
      style={{ borderLeft: `3px solid ${meta.color}`, cursor: 'pointer' }}
      onClick={onClick}
    >
      <span className="time">{showDateInsteadOfTime ? formatDateLabel(event.date) : event.time}</span>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <span className="event-type" style={{ color: meta.color }}>
            {meta.label.toUpperCase()}
          </span>
          <StatusBadge status={event.status} />
        </div>
        <h3>{event.title}</h3>
        {event.personName && <p>Com {event.personName}</p>}
      </div>
    </article>
  );
}

/* AgendaCalendar */

interface AgendaCalendarProps {
  events: AgendaEvent[];
  viewYear: number;
  viewMonth: number;
  selectedDate: string | null;
  onChangeMonth: (delta: number) => void;
  onSetYear: (year: number) => void;
  onSetMonth: (monthIndex: number) => void;
  onSelectDate: (date: string) => void;
  onGoToToday: () => void;
}

export function AgendaCalendar({
  events,
  viewYear,
  viewMonth,
  selectedDate,
  onChangeMonth,
  onSetYear,
  onSetMonth,
  onSelectDate,
  onGoToToday,
}: AgendaCalendarProps) {
  const days = useMemo(() => buildMonthGrid(viewYear, viewMonth, events), [viewYear, viewMonth, events]);

  return (
    <section className="card calendar">
      <div className="calendar-head">
        <button className="icon-button" onClick={() => onChangeMonth(-1)}>‹</button>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
          <select
            value={viewMonth}
            onChange={(e) => onSetMonth(Number(e.target.value))}
            style={{ border: 'none', background: 'transparent', font: 'inherit', cursor: 'pointer' }}
          >
            {monthNames.map((m, i) => (
              <option key={m} value={i}>{m}</option>
            ))}
          </select>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <button
              type="button"
              className="icon-button"
              disabled={viewYear <= MIN_YEAR}
              onClick={() => onSetYear(clampYear(viewYear - 1))}
            >
              ‹
            </button>
            <span style={{ minWidth: 44, textAlign: 'center' }}>{viewYear}</span>
            <button
              type="button"
              className="icon-button"
              disabled={viewYear >= MAX_YEAR}
              onClick={() => onSetYear(clampYear(viewYear + 1))}
            >
              ›
            </button>
          </span>
        </h2>
        <button className="icon-button" onClick={() => onChangeMonth(1)}>›</button>
      </div>

      <button className="text-button" style={{ marginBottom: 8 }} onClick={onGoToToday}>
        Ir para hoje
      </button>

      <div className="weekdays">
        <span>DOM</span><span>SEG</span><span>TER</span><span>QUA</span><span>QUI</span><span>SEX</span><span>SÁB</span>
      </div>

      <div className="days">
        {days.map((d) => (
          <span
            key={d.key}
            onClick={() => d.date && onSelectDate(d.date)}
            className={`${d.muted ? 'muted-day ' : ''}${d.isToday ? 'today ' : ''}`}
            data-number={d.isToday ? d.label : undefined}
            style={{
              cursor: d.muted ? 'default' : 'pointer',
              outline: d.date === selectedDate && !d.muted ? '2px solid #2fa86a' : undefined,
              borderRadius: d.date === selectedDate && !d.muted ? 8 : undefined,
              position: 'relative',
            }}
          >
            {d.isToday ? '' : d.label}
            {d.events.length > 0 && (
              <span style={{ position: 'absolute', bottom: 3, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 2 }}>
                {d.events.slice(0, 3).map((e) => (
                  <span key={e.id} style={{ width: 4, height: 4, borderRadius: '50%', background: typeMeta[e.type].color }} />
                ))}
              </span>
            )}
          </span>
        ))}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 14, fontSize: 11 }}>
        {Object.entries(typeMeta).map(([key, meta]) => (
          <span key={key} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: meta.color }} />
            {meta.label}
          </span>
        ))}
      </div>
    </section>
  );
}

/* EventDetailModal */

interface EventDetailModalProps {
  event: AgendaEvent;
  onClose: () => void;
  onEdit: (event: AgendaEvent) => void;
  onUpdateStatus: (id: string, status: EventStatus) => void;
  onJoinMeeting: () => void;
}

export function EventDetailModal({ event, onClose, onEdit, onUpdateStatus, onJoinMeeting }: EventDetailModalProps) {
  const past = isPast(event);

  return (
    <div className="modal-backdrop open" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <section className="modal">
        <button className="modal-close" aria-label="Fechar" onClick={onClose}>
          <Icon name="x" />
        </button>

        <h2>{event.title}</h2>
        <p style={{ color: typeMeta[event.type].color, fontWeight: 700, fontSize: 12 }}>
          {typeMeta[event.type].label.toUpperCase()}
        </p>
        <p><strong>Data:</strong> {formatDateLabel(event.date)} · {event.time}</p>
        {event.personName && <p><strong>Com:</strong> {event.personName}</p>}
        <p><strong>Modalidade:</strong> {event.mode === 'virtual' ? 'Virtual (Google Meet)' : 'Presencial'}</p>
        {event.location && (
          <p><strong>{event.mode === 'virtual' ? 'Link:' : 'Local:'}</strong> {event.location}</p>
        )}
        {event.description && <p><strong>Assunto:</strong> {event.description}</p>}
        <p><strong>Status:</strong> <StatusBadge status={event.status} /></p>

        <div className="form-actions" style={{ flexWrap: 'wrap' }}>
          {event.mode === 'virtual' && !past && (
            <button className="primary" onClick={onJoinMeeting}>
              Entrar na reunião
            </button>
          )}
          {!past && (
            <>
              <button className="outline" onClick={() => onEdit(event)}>
                Editar
              </button>
              <button className="outline" onClick={() => onUpdateStatus(event.id, 'concluido')}>
                Marcar como concluído
              </button>
              <button
                className="outline"
                style={{ color: '#b23b3b', borderColor: '#e3b6b6' }}
                onClick={() => onUpdateStatus(event.id, 'cancelado')}
              >
                Cancelar encontro
              </button>
            </>
          )}
        </div>
      </section>
    </div>
  );
}

/* EventFormModal */

interface EventFormModalProps {
  formData: Omit<AgendaEvent, 'id'>;
  isEditing: boolean;
  onChange: (data: Omit<AgendaEvent, 'id'>) => void;
  onClose: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export function EventFormModal({ formData, isEditing, onChange, onClose, onSubmit }: EventFormModalProps) {
  return (
    <div className="modal-backdrop open" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <section className="modal">
        <button className="modal-close" aria-label="Fechar" onClick={onClose}>
          <Icon name="x" />
        </button>

        <form onSubmit={onSubmit}>
          <h2>{isEditing ? 'Editar encontro' : 'Novo encontro'}</h2>

          <label>
            Assunto
            <input
              value={formData.title}
              onChange={(e) => onChange({ ...formData, title: e.target.value })}
              placeholder="Ex.: Tirar dúvidas sobre Lógica"
              required
            />
          </label>

          <label>
            Com quem (padrinho/afilhado)
            <input
              value={formData.personName}
              onChange={(e) => onChange({ ...formData, personName: e.target.value })}
              placeholder="Nome (opcional)"
            />
          </label>

          <label>
            Tipo de compromisso
            <select
              value={formData.type}
              onChange={(e) => onChange({ ...formData, type: e.target.value as EventType })}
            >
              {Object.entries(typeMeta).map(([key, meta]) => (
                <option key={key} value={key}>{meta.label}</option>
              ))}
            </select>
          </label>

          <label>
            Data
            <input
              type="date"
              value={formData.date}
              onChange={(e) => onChange({ ...formData, date: e.target.value })}
            />
          </label>

          <label>
            Horário
            <input
              type="time"
              value={formData.time}
              onChange={(e) => onChange({ ...formData, time: e.target.value })}
            />
          </label>

          <label>
            Modalidade
            <select
              value={formData.mode}
              onChange={(e) => onChange({ ...formData, mode: e.target.value as EventMode })}
            >
              <option value="presencial">Presencial</option>
              <option value="virtual">Virtual (Google Meet)</option>
            </select>
          </label>

          <label>
            {formData.mode === 'virtual' ? 'Link da reunião' : 'Local'}
            <input
              value={formData.location}
              onChange={(e) => onChange({ ...formData, location: e.target.value })}
              placeholder={formData.mode === 'virtual' ? 'Gerado automaticamente ao confirmar' : 'Ex.: Bloco B — sala 12'}
            />
          </label>

          <label>
            Status
            <select
              value={formData.status}
              onChange={(e) => onChange({ ...formData, status: e.target.value as EventStatus })}
            >
              {Object.entries(statusMeta).map(([key, meta]) => (
                <option key={key} value={key}>{meta.label}</option>
              ))}
            </select>
          </label>

          <div className="form-actions">
            <button type="button" className="outline" onClick={onClose}>Cancelar</button>
            <button className="primary" type="submit">Salvar</button>
          </div>
        </form>
      </section>
    </div>
  );
}
