import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  apiGetMyReservations,
  apiCreateReservation,
  apiCancelReservation,
  apiGetRooms,
  apiGetAvailability,
  getCurrentUser,
} from '../api';

// ─────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────

export interface Reservation {
  id: string;
  title: string;
  roomId: string;
  roomName: string;
  date: string;       // "YYYY-MM-DD"
  startTime: string;  // "HH:MM"
  endTime: string;    // "HH:MM"
  userName: string;
  status: 'Pendente' | 'Confirmado' | 'Cancelado';
}

export interface Room {
  id: string;
  name: string;
  capacity: number;
  floor?: string;
  description?: string;
  available?: boolean;
}

interface BookingContextType {
  reservations: Reservation[];
  rooms: Room[];
  loading: boolean;
  addReservation: (
    roomId: string,
    title: string,
    date: string,
    startTime: string,
    endTime: string
  ) => Promise<{ success: boolean; error?: string }>;
  cancelReservation: (id: string) => Promise<void>;
  refreshReservations: () => Promise<void>;
  refreshRooms: (date?: string) => Promise<void>;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

// ─────────────────────────────────────────
// HELPER: converte datetime ISO do backend para date/time separados
// ─────────────────────────────────────────
function parseBackendReservation(res: any): Reservation {
  const start = new Date(res.start_time);
  const end = new Date(res.end_time);

  const date = start.toISOString().split('T')[0];
  const startTime = start.toTimeString().slice(0, 5);
  const endTime = end.toTimeString().slice(0, 5);

  const user = getCurrentUser();

  return {
    id: res.id,
    title: res.title,
    roomId: res.room_id,
    roomName: res.room?.name || 'Sala',
    date,
    startTime,
    endTime,
    userName: user?.name || 'Usuário',
    status: 'Confirmado',
  };
}

// ─────────────────────────────────────────
// PROVIDER
// ─────────────────────────────────────────

export function BookingProvider({ children }: { children: React.ReactNode }) {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);

  const refreshReservations = async () => {
    try {
      setLoading(true);
      const data = await apiGetMyReservations();
      setReservations(data.map(parseBackendReservation));
    } catch (err) {
      console.error('Erro ao carregar reservas:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshRooms = async (date?: string) => {
    try {
      const today = date || new Date().toISOString().split('T')[0];
      const data = await apiGetAvailability(today);
      setRooms(data);
    } catch (err) {
      // fallback: busca lista simples sem disponibilidade
      try {
        const data = await apiGetRooms();
        setRooms(data);
      } catch (e) {
        console.error('Erro ao carregar salas:', e);
      }
    }
  };

  // Carrega dados ao montar se usuário estiver autenticado
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      refreshReservations().catch(() => { });
      refreshRooms().catch(() => { });
    }
  }, []);

  const addReservation = async (
    roomId: string,
    title: string,
    date: string,
    startTime: string,
    endTime: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      // Monta datetime ISO combinando date + time
      const startISO = `${date}T${startTime}:00`;
      const endISO = `${date}T${endTime}:00`;

      await apiCreateReservation(roomId, title, startISO, endISO);
      await refreshReservations();
      await refreshRooms(date);
      return { success: true };
    } catch (err: any) {
      if (err.status === 409) {
        return { success: false, error: 'Conflito de horário! Esta sala já está reservada neste período.' };
      }
      return { success: false, error: err.message || 'Erro ao criar reserva.' };
    }
  };

  const cancelReservation = async (id: string) => {
    try {
      await apiCancelReservation(id);
      await refreshReservations();
      await refreshRooms();
    } catch (err) {
      console.error('Erro ao cancelar reserva:', err);
    }
  };

  return (
    <BookingContext.Provider value={{
      reservations,
      rooms,
      loading,
      addReservation,
      cancelReservation,
      refreshReservations,
      refreshRooms,
    }}>
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
}

export function formatDateToPt(dateStr: string): string {
  const months = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun',
    'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const year = parts[0];
    const monthIdx = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    if (monthIdx >= 0 && monthIdx < 12) {
      return `${day} de ${months[monthIdx]}, ${year}`;
    }
  }
  return dateStr;
}