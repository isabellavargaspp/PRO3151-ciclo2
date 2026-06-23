const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function getToken(): string | null {
    return localStorage.getItem('token');
}

async function request(path: string, options: RequestInit = {}) {
    const token = getToken();
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${path}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Erro desconhecido' }));
        throw { status: response.status, message: error.detail || 'Erro na requisição' };
    }

    if (response.status === 204) return null;
    return response.json();
}

export async function apiRegister(name: string, email: string, password: string, role = 'employee') {
    return request('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password, role }),
    });
}

export async function apiLogin(email: string, password: string) {
    const data = await request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    });
    localStorage.setItem('token', data.access_token);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data;
}

export function apiLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');
}

export function getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
}

export async function apiGetRooms() {
    return request('/rooms/');
}

export async function apiGetAvailability(date: string) {
    return request(`/rooms/availability?date=${date}`);
}

export async function apiCreateRoom(name: string, capacity: number, floor?: string, description?: string) {
    return request('/rooms/', {
        method: 'POST',
        body: JSON.stringify({ name, capacity, floor, description }),
    });
}

export async function apiDeleteRoom(roomId: string) {
    return request(`/rooms/${roomId}`, { method: 'DELETE' });
}

export async function apiGetMyReservations() {
    return request('/reservations/my');
}

export async function apiCreateReservation(
    roomId: string,
    title: string,
    startTime: string,
    endTime: string
) {
    return request('/reservations/', {
        method: 'POST',
        body: JSON.stringify({
            room_id: roomId,
            title,
            start_time: startTime,
            end_time: endTime,
        }),
    });
}

export async function apiCancelReservation(reservationId: string) {
    return request(`/reservations/${reservationId}`, { method: 'DELETE' });
}
