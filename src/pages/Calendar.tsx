import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, PenSquare, CalendarDays } from 'lucide-react';

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTHS = [
  'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro',
];

function getDaysInMonth(year: number, month: number) { return new Date(year, month + 1, 0).getDate(); }
function getFirstDayOfMonth(year: number, month: number) { return new Date(year, month, 1).getDay(); }

export function Calendar() {
  const navigate = useNavigate();
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentYear(y => y - 1); setCurrentMonth(11); }
    else setCurrentMonth(m => m - 1);
    setSelectedDay(null);
  };

  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentYear(y => y + 1); setCurrentMonth(0); }
    else setCurrentMonth(m => m + 1);
    setSelectedDay(null);
  };

  const isToday = (day: number) =>
    day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <Layout>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        {/* Header */}
        <motion.div style={{ marginBottom: 24 }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.025em', marginBottom: 5 }}>
                <span style={{ background: 'linear-gradient(90deg, #20F5D8, #7EB8FF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  Calendário
                </span>
              </h1>
              <p style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>Planeje e agende suas publicações</p>
            </div>
            <button
              onClick={() => navigate('/composer')}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, background: 'linear-gradient(135deg, #3B6EFF, #1A5CFF)', color: '#fff', fontWeight: 600, fontSize: 13, border: 'none', cursor: 'pointer', boxShadow: '0 4px 14px rgba(59,110,255,0.35)' }}
            >
              <PenSquare size={13} /> Nova publicação
            </button>
          </div>
        </motion.div>

        {/* Calendar card */}
        <motion.div className="glass-card" style={{ padding: 20 }} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          {/* Month navigation */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <button
              onClick={prevMonth}
              style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-secondary)', transition: 'all 200ms' }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(59,110,255,0.12)'; (e.currentTarget as HTMLButtonElement).style.color = '#7EB8FF'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.05)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)'; }}
            >
              <ChevronLeft size={16} />
            </button>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.015em' }}>
              {MONTHS[currentMonth]} {currentYear}
            </h2>
            <button
              onClick={nextMonth}
              style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-secondary)', transition: 'all 200ms' }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(59,110,255,0.12)'; (e.currentTarget as HTMLButtonElement).style.color = '#7EB8FF'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.05)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)'; }}
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Weekday headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 6 }}>
            {WEEKDAYS.map((d) => (
              <div key={d} style={{ textAlign: 'center', fontSize: 11, fontWeight: 600, color: 'var(--text-tertiary)', padding: '6px 0', letterSpacing: '0.04em', textTransform: 'uppercase' }}>{d}</div>
            ))}
          </div>

          {/* Calendar grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
            {cells.map((day, i) => {
              const todayDay = isToday(day!);
              const selectedThisDay = day === selectedDay;
              return (
                <div
                  key={i}
                  onClick={() => day && setSelectedDay(day === selectedDay ? null : day)}
                  style={{
                    minHeight: 52, borderRadius: 10, padding: 8,
                    cursor: day ? 'pointer' : 'default',
                    background: todayDay
                      ? 'rgba(59,110,255,0.10)'
                      : selectedThisDay
                      ? 'rgba(59,110,255,0.08)'
                      : 'transparent',
                    border: selectedThisDay && !todayDay
                      ? '0.5px solid rgba(59,110,255,0.35)'
                      : todayDay
                      ? '0.5px solid rgba(59,110,255,0.30)'
                      : '0.5px solid transparent',
                    transition: 'all 150ms',
                  }}
                  onMouseEnter={e => { if (day && !todayDay && !selectedThisDay) (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.03)'; }}
                  onMouseLeave={e => { if (day && !todayDay && !selectedThisDay) (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
                >
                  {day && (
                    <>
                      <span style={todayDay ? {
                        display: 'inline-flex', width: 24, height: 24, alignItems: 'center', justifyContent: 'center',
                        borderRadius: '50%', background: 'linear-gradient(135deg, #3B6EFF, #1A5CFF)',
                        fontSize: 11, fontWeight: 800, color: '#fff',
                      } : {
                        fontSize: 12, fontWeight: 500,
                        color: selectedThisDay ? '#7EB8FF' : 'var(--text-secondary)',
                      }}>
                        {day}
                      </span>
                      {day % 7 === 0 && (
                        <div style={{ marginTop: 4, display: 'flex', gap: 3 }}>
                          <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#10D97A' }} />
                        </div>
                      )}
                      {day % 5 === 0 && (
                        <div style={{ marginTop: 4, display: 'flex', gap: 3 }}>
                          <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#3B6EFF' }} />
                          <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#8B5CF6' }} />
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', gap: 16, marginTop: 16, paddingTop: 16, borderTop: '0.5px solid rgba(255,255,255,0.06)', fontSize: 11, color: 'var(--text-tertiary)', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#10D97A' }} /> Publicado
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#3B6EFF' }} /> Agendado
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#8B5CF6' }} /> Rascunho
            </div>
            <span style={{ opacity: 0.5 }}>· Dados demo</span>
          </div>
        </motion.div>

        {/* Day detail */}
        <AnimatePresence>
          {selectedDay && (
            <motion.div
              className="glass-card"
              style={{ padding: 20, marginTop: 14 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                  {selectedDay} de {MONTHS[currentMonth]}
                </h3>
                <button
                  onClick={() => navigate('/composer')}
                  style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 8, background: 'linear-gradient(135deg, #3B6EFF, #1A5CFF)', color: '#fff', fontWeight: 600, fontSize: 12, border: 'none', cursor: 'pointer' }}
                >
                  <PenSquare size={11} /> Criar post
                </button>
              </div>
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <CalendarDays size={32} style={{ color: 'var(--text-tertiary)', margin: '0 auto 10px' }} />
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>Nenhum post agendado para este dia.</p>
                <p style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Agendamento de posts em breve.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
}
