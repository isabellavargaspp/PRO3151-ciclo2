import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Reservation {
  id: string;
  title: string;
  roomId: 'A' | 'B' | 'C' | 'D';
  roomName: string;
  date: string;       // "YYYY-MM-DD"
  startTime: string;  // "HH:MM"
  endTime: string;    // "HH:MM"
  userName: string;
  recurrence?: 'Diária' | 'Semanal' | 'Mensal';
  recurrenceEndDate?: string; // "YYYY-MM-DD"
  description?: string;
  participants?: number;
  resources?: string[];
  status: 'Pendente' | 'Confirmado' | 'Cancelado';
}

interface BookingContextType {
  reservations: Reservation[];
  addReservation: (res: Omit<Reservation, 'id' | 'status'>) => { success: boolean; error?: string };
  cancelReservation: (id: string) => void;
  checkCollision: (roomId: 'A' | 'B' | 'C' | 'D', date: string, startTime: string, endTime: string, excludeId?: string) => Reservation | null;
  isPastDateTime: (date: string, startTime: string) => boolean;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

// System static datetime for past check: 2026-06-18 12:38
const SYSTEM_DATE = '2026-06-18';
const SYSTEM_TIME = '12:38';


const INITIAL_RESERVATIONS: Reservation[] = [
  // Future/Active
  {
    id: 'r1',
    title: 'Reunião Rápida',
    roomId: 'A',
    roomName: 'Sala de Reunião A',
    date: '2026-06-18',
    startTime: '12:37',
    endTime: '13:37',
    userName: 'Isabella Vargas',
    status: 'Confirmado',
  },
  {
    id: 'r2',
    title: 'Alinhamento de Projeto 01',
    roomId: 'D',
    roomName: 'Sala de Reunião D',
    date: '2026-06-08',
    startTime: '08:00',
    endTime: '09:00',
    userName: 'Isabella Vargas',
    recurrence: 'Semanal',
    recurrenceEndDate: '2026-07-07',
    status: 'Confirmado',
  },
  // Past / Admin list
  { id: 'a1', title: 'Reunião Rápida', roomId: 'A', roomName: 'Sala de Reunião A', date: '2026-04-20', startTime: '15:09', endTime: '16:39', userName: 'Isabella Vargas', status: 'Confirmado' },
  { id: 'a2', title: 'Reunião Rápida', roomId: 'C', roomName: 'Sala de Reunião C', date: '2026-04-20', startTime: '15:09', endTime: '16:09', userName: 'Isabella Vargas', status: 'Confirmado' },
  { id: 'a3', title: 'Reunião Rápida', roomId: 'A', roomName: 'Sala de Reunião A', date: '2026-04-25', startTime: '10:41', endTime: '11:41', userName: 'Isabella Vargas', status: 'Confirmado' },
  { id: 'a4', title: 'Reunião Rápida', roomId: 'D', roomName: 'Sala de Reunião D', date: '2026-04-25', startTime: '11:06', endTime: '11:36', userName: 'Isabella Vargas', status: 'Confirmado' },
  { id: 'a5', title: 'Reunião Rápida', roomId: 'A', roomName: 'Sala de Reunião A', date: '2026-04-26', startTime: '07:45', endTime: '08:45', userName: 'Isabella Vargas', status: 'Confirmado' },
  { id: 'a6', title: 'Reunião Rápida', roomId: 'D', roomName: 'Sala de Reunião D', date: '2026-04-26', startTime: '09:00', endTime: '10:00', userName: 'Isabella Vargas', status: 'Confirmado' },
  { id: 'a7', title: 'Apresentação ao cliente X', roomId: 'B', roomName: 'Sala de Reunião B', date: '2026-04-27', startTime: '14:00', endTime: '15:30', userName: 'Isabella Vargas', status: 'Confirmado' },
  { id: 'a8', title: 'Kickoff de equipe', roomId: 'C', roomName: 'Sala de Reunião C', date: '2026-04-28', startTime: '09:00', endTime: '10:00', userName: 'Isabella Vargas', status: 'Confirmado' },
  { id: 'a9', title: 'Reunião Geral', roomId: 'B', roomName: 'Sala de Reunião B', date: '2026-04-28', startTime: '13:00', endTime: '14:00', userName: 'Isabella Vargas', status: 'Confirmado' },
  { id: 'a10', title: 'Alinhamento interno', roomId: 'A', roomName: 'Sala de Reunião A', date: '2026-04-29', startTime: '10:00', endTime: '11:00', userName: 'Isabella Vargas', status: 'Confirmado' },
  { id: 'a11', title: 'Reunião Rápida', roomId: 'D', roomName: 'Sala de Reunião D', date: '2026-04-30', startTime: '16:00', endTime: '16:30', userName: 'Isabella Vargas', status: 'Confirmado' },
  { id: 'a12', title: 'Coworking de equipe', roomId: 'C', roomName: 'Sala de Reunião C', date: '2026-05-05', startTime: '08:00', endTime: '12:00', userName: 'Isabella Vargas', status: 'Confirmado' },
  { id: 'a13', title: 'Sprint Planning', roomId: 'A', roomName: 'Sala de Reunião A', date: '2026-05-11', startTime: '09:00', endTime: '11:00', userName: 'Isabella Vargas', status: 'Confirmado' },
  { id: 'a14', title: 'Reunião com cliente Y', roomId: 'B', roomName: 'Sala de Reunião B', date: '2026-05-15', startTime: '14:00', endTime: '15:00', userName: 'Isabella Vargas', status: 'Confirmado' },
  { id: 'a15', title: 'Apresentação de proposta', roomId: 'A', roomName: 'Sala de Reunião A', date: '2026-05-20', startTime: '10:00', endTime: '11:30', userName: 'Isabella Vargas', status: 'Confirmado' },
  { id: 'a16', title: 'Reunião Rápida', roomId: 'D', roomName: 'Sala de Reunião D', date: '2026-05-25', startTime: '15:30', endTime: '16:30', userName: 'Isabella Vargas', status: 'Confirmado' },
  { id: 'a17', title: 'Revisão de projetos', roomId: 'C', roomName: 'Sala de Reunião C', date: '2026-05-28', startTime: '09:00', endTime: '10:00', userName: 'Isabella Vargas', status: 'Confirmado' },
  { id: 'a18', title: 'Reunião Rápida', roomId: 'B', roomName: 'Sala de Reunião B', date: '2026-06-01', startTime: '11:00', endTime: '12:00', userName: 'Isabella Vargas', status: 'Confirmado' },
  { id: 'a19', title: 'Alinhamento de Projeto 01', roomId: 'D', roomName: 'Sala de Reunião D', date: '2026-06-07', startTime: '08:00', endTime: '09:00', userName: 'Isabella Vargas', recurrence: 'Semanal', recurrenceEndDate: '2026-06-07', status: 'Confirmado' },
];

export function BookingProvider({ children }: { children: React.ReactNode }) {
  const [reservations, setReservations] = useState<Reservation[]>(() => {
    const saved = localStorage.getItem('fgmf_reservations');
    return saved ? JSON.parse(saved) : INITIAL_RESERVATIONS;
  });

  useEffect(() => {
    localStorage.setItem('fgmf_reservations', JSON.stringify(reservations));
  }, [reservations]);

  const isPastDateTime = (date: string, startTime: string): boolean => {
    if (date < SYSTEM_DATE) return true;
    if (date === SYSTEM_DATE && startTime < SYSTEM_TIME) return true;
    return false;
  };

  const checkCollision = (
    roomId: 'A' | 'B' | 'C' | 'D',
    date: string,
    startTime: string,
    endTime: string,
    excludeId?: string
  ): Reservation | null => {
    const parseTime = (t: string) => {
      const [h, m] = t.split(':').map(Number);
      return h * 60 + m;
    };

    const startNew = parseTime(startTime);
    const endNew = parseTime(endTime);

    for (const res of reservations) {
      if (res.id === excludeId) continue;
      if (res.status === 'Cancelado') continue;
      if (res.roomId !== roomId) continue;

      const timeOverlaps = () => {
        const startRes = parseTime(res.startTime);
        const endRes = parseTime(res.endTime);
        return startNew < endRes && startRes < endNew;
      };

      // 1. Direct date match
      if (res.date === date) {
        if (timeOverlaps()) return res;
      }

      // 2. Recurrence check
      if (res.recurrence) {
        const resDateStr = res.date;
        const targetDateStr = date;

        if (targetDateStr >= resDateStr) {
          if (!res.recurrenceEndDate || targetDateStr <= res.recurrenceEndDate) {
            let patternMatches = false;

            if (res.recurrence === 'Diária') {
              patternMatches = true;
            } else if (res.recurrence === 'Semanal') {
              const resDay = new Date(resDateStr + 'T00:00:00').getDay();
              const targetDay = new Date(targetDateStr + 'T00:00:00').getDay();
              patternMatches = resDay === targetDay;
            } else if (res.recurrence === 'Mensal') {
              const resDayOfMonth = new Date(resDateStr + 'T00:00:00').getDate();
              const targetDayOfMonth = new Date(targetDateStr + 'T00:00:00').getDate();
              patternMatches = resDayOfMonth === targetDayOfMonth;
            }

            if (patternMatches && timeOverlaps()) {
              return res;
            }
          }
        }
      }
    }
    return null;
  };

  const addReservation = (res: Omit<Reservation, 'id' | 'status'>): { success: boolean; error?: string } => {
    // Enforce "Cannot schedule in the past"
    if (isPastDateTime(res.date, res.startTime)) {
      return { success: false, error: 'Não é possível realizar reservas no passado.' };
    }

    // Enforce "No overlapping times"
    const collision = checkCollision(res.roomId, res.date, res.startTime, res.endTime);
    if (collision) {
      return { 
        success: false, 
        error: `Conflito de horário! Esta sala já está reservada para "${collision.title}" das ${collision.startTime} às ${collision.endTime}.`
      };
    }

    const newRes: Reservation = {
      ...res,
      id: `r-${Date.now()}`,
      status: 'Confirmado'
    };

    setReservations(prev => [newRes, ...prev]);
    return { success: true };
  };

  const cancelReservation = (id: string) => {
    setReservations(prev => prev.filter(res => res.id !== id));
  };

  return (
    <BookingContext.Provider value={{
      reservations,
      addReservation,
      cancelReservation,
      checkCollision,
      isPastDateTime
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

// Helper to format date strings for MyReservations
export function formatDateToPt(dateStr: string): string {
  const months = [
    'jan', 'fev', 'mar', 'abr', 'mai', 'jun',
    'jul', 'ago', 'set', 'out', 'nov', 'dez'
  ];
  
  // Format standard YYYY-MM-DD
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
