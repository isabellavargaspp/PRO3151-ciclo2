import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './Calendar.css';
import { useBooking } from '../context/BookingContext';

interface CalendarEvent {
  roomId: 'A' | 'B' | 'C' | 'D';
  title: string;
  startTime: string; // "12:37"
  endTime: string;   // "13:37"
  date: string;      // "2026-06-18"
}

const ROOMS = [
  { id: 'A', name: 'Sala de Reunião A', color: 'var(--color-room-a)' },
  { id: 'B', name: 'Sala de Reunião B', color: 'var(--color-room-b)' },
  { id: 'C', name: 'Sala de Reunião C', color: 'var(--color-room-c)' },
  { id: 'D', name: 'Sala de Reunião D', color: 'var(--color-room-d)' },
] as const;

const HOURS = Array.from({ length: 13 }, (_, i) => i + 6); // 6:00 to 18:00
const HOUR_HEIGHT = 50; // px per hour

// Standard static start date for simulation
const SIMULATED_TODAY_STR = '2026-06-18';

export function Calendar() {
  const [view, setView] = useState<'dia' | 'semana'>('dia');
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date('2026-06-18T00:00:00'));
  const [selectedRoomId, setSelectedRoomId] = useState<'A' | 'B' | 'C' | 'D'>('A');

  const { reservations } = useBooking();

  // Helper to format date for header (e.g., "quinta-feira, 18 de junho de 2026")
  const formatDateHeader = (d: Date) => {
    return d.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  };

  // Helper to format week label (e.g., "Semana de 15 a 21 de Junho de 2026")
  const formatWeekHeader = (d: Date) => {
    const days = getWeekDays(d);
    const start = days[0];
    const end = days[6];
    
    const startDay = start.getDate();
    const endDay = end.getDate();
    const endMonth = end.toLocaleDateString('pt-BR', { month: 'long' });
    const endYear = end.getFullYear();
    
    return `Semana de ${startDay} a ${endDay} de ${endMonth} de ${endYear}`;
  };

  // Helper to format Date to YYYY-MM-DD
  const toISODate = (d: Date): string => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Calculate the 7 days of the week (Monday to Sunday)
  const getWeekDays = (baseDate: Date): Date[] => {
    const date = new Date(baseDate);
    const day = date.getDay(); // 0 (Sun) to 6 (Sat)
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Monday
    const monday = new Date(date.setDate(diff));
    
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(d.getDate() + i);
      return d;
    });
  };

  // Navigation handlers
  const handleToday = () => {
    setCurrentDate(new Date('2026-06-18T00:00:00'));
  };

  const handlePrev = () => {
    setCurrentDate(prev => {
      const next = new Date(prev);
      if (view === 'dia') {
        next.setDate(next.getDate() - 1);
      } else {
        next.setDate(next.getDate() - 7);
      }
      return next;
    });
  };

  const handleNext = () => {
    setCurrentDate(prev => {
      const next = new Date(prev);
      if (view === 'dia') {
        next.setDate(next.getDate() + 1);
      } else {
        next.setDate(next.getDate() + 7);
      }
      return next;
    });
  };

  // Get active events for a specific room and date, including recurring ones
  const getEventsForRoomAndDate = (roomId: 'A' | 'B' | 'C' | 'D', targetDateStr: string): CalendarEvent[] => {
    return reservations
      .filter(r => {
        if (r.status === 'Cancelado') return false;
        if (r.roomId !== roomId) return false;

        // 1. Direct date match
        if (r.date === targetDateStr) return true;

        // 2. Recurrence match
        if (r.recurrence) {
          const resDateStr = r.date;
          if (targetDateStr >= resDateStr) {
            if (!r.recurrenceEndDate || targetDateStr <= r.recurrenceEndDate) {
              if (r.recurrence === 'Diária') return true;
              if (r.recurrence === 'Semanal') {
                return new Date(resDateStr + 'T00:00:00').getDay() === new Date(targetDateStr + 'T00:00:00').getDay();
              }
              if (r.recurrence === 'Mensal') {
                return new Date(resDateStr + 'T00:00:00').getDate() === new Date(targetDateStr + 'T00:00:00').getDate();
              }
            }
          }
        }
        return false;
      })
      .map(r => ({
        roomId: r.roomId,
        title: r.title,
        startTime: r.startTime,
        endTime: r.endTime,
        date: r.date,
      }));
  };

  // Helper to calculate position styles of event blocks
  const getEventStyle = (event: CalendarEvent) => {
    const [startHour, startMin] = event.startTime.split(':').map(Number);
    const [endHour, endMin] = event.endTime.split(':').map(Number);
    
    const startMinsFrom6 = (startHour - 6) * 60 + startMin;
    const durationMins = (endHour - startHour) * 60 + (endMin - startMin);
    
    const top = (startMinsFrom6 / 60) * HOUR_HEIGHT;
    const height = (durationMins / 60) * HOUR_HEIGHT;
    
    return {
      top: `${top}px`,
      height: `${height}px`,
      backgroundColor: ROOMS.find(r => r.id === event.roomId)?.color || 'var(--color-primary)'
    };
  };

  const weekDays = getWeekDays(currentDate);

  const formatWeekDayLabel = (d: Date) => {
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const dayName = days[d.getDay()];
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    return `${dayName} ${day}/${month}`;
  };

  return (
    <div className="calendar-page">
      <div className="calendar-header-row">
        <div className="calendar-title-section">
          <h1>Calendário</h1>
          <p className="calendar-subtitle">
            {view === 'dia' ? formatDateHeader(currentDate) : formatWeekHeader(currentDate)}
          </p>
        </div>

        <div className="calendar-controls">
          {view === 'semana' && (
            <select
              value={selectedRoomId}
              onChange={(e) => setSelectedRoomId(e.target.value as any)}
              className="room-calendar-select"
            >
              {ROOMS.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          )}

          <div className="nav-buttons">
            <button className="btn-control today" onClick={handleToday}>Hoje</button>
            <button className="btn-control nav-icon" onClick={handlePrev}><ChevronLeft size={16} /></button>
            <button className="btn-control nav-icon" onClick={handleNext}><ChevronRight size={16} /></button>
          </div>

          <div className="view-selector">
            <button 
              className={`view-btn ${view === 'dia' ? 'active' : ''}`}
              onClick={() => setView('dia')}
            >
              Dia
            </button>
            <button 
              className={`view-btn ${view === 'semana' ? 'active' : ''}`}
              onClick={() => setView('semana')}
            >
              Semana
            </button>
          </div>
        </div>
      </div>

      <div className="calendar-grid-container">
        {/* Header Row */}
        <div className="grid-header">
          <div className="time-column-header"></div>
          {view === 'dia' ? (
            ROOMS.map(room => (
              <div key={room.id} className="room-column-header">
                <span className="room-dot" style={{ backgroundColor: room.color }} />
                {room.name}
              </div>
            ))
          ) : (
            weekDays.map(day => {
              const isToday = toISODate(day) === SIMULATED_TODAY_STR;
              return (
                <div key={toISODate(day)} className="room-column-header" style={{ fontWeight: isToday ? 'bold' : 'normal' }}>
                  {formatWeekDayLabel(day)} {isToday && ' (Hoje)'}
                </div>
              );
            })
          )}
        </div>

        {/* Main Grid Scrollable Area */}
        <div className="grid-body">
          {/* Time indicator column */}
          <div className="time-column">
            {HOURS.map(hour => (
              <div 
                key={hour} 
                className="time-slot-label"
                style={{ height: `${HOUR_HEIGHT}px` }}
              >
                {`${hour}:00`}
              </div>
            ))}
          </div>

          {/* Grid columns */}
          <div className="grid-columns-container">
            {/* Background horizontal lines */}
            {HOURS.map(hour => (
              <div 
                key={hour} 
                className="grid-row-line"
                style={{ height: `${HOUR_HEIGHT}px` }}
              />
            ))}

            {/* Room columns with events */}
            <div className="columns-overlay">
              {view === 'dia' ? (
                ROOMS.map(room => {
                  const dayEvents = getEventsForRoomAndDate(room.id, toISODate(currentDate));
                  return (
                    <div key={room.id} className="room-grid-column">
                      {dayEvents.map((event, idx) => (
                        <div 
                          key={idx} 
                          className="calendar-event-block" 
                          style={getEventStyle(event)}
                        >
                          <div className="event-title">{event.title}</div>
                          <div className="event-time">{`${event.startTime}–${event.endTime}`}</div>
                        </div>
                      ))}
                    </div>
                  );
                })
              ) : (
                weekDays.map(day => {
                  const dayEvents = getEventsForRoomAndDate(selectedRoomId, toISODate(day));
                  return (
                    <div key={toISODate(day)} className="room-grid-column">
                      {dayEvents.map((event, idx) => (
                        <div 
                          key={idx} 
                          className="calendar-event-block" 
                          style={getEventStyle(event)}
                        >
                          <div className="event-title">{event.title}</div>
                          <div className="event-time">{`${event.startTime}–${event.endTime}`}</div>
                        </div>
                      ))}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
