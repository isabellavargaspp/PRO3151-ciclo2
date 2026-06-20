import { useState } from 'react';
import { MapPin, Users, Monitor, PenLine, Coffee, Video, X } from 'lucide-react';
import './Rooms.css';
import { useBooking } from '../context/BookingContext';

type RoomId = 'A' | 'B' | 'C' | 'D';


interface Room {
  id: RoomId;
  name: string;
  floor: string;
  capacity: number;
  resources: string[];
  isOccupied: boolean;
  utilizationToday: number; // percentage 0–100
}

const RESOURCE_ICONS: Record<string, React.ReactNode> = {
  Projetor: <Monitor size={13} />,
  'Quadro Branco': <PenLine size={13} />,
  'Videoconferência': <Video size={13} />,
  'Serviço de Café': <Coffee size={13} />,
};

const ROOMS: Room[] = [
  {
    id: 'A',
    name: 'Sala de Reunião A',
    floor: '2º Andar',
    capacity: 12,
    resources: ['Projetor', 'Quadro Branco', 'Videoconferência', 'Serviço de Café'],
    isOccupied: true,
    utilizationToday: 8,
  },
  {
    id: 'B',
    name: 'Sala de Reunião B',
    floor: '2º Andar',
    capacity: 6,
    resources: ['Quadro Branco', 'Videoconferência'],
    isOccupied: false,
    utilizationToday: 0,
  },
  {
    id: 'C',
    name: 'Sala de Reunião C',
    floor: '1º Andar',
    capacity: 20,
    resources: ['Projetor', 'Quadro Branco', 'Videoconferência', 'Serviço de Café'],
    isOccupied: false,
    utilizationToday: 0,
  },
  {
    id: 'D',
    name: 'Sala de Reunião D',
    floor: '1º Andar',
    capacity: 4,
    resources: ['Quadro Branco'],
    isOccupied: false,
    utilizationToday: 0,
  },
];

const ROOM_COLORS: Record<RoomId, string> = {
  A: 'var(--color-room-a)',
  B: 'var(--color-room-b)',
  C: 'var(--color-room-c)',
  D: 'var(--color-room-d)',
};

/* ── Reservation Modal ── */
interface ReservationModalProps {
  room: Room;
  onClose: () => void;
}

