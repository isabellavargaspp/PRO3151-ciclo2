import { useState, useEffect } from 'react';
import { RoomCard } from '../components/RoomCard';
import './Dashboard.css';
import { useBooking } from '../context/BookingContext';

interface Booking {
  title: string;
  startTime: string;
  endTime: string;
  userName: string;
}

type RoomId = 'A' | 'B' | 'C' | 'D';

interface Room {
  id: RoomId;
  name: string;
  capacity: string;
  location: string;
  color: string;
  cssColor: string;
}

const ROOMS: Room[] = [
  { id: 'A', name: 'Sala de Reunião A', capacity: '12p', location: '2º Andar', color: 'A', cssColor: 'var(--color-room-a)' },
  { id: 'B', name: 'Sala de Reunião B', capacity: '6p', location: '2º Andar', color: 'B', cssColor: 'var(--color-room-b)' },
  { id: 'C', name: 'Sala de Reunião C', capacity: '20p', location: '1º Andar', color: 'C', cssColor: 'var(--color-room-c)' },
  { id: 'D', name: 'Sala de Reunião D', capacity: '4p', location: '1º Andar', color: 'D', cssColor: 'var(--color-room-d)' },
];

// ─── Helpers de data/hora ────────────────────────────────────────────────────

function getNowDate(): string {
  return new Date().toLocaleDateString('sv-SE'); // "YYYY-MM-DD"
}

function getNowTime(): string {
  return new Date().toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

function formatCurrentTime(date: Date): string {
  return date.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }) + ' · ' + date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

// ─── Componente ──────────────────────────────────────────────────────────────

export function Dashboard() {
  // Atualiza a hora a cada minuto
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const SIM_DATE = getNowDate();
  const SIM_TIME = getNowTime();
  const currentTime = formatCurrentTime(now);

  const { reservations, addReservation } = useBooking();

  const [activeQuickReserveRoomId, setActiveQuickReserveRoomId] = useState<RoomId | null>(null);

  const parseTime = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };

  const getActiveBooking = (roomId: RoomId): Booking | null => {
    const nowMins = parseTime(SIM_TIME);

    const res = reservations.find(r => {
      if (r.roomId !== roomId) return false;
      if (r.status === 'Cancelado') return false;

      if (r.date === SIM_DATE) {
        const start = parseTime(r.startTime);
        const end = parseTime(r.endTime);
        return nowMins >= start && nowMins < end;
      }

      if (r.recurrence) {
        const resDate = new Date(r.date + 'T00:00:00');
        const targetDate = new Date(SIM_DATE + 'T00:00:00');
        if (targetDate >= resDate && resDate.getDay() === targetDate.getDay()) {
          let isWithinRecurrenceRange = true;
          if (r.recurrenceEndDate) {
            const limitDate = new Date(r.recurrenceEndDate + 'T23:59:59');
            if (targetDate > limitDate) isWithinRecurrenceRange = false;
          }
          if (isWithinRecurrenceRange) {
            const start = parseTime(r.startTime);
            const end = parseTime(r.endTime);
            return nowMins >= start && nowMins < end;
          }
        }
      }
      return false;
    });

    return res ? {
      title: res.title,
      startTime: res.startTime,
      endTime: res.endTime,
      userName: res.userName,
    } : null;
  };

  const todaysReservations = reservations.filter(r => {
    if (r.status === 'Cancelado') return false;
    if (r.date === SIM_DATE) return true;

    if (r.recurrence) {
      const resDate = new Date(r.date + 'T00:00:00');
      const targetDate = new Date(SIM_DATE + 'T00:00:00');
      if (targetDate >= resDate && resDate.getDay() === targetDate.getDay()) {
        if (r.recurrenceEndDate) {
          const limitDate = new Date(r.recurrenceEndDate + 'T23:59:59');
          if (targetDate > limitDate) return false;
        }
        return true;
      }
    }
    return false;
  }).sort((a, b) => a.startTime.localeCompare(b.startTime));

  const handleQuickReserveClick = (roomId: RoomId) => {
    setActiveQuickReserveRoomId(roomId);
  };

  const handleSelectDuration = (roomId: RoomId, minutes: number) => {
    const startTime = SIM_TIME;
    const [h, m] = startTime.split(':').map(Number);
    let endMin = m + minutes;
    let endHour = h + Math.floor(endMin / 60);
    endMin = endMin % 60;

    const endTime = `${endHour.toString().padStart(2, '0')}:${endMin.toString().padStart(2, '0')}`;
    const room = ROOMS.find(r => r.id === roomId);

    const result = addReservation(
      roomId,
      'Reunião Rápida',
      SIM_DATE,
      startTime,
      endTime
    );

    if (!result || (result as any).success === false) {
      alert((result as any)?.error || 'Erro ao criar reserva');
    }

    setActiveQuickReserveRoomId(null);
  };

  const handleCancelQuickSelect = () => {
    setActiveQuickReserveRoomId(null);
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header-section">
        <h1>Painel</h1>
        <p className="current-time">{currentTime}</p>
      </div>

      <div className="rooms-grid">
        {ROOMS.map(room => (
          <RoomCard
            key={room.id}
            id={room.id}
            name={room.name}
            capacity={parseInt(room.capacity)}
            location={room.location}
            color={room.color}
            currentBooking={getActiveBooking(room.id)}
            isQuickSelecting={activeQuickReserveRoomId === room.id}
            onQuickReserveClick={() => handleQuickReserveClick(room.id)}
            onSelectDuration={(minutes) => handleSelectDuration(room.id, minutes)}
            onCancelQuickSelect={handleCancelQuickSelect}
          />
        ))}
      </div>

      <div className="agenda-section">
        <h2>Agenda de Hoje</h2>
        {todaysReservations.length === 0 ? (
          <div className="agenda-empty-state">
            <p>Nenhuma reserva para hoje</p>
          </div>
        ) : (
          <div className="agenda-list">
            {todaysReservations.map((booking) => {
              const room = ROOMS.find(r => r.id === booking.roomId);
              if (!room) return null;
              return (
                <div key={booking.id} className="agenda-item" style={{ borderLeftColor: room.cssColor }}>
                  <div className="agenda-item-content">
                    <div className="agenda-item-title">{booking.title}</div>
                    <div className="agenda-item-details">
                      {room.name} · {booking.startTime} – {booking.endTime} · {booking.userName}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
