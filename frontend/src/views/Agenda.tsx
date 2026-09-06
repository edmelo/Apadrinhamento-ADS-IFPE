import { useState } from 'react';
import Icon from '../components/Icon';
import { useModal } from '../context/ModalContext';
import { useToast } from '../context/ToastContext';

const MIN_YEAR = 2026;
const MAX_YEAR = 2030;

const monthNames = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

interface DayCell {
  key: string;
  label: string;
  muted: boolean;
  isToday: boolean;
}

function buildMonthGrid(year: number, monthIndex: number): DayCell[] {
  const firstWeekday = new Date(year, monthIndex, 1).getDay(); // 0 = domingo
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, monthIndex, 0).getDate();

  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === monthIndex;

  const cells: DayCell[] = [];

  for (let i = firstWeekday - 1; i >= 0; i--) {
    cells.push({ key: `prev-${i}`, label: String(daysInPrevMonth - i), muted: true, isToday: false });
  }

  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({
      key: `cur-${d}`,
      label: String(d),
      muted: false,
      isToday: isCurrentMonth && today.getDate() === d,
    });
  }

  const trailing = (7 - (cells.length % 7)) % 7;
  for (let d = 1; d <= trailing; d++) {
    cells.push({ key: `next-${d}`, label: String(d), muted: true, isToday: false });
  }

  return cells;
}

function clampToRange(year: number, monthIndex: number): { year: number; monthIndex: number } {
  if (year < MIN_YEAR) return { year: MIN_YEAR, monthIndex: 0 };
  if (year > MAX_YEAR) return { year: MAX_YEAR, monthIndex: 11 };
  return { year, monthIndex };
}

export default function Agenda() {
  const { openModal } = useModal();
  const { showToast } = useToast();

  const now = new Date();
  const initialYear = Math.min(Math.max(now.getFullYear(), MIN_YEAR), MAX_YEAR);
  const initialMonth = initialYear === now.getFullYear() ? now.getMonth() : 0;

  const [year, setYear] = useState(initialYear);
  const [monthIndex, setMonthIndex] = useState(initialMonth);

  const days = buildMonthGrid(year, monthIndex);

  const goToMonth = (delta: number) => {
    let newMonth = monthIndex + delta;
    let newYear = year;
    if (newMonth < 0) {
      newMonth = 11;
      newYear -= 1;
    } else if (newMonth > 11) {
      newMonth = 0;
      newYear += 1;
    }
    const clamped = clampToRange(newYear, newMonth);
    setYear(clamped.year);
    setMonthIndex(clamped.monthIndex);
  };

  const canGoPrev = !(year === MIN_YEAR && monthIndex === 0);
  const canGoNext = !(year === MAX_YEAR && monthIndex === 11);

  return (
    <section className="view active" id="agenda">
      <div className="page-heading">
        <div>
          <p className="eyebrow">AGENDA</p>
          <h1>Organize seus encontros.</h1>
          <p className="subtitle">Não deixe nenhuma conversa importante passar.</p>
        </div>
        <button className="primary" onClick={() => openModal('encontro')}>
          <Icon name="plus" />
          Novo encontro
        </button>
      </div>

      <div className="agenda-layout">
        <section className="card calendar">
          <div className="calendar-head">
            <button className="icon-button" onClick={() => goToMonth(-1)} disabled={!canGoPrev}>
              ‹
            </button>
            <h2>
              {monthNames[monthIndex]}{' '}
              <select
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                style={{ border: 'none', background: 'transparent', font: 'inherit', cursor: 'pointer' }}
              >
                {Array.from({ length: MAX_YEAR - MIN_YEAR + 1 }, (_, i) => MIN_YEAR + i).map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </h2>
            <button className="icon-button" onClick={() => goToMonth(1)} disabled={!canGoNext}>
              ›
            </button>
          </div>
          <div className="weekdays">
            <span>DOM</span>
            <span>SEG</span>
            <span>TER</span>
            <span>QUA</span>
            <span>QUI</span>
            <span>SEX</span>
            <span>SÁB</span>
          </div>
          <div className="days">
            {days.map((d) => (
              <span
                key={d.key}
                className={`${d.muted ? 'muted-day ' : ''}${d.isToday ? 'today ' : ''}`}
                data-number={d.isToday ? d.label : undefined}
              >
                {d.isToday ? '' : d.label}
              </span>
            ))}
          </div>
        </section>

        <section className="schedule">
          <p className="eyebrow">PRÓXIMOS COMPROMISSOS</p>
          <h2>Seus encontros agendados</h2>
          <article className="event">
            <span className="time">14:00</span>
            <div>
              <span className="event-type">MENTORIA · VIRTUAL</span>
              <h3>Conversa de boas-vindas</h3>
              <p>Com seu padrinho/madrinha · Google Meet</p>
              <button
                className="text-button"
                onClick={() => showToast('Link do Google Meet copiado')}
              >
                Entrar na sala <Icon name="arrow" />
              </button>
            </div>
          </article>
          <article className="event muted-event">
            <span className="time">16:00</span>
            <div>
              <span className="event-type">PESSOAL</span>
              <h3>Revisar material de Lógica</h3>
              <p>Lembrete pessoal</p>
            </div>
          </article>
        </section>
      </div>
    </section>
  );
}