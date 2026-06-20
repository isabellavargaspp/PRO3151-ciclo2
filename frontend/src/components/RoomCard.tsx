import { Users, Zap, Clock } from 'lucide-react';
import './RoomCard.css';

interface Booking {
  title: string;
  startTime: string;
  endTime: string;
  userName: string;
}

interface RoomCardProps {
  id: string;
  name: string;
  capacity: number;
  location: string;
  color: string;
  currentBooking: Booking | null;
  isQuickSelecting: boolean;
  onQuickReserveClick: () => void;
  onSelectDuration: (minutes: number) => void;
  onCancelQuickSelect: () => void;
}

export function RoomCard({
  name,
  capacity,
  location,
  currentBooking,
  isQuickSelecting,
  onQuickReserveClick,
  onSelectDuration,
  onCancelQuickSelect,
}: RoomCardProps) {
  const isOccupied = currentBooking !== null;

  return (
    <div className={`room-card glass-panel ${isOccupied ? 'occupied' : ''}`}>
      <div className="room-card-header">
        <h3>{name}</h3>
        <span className={`status-badge ${isOccupied ? 'occupied' : 'available'}`}>
          <span className={`badge-dot ${isOccupied ? 'occupied' : 'available'}`} />
          {isOccupied ? 'Ocupada' : 'Disponível'}
        </span>
      </div>
      
      <div className="room-card-content">
        <div className="room-info">
          <Users size={16} />
          <span>{capacity} · {location}</span>
        </div>

        {isOccupied && (
          <div className="current-meeting-info">
            <div className="meeting-title">{currentBooking.title}</div>
            <div className="meeting-time">
              <Clock size={14} />
              <span>Termina às {currentBooking.endTime}</span>
            </div>
          </div>
        )}
      </div>

      <div className="room-card-footer">
        {!isOccupied && !isQuickSelecting && (
          <button className="btn-quick-reserve" onClick={onQuickReserveClick}>
            <Zap size={15} />
            <span>Reserva Rápida</span>
          </button>
        )}

        {!isOccupied && isQuickSelecting && (
          <div className="quick-reserve-options">
            <button className="btn-duration" onClick={() => onSelectDuration(30)}>30m</button>
            <button className="btn-duration" onClick={() => onSelectDuration(60)}>60m</button>
            <button className="btn-duration" onClick={() => onSelectDuration(90)}>90m</button>
            <button className="btn-cancel-select" onClick={onCancelQuickSelect}>Cancelar</button>
          </div>
        )}

        {isOccupied && (
          <div className="occupied-placeholder">
            {/* Ocupada, sem ações rápidas disponíveis */}
          </div>
        )}
      </div>
    </div>
  );
}
