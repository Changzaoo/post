import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, ChevronLeft, ChevronRight, Clock, PenSquare, Plus } from 'lucide-react';
import { Layout } from '../components/Layout';
import { EmptyState } from '../components/ui/EmptyState';
import { GlassButton } from '../components/ui/GlassButton';
import { GlassCard } from '../components/ui/GlassCard';
import { PageHeader } from '../components/ui/PageHeader';

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
const MONTHS = [
  'Janeiro', 'Fevereiro', 'Marco', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function getEvents(day: number | null) {
  if (!day) return [];
  const events = [];
  if (day % 5 === 0) events.push({ title: 'Post agendado', status: 'planned', time: '09:00' });
  if (day % 7 === 0) events.push({ title: 'Publicado', status: 'success', time: '18:00' });
  if (day % 11 === 0) events.push({ title: 'Rascunho criativo', status: 'pending', time: '14:30' });
  return events;
}

export function Calendar() {
  const navigate = useNavigate();
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<number>(today.getDate());
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  const cells = useMemo<(number | null)[]>(() => {
    const nextCells: (number | null)[] = [
      ...Array(firstDay).fill(null),
      ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
    ];
    while (nextCells.length % 7 !== 0) nextCells.push(null);
    return nextCells;
  }, [daysInMonth, firstDay]);

  const agendaDays = useMemo(() => {
    return Array.from({ length: daysInMonth }, (_, index) => index + 1)
      .map((day) => ({ day, events: getEvents(day) }))
      .filter((item) => item.events.length > 0);
  }, [daysInMonth]);

  const selectedEvents = getEvents(selectedDay);

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentYear((year) => year - 1);
      setCurrentMonth(11);
    } else {
      setCurrentMonth((month) => month - 1);
    }
    setSelectedDay(1);
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentYear((year) => year + 1);
      setCurrentMonth(0);
    } else {
      setCurrentMonth((month) => month + 1);
    }
    setSelectedDay(1);
  };

  const isToday = (day: number | null) =>
    day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();

  return (
    <Layout>
      <div className="pf-page calendar-page">
        <PageHeader
          eyebrow={<><CalendarDays size={14} /> Planejamento editorial</>}
          title="Calendario"
          description="Organize publicacoes, rascunhos e janelas de campanha em uma experiencia glass responsiva."
          actions={
            <GlassButton variant="primary" onClick={() => navigate('/composer')}>
              <PenSquare size={16} /> Nova publicacao
            </GlassButton>
          }
        />

        <GlassCard className="calendar-shell" padded={false}>
          <div className="calendar-toolbar">
            <div className="calendar-month-controls">
              <GlassButton variant="secondary" size="icon" aria-label="Mes anterior" onClick={prevMonth}>
                <ChevronLeft size={18} />
              </GlassButton>
              <div>
                <strong>{MONTHS[currentMonth]} {currentYear}</strong>
                <span>{view === 'month' ? 'Visao mensal' : view === 'week' ? 'Visao semanal' : 'Agenda do dia'}</span>
              </div>
              <GlassButton variant="secondary" size="icon" aria-label="Proximo mes" onClick={nextMonth}>
                <ChevronRight size={18} />
              </GlassButton>
            </div>

            <div className="segmented-control" aria-label="Visualizacao do calendario">
              <button className={view === 'month' ? 'active' : ''} onClick={() => setView('month')} type="button">Mes</button>
              <button className={view === 'week' ? 'active' : ''} onClick={() => setView('week')} type="button">Semana</button>
              <button className={view === 'day' ? 'active' : ''} onClick={() => setView('day')} type="button">Dia</button>
            </div>
          </div>

          <div className="calendar-content">
            <section className="calendar-grid-panel" aria-label="Calendario mensal">
              <div className="calendar-weekdays">
                {WEEKDAYS.map((weekday) => <span key={weekday}>{weekday}</span>)}
              </div>
              <div className="calendar-grid">
                {cells.map((day, index) => {
                  const events = getEvents(day);
                  const active = day === selectedDay;
                  return (
                    <button
                      key={`${day ?? 'empty'}-${index}`}
                      type="button"
                      className={`calendar-day${day ? '' : ' is-empty'}${isToday(day) ? ' is-today' : ''}${active ? ' is-active' : ''}`}
                      onClick={() => day && setSelectedDay(day)}
                      disabled={!day}
                    >
                      {day && (
                        <>
                          <span>{day}</span>
                          <div className="calendar-event-dots">
                            {events.slice(0, 3).map((event) => (
                              <i key={`${event.title}-${event.time}`} data-status={event.status} />
                            ))}
                          </div>
                        </>
                      )}
                    </button>
                  );
                })}
              </div>
            </section>

            <aside className="calendar-agenda-panel">
              <div className="calendar-agenda-header">
                <div>
                  <strong>{selectedDay} de {MONTHS[currentMonth]}</strong>
                  <span>{selectedEvents.length} evento(s)</span>
                </div>
                <GlassButton variant="secondary" size="sm" onClick={() => navigate('/composer')}>
                  <Plus size={14} /> Criar
                </GlassButton>
              </div>

              {selectedEvents.length === 0 ? (
                <EmptyState
                  className="calendar-empty"
                  icon={<CalendarDays size={28} />}
                  title="Sem posts neste dia"
                  description="Use a agenda para preparar o proximo conteudo."
                />
              ) : (
                <div className="calendar-event-list">
                  {selectedEvents.map((event) => (
                    <article className="calendar-event-card" key={`${event.title}-${event.time}`}>
                      <span className="status-chip" data-status={event.status}>{event.status === 'success' ? 'Publicado' : event.status === 'planned' ? 'Agendado' : 'Rascunho'}</span>
                      <strong>{event.title}</strong>
                      <small><Clock size={13} /> {event.time}</small>
                    </article>
                  ))}
                </div>
              )}

              <div className="calendar-mobile-agenda">
                <strong>Agenda do mes</strong>
                {agendaDays.map((item) => (
                  <button key={item.day} type="button" onClick={() => setSelectedDay(item.day)} className={item.day === selectedDay ? 'active' : ''}>
                    <span>{item.day}</span>
                    <div>
                      {item.events.map((event) => <em key={`${item.day}-${event.title}`}>{event.title}</em>)}
                    </div>
                  </button>
                ))}
              </div>
            </aside>
          </div>
        </GlassCard>
      </div>
    </Layout>
  );
}