function ReservationModal({ room, onClose }: ReservationModalProps) {
  const { addReservation } = useBooking();
  const [form, setForm] = useState({
    date: '2026-06-18', // Default to simulated current date
    startTime: '13:00', // Default to standard time
    duration: '1 hora',
    title: '',
    description: '',
    participants: '',
    recurrence: 'Nenhuma',
    recurrenceEndDate: '2026-06-18',
    resources: [] as string[],
  });

  const toggleResource = (res: string) => {
    setForm((f) => ({
      ...f,
      resources: f.resources.includes(res)
        ? f.resources.filter((r) => r !== res)
        : [...f.resources, res],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      alert('Por favor, preencha o título da reunião.');
      return;
    }

    if (form.recurrence !== 'Nenhuma') {
      if (!form.recurrenceEndDate) {
        alert('Por favor, informe a data limite para a recorrência.');
        return;
      }
      if (form.recurrenceEndDate < form.date) {
        alert('A data limite da recorrência não pode ser anterior à data de início da reunião.');
        return;
      }
    }

    let durationMins = 60;
    if (form.duration === '30 minutos') durationMins = 30;
    else if (form.duration === '1 hora') durationMins = 60;
    else if (form.duration === '1h30') durationMins = 90;
    else if (form.duration === '2 horas') durationMins = 120;
    else if (form.duration === '3 horas') durationMins = 180;

    const [h, m] = form.startTime.split(':').map(Number);
    let endM = m + durationMins;
    let endH = h + Math.floor(endM / 60);
    endM = endM % 60;
    const endTime = `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;

    const result = addReservation({
      title: form.title,
      roomId: room.id,
      roomName: room.name,
      date: form.date,
      startTime: form.startTime,
      endTime,
      userName: 'Isabella Vargas',
      recurrence: form.recurrence !== 'Nenhuma' ? (form.recurrence as 'Diária' | 'Semanal' | 'Mensal') : undefined,
      recurrenceEndDate: form.recurrence !== 'Nenhuma' ? form.recurrenceEndDate : undefined,
      description: form.description || undefined,
      participants: form.participants ? parseInt(form.participants, 10) : undefined,
      resources: form.resources.length > 0 ? form.resources : undefined,
    });

    if (result.success) {
      alert(`Reserva "${form.title}" criada com sucesso para ${room.name}!`);
      onClose();
    } else {
      alert(result.error);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Nova Reserva</h2>
          <button id="modal-close-btn" className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-row-2">
            <div className="form-group">
              <label>Sala</label>
              <select id="modal-room-select" className="form-input" value={room.name} disabled>
                <option>{room.name} ({room.capacity}p)</option>
              </select>
            </div>
            <div className="form-group">
              <label>Data</label>
              <input
                id="modal-date-input"
                type="date"
                className="form-input"
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value, recurrenceEndDate: e.target.value }))}
              />
            </div>
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label>Horário de início</label>
              <input
                id="modal-start-time"
                type="time"
                className="form-input"
                value={form.startTime}
                onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label>Duração</label>
              <select
                id="modal-duration"
                className="form-input"
                value={form.duration}
                onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))}
              >
                <option>30 minutos</option>
                <option>1 hora</option>
                <option>1h30</option>
                <option>2 horas</option>
                <option>3 horas</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Título da reunião *</label>
            <input
              id="modal-title-input"
              type="text"
              className="form-input"
              placeholder="Ex.: Apresentação ao cliente"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            />
          </div>

          <div className="form-group">
            <label>Descrição (opcional)</label>
            <textarea
              id="modal-description"
              className="form-input form-textarea"
              placeholder="Notas breves..."
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label>Participantes (opcional)</label>
              <input
                id="modal-participants"
                type="number"
                className="form-input"
                placeholder="Quantidade"
                min={1}
                value={form.participants}
                onChange={(e) => setForm((f) => ({ ...f, participants: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label>Recorrência</label>
              <select
                id="modal-recurrence"
                className="form-input"
                value={form.recurrence}
                onChange={(e) => setForm((f) => ({ ...f, recurrence: e.target.value }))}
              >
                <option>Nenhuma</option>
                <option>Diária</option>
                <option>Semanal</option>
                <option>Mensal</option>
              </select>
            </div>
          </div>

          {form.recurrence !== 'Nenhuma' && (
            <div className="form-group" style={{ marginTop: '1rem' }}>
              <label>Até quando? (Fim da Recorrência)</label>
              <input
                id="modal-recurrence-end-date"
                type="date"
                className="form-input"
                value={form.recurrenceEndDate}
                onChange={(e) => setForm((f) => ({ ...f, recurrenceEndDate: e.target.value }))}
              />
            </div>
          )}

          <div className="form-group">
            <label>Recursos</label>
            <div className="resource-chips">
              {room.resources.map((res) => (
                <button
                  key={res}
                  type="button"
                  id={`resource-chip-${res.replace(/\s/g, '-')}`}
                  className={`resource-chip ${form.resources.includes(res) ? 'selected' : ''}`}
                  onClick={() => toggleResource(res)}
                >
                  {res}
                </button>
              ))}
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" id="modal-cancel-btn" className="btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" id="modal-submit-btn" className="btn-primary modal-submit">
              Reservar Sala
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Main Page ── */
export function Rooms() {
  const [bookingRoom, setBookingRoom] = useState<Room | null>(null);
  const { checkCollision } = useBooking();

  const isRoomOccupied = (roomId: 'A' | 'B' | 'C' | 'D') => {
    // Check if there is an active reservation at simulated time 2026-06-18 12:38
    return checkCollision(roomId, '2026-06-18', '12:38', '12:39') !== null;
  };

  return (
    <div className="rooms-page">
      <h1 className="rooms-title">Salas</h1>

      <div className="rooms-grid-2x2">
        {ROOMS.map((room) => {
          const occupied = isRoomOccupied(room.id);
          return (
            <div key={room.id} className="room-profile-card">
              {/* Room letter display */}
              <div className="room-letter-container">
                <span className="room-letter" style={{ color: ROOM_COLORS[room.id] }}>
                  {room.id}
                </span>
              </div>

              {/* Card info row */}
              <div className="room-info-row">
                <div className="room-name-block">
                  <span className="room-profile-name">{room.name}</span>
                </div>
                <span className={`status-badge-small ${occupied ? 'occupied' : 'available'}`}>
                  {occupied ? 'Em uso' : 'Disponível'}
                </span>
              </div>

              {/* Location & capacity */}
              <div className="room-location-capacity">
                <span className="room-meta-item">
                  <MapPin size={13} />
                  {room.floor}
                </span>
                <span className="room-meta-sep">·</span>
                <span className="room-meta-item">
                  <Users size={13} />
                  Até {room.capacity} pessoas
                </span>
              </div>

              {/* Resource chips */}
              <div className="resource-tags">
                {room.resources.map((res) => (
                  <span key={res} className="resource-tag">
                    {RESOURCE_ICONS[res] ?? null}
                    {res}
                  </span>
                ))}
              </div>

              {/* Utilization bar */}
              <div className="utilization-row">
                <span className="utilization-label">Utilização hoje</span>
                <span className="utilization-pct">{room.utilizationToday}%</span>
              </div>
              <div className="utilization-bar-track">
                <div
                  className="utilization-bar-fill"
                  style={{
                    width: `${room.utilizationToday}%`,
                    backgroundColor: ROOM_COLORS[room.id],
                  }}
                />
              </div>

              {/* Reserve button */}
              <button
                id={`reserve-btn-${room.id}`}
                className="reserve-room-btn"
                onClick={() => setBookingRoom(room)}
              >
                Reservar esta sala
              </button>
            </div>
          );
        })}
      </div>

      {bookingRoom && (
        <ReservationModal room={bookingRoom} onClose={() => setBookingRoom(null)} />
      )}
    </div>
  );
}
