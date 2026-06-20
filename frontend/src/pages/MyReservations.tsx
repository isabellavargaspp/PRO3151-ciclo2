import { useState } from 'react';
import { Calendar, Clock, Trash2, RefreshCw } from 'lucide-react';
import './MyReservations.css';
import { useBooking, formatDateToPt } from '../context/BookingContext';

type RoomId = 'A' | 'B' | 'C' | 'D';

const ROOM_COLORS: Record<RoomId, string> = {
  A: 'var(--color-room-a)',
  B: 'var(--color-room-b)',
  C: 'var(--color-room-c)',
  D: 'var(--color-room-d)',
};

type TabType = 'proximas' | 'anteriores';

export function MyReservations() {
  const [activeTab, setActiveTab] = useState<TabType>('proximas');
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  const { reservations, cancelReservation } = useBooking();

  const SIM_DATE = '2026-06-18';
  const SIM_TIME = '12:38';

  const isPast = (date: string, endTime: string) => {
    if (date < SIM_DATE) return true;
    if (date === SIM_DATE && endTime <= SIM_TIME) return true;
    return false;
  };

  // Map global reservations to the local UI representation
  const myReservationsMapped = reservations
    .filter(r => r.userName === 'Isabella Vargas' && r.status !== 'Cancelado')
    .map(r => ({
      id: r.id,
      title: r.title,
      date: formatDateToPt(r.date),
      rawDate: r.date,
      timeRange: `${r.startTime}–${r.endTime}`,
      rawEndTime: r.endTime,
      room: r.roomName,
      roomId: r.roomId,
      recurrence: r.recurrence
    }));

  const proximas = myReservationsMapped.filter(r => !isPast(r.rawDate, r.rawEndTime));
  const anteriores = myReservationsMapped.filter(r => isPast(r.rawDate, r.rawEndTime));

  const proximasSorted = [...proximas].sort((a, b) => {
    const dateComp = a.rawDate.localeCompare(b.rawDate);
    if (dateComp !== 0) return dateComp;
    return a.timeRange.localeCompare(b.timeRange);
  });

  const anterioresSorted = [...anteriores].sort((a, b) => {
    const dateComp = b.rawDate.localeCompare(a.rawDate);
    if (dateComp !== 0) return dateComp;
    return b.timeRange.localeCompare(a.timeRange);
  });

  const handleCancelClick = (id: string) => {
    setConfirmingId(id);
  };

  const handleConfirmCancel = (id: string) => {
    cancelReservation(id);
    setConfirmingId(null);
  };

  const handleAbortCancel = () => {
    setConfirmingId(null);
  };

  const currentList = activeTab === 'proximas' ? proximasSorted : anterioresSorted;

  return (
    <div className="my-reservations-page">
      <h1 className="my-reservations-title">Todas as Reservas</h1>

      <div className="tabs-row">
        <button
          id="tab-proximas"
          className={`tab-btn ${activeTab === 'proximas' ? 'active' : ''}`}
          onClick={() => setActiveTab('proximas')}
        >
          Próximas ({proximasSorted.length})
        </button>
        <button
          id="tab-anteriores"
          className={`tab-btn ${activeTab === 'anteriores' ? 'active' : ''}`}
          onClick={() => setActiveTab('anteriores')}
        >
          Anteriores ({anterioresSorted.length})
        </button>
      </div>

      <div className="reservations-list">
        {currentList.length === 0 ? (
          <div className="empty-state">
            <p>Nenhuma reserva encontrada.</p>
          </div>
        ) : (
          currentList.map((reservation) => (
            <div
              key={reservation.id}
              className="reservation-card"
              style={{ borderLeftColor: ROOM_COLORS[reservation.roomId] }}
            >
              <div className="reservation-card-body">
                <div className="reservation-title-row">
                  <span className="reservation-title">{reservation.title}</span>
                  {reservation.recurrence && (
                    <span className="recurrence-badge">
                      <RefreshCw size={11} />
                      {reservation.recurrence}
                    </span>
                  )}
                </div>
                <div className="reservation-meta">
                  <span className="meta-item">
                    <Calendar size={13} />
                    {reservation.date}
                  </span>
                  <span className="meta-item">
                    <Clock size={13} />
                    {reservation.timeRange}
                  </span>
                  <span className="meta-room">{reservation.room}</span>
                </div>
              </div>

              <div className="reservation-actions">
                {confirmingId === reservation.id ? (
                  <div className="confirm-delete">
                    <span className="confirm-text">Cancelar reserva?</span>
                    <button
                      id={`confirm-yes-${reservation.id}`}
                      className="confirm-yes-btn"
                      onClick={() => handleConfirmCancel(reservation.id)}
                    >
                      Sim
                    </button>
                    <button
                      id={`confirm-no-${reservation.id}`}
                      className="confirm-no-btn"
                      onClick={handleAbortCancel}
                    >
                      Não
                    </button>
                  </div>
                ) : (
                  <button
                    id={`cancel-btn-${reservation.id}`}
                    className="delete-btn"
                    onClick={() => handleCancelClick(reservation.id)}
                    title="Cancelar reserva"
                  >
                    <Trash2 size={17} />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
