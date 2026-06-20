import { useState } from 'react';
import { Trash2, Pencil, Power, Plus, UserCheck, Crown, X, UserPlus } from 'lucide-react';
import './Admin.css';
import { useBooking, formatDateToPt } from '../context/BookingContext';

/* ──────────────────────────────────────────────
   Types
────────────────────────────────────────────── */
type AdminTab = 'analises' | 'reservas' | 'salas' | 'usuarios' | 'empresa';
type RoomId = 'A' | 'B' | 'C' | 'D';

interface RoomData {
  id: RoomId;
  name: string;
  capacity: string;
  location: string;
  schedule: string;
  resources: string[];
  active: boolean;
}

interface AuthorizedEmail {
  id: string;
  email: string;
}

interface RegisteredUser {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
}

/* ──────────────────────────────────────────────
   Mock Data
────────────────────────────────────────────── */
const ROOM_COLORS: Record<RoomId, string> = {
  A: 'var(--color-room-a)',
  B: 'var(--color-room-b)',
  C: 'var(--color-room-c)',
  D: 'var(--color-room-d)',
};

const ROOMS_DATA: RoomData[] = [
  { id: 'A', name: 'Sala de Reunião A', capacity: '12p', location: '2º Andar', schedule: '08:00–20:00', resources: ['Projetor', 'Quadro Branco', 'Videoconferência', 'Serviço de Café'], active: true },
  { id: 'B', name: 'Sala de Reunião B', capacity: '6p', location: '2º Andar', schedule: '08:00–20:00', resources: ['Quadro Branco', 'Videoconferência'], active: true },
  { id: 'C', name: 'Sala de Reunião C', capacity: '20p', location: '1º Andar', schedule: '08:00–20:00', resources: ['Projetor', 'Quadro Branco', 'Videoconferência', 'Serviço de Café'], active: true },
  { id: 'D', name: 'Sala de Reunião D', capacity: '4p', location: '1º Andar', schedule: '08:00–20:00', resources: ['Quadro Branco'], active: true },
];

const EMAILS_DATA: AuthorizedEmail[] = [
  { id: 'e1', email: 'admin@studio.com' },
  { id: 'e2', email: 'architect@studio.com' },
  { id: 'e3', email: 'designer@studio.com' },
  { id: 'e4', email: 'director@studio.com' },
  { id: 'e5', email: 'intern@studio.com' },
  { id: 'e6', email: 'pm@studio.com' },
];

const USERS_DATA: RegisteredUser[] = [
  { id: 'u1', name: 'Isabella Vargas', email: 'admin@studio.com', isAdmin: true },
  { id: 'u2', name: 'Kevyn Andrade', email: 'architect@studio.com', isAdmin: false },
];

/* ──────────────────────────────────────────────
   Bar chart (pure CSS)
────────────────────────────────────────────── */
interface BarChartProps {
  data: { label: string; value: number; color: string }[];
  title: string;
  subtitle: string;
  xLabels?: string[];
}

function BarChart({ data, title, subtitle }: BarChartProps) {
  const maxVal = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="chart-card">
      <div className="chart-title">{title}</div>
      <div className="chart-subtitle">{subtitle}</div>
      <div className="bar-chart">
        <div className="bar-y-axis">
          {[maxVal, Math.round(maxVal * 0.75), Math.round(maxVal * 0.5), Math.round(maxVal * 0.25), 0].map((v) => (
            <span key={v} className="bar-y-label">{v}</span>
          ))}
        </div>
        <div className="bar-columns">
          {data.map((item) => (
            <div key={item.label} className="bar-column">
              <div className="bar-fill-wrapper">
                <div
                  className="bar-fill"
                  style={{
                    height: `${(item.value / maxVal) * 100}%`,
                    backgroundColor: item.color,
                  }}
                />
              </div>
              <span className="bar-x-label">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   Tabs
────────────────────────────────────────────── */

/** ── Análises ── */
function AnalisesTab() {
  const { reservations } = useBooking();
  const activeReservations = reservations.filter(r => r.status !== 'Cancelado');

  const roomUsage = [
    { label: 'Sala de Reunião A', value: activeReservations.filter(r => r.roomId === 'A').length, color: ROOM_COLORS.A },
    { label: 'Sala de Reunião B', value: activeReservations.filter(r => r.roomId === 'B').length, color: ROOM_COLORS.B },
    { label: 'Sala de Reunião C', value: activeReservations.filter(r => r.roomId === 'C').length, color: ROOM_COLORS.C },
    { label: 'Sala de Reunião D', value: activeReservations.filter(r => r.roomId === 'D').length, color: ROOM_COLORS.D },
  ];

  const hours = Array.from({ length: 12 }, (_, i) => `${i + 8}:00`);
  const hourUsage = hours.map(h => {
    const hourNum = parseInt(h.split(':')[0], 10);
    const count = activeReservations.filter(r => {
      const [startH] = r.startTime.split(':').map(Number);
      return startH === hourNum;
    }).length;

    return {
      label: h,
      value: count,
      color: 'var(--color-primary)'
    };
  });

  return (
    <div>
      <div className="analises-meta">Visão Mensal · Junho De 2026 (Reinicia Todo Dia 1°)</div>
      <div className="analises-grid">
        <BarChart
          data={roomUsage}
          title="Uso das Salas"
          subtitle="Reservas no mês atual"
        />
        <BarChart
          data={hourUsage}
          title="Horários de Pico"
          subtitle="Distribuição por hora no mês atual"
        />
      </div>
    </div>
  );
}

/** ── Reservas ── */
function ReservasTab() {
  const { reservations, cancelReservation } = useBooking();

  const activeReservations = reservations
    .filter(r => r.status !== 'Cancelado')
    .map(r => ({
      id: r.id,
      title: r.title,
      room: r.roomName,
      date: formatDateToPt(r.date),
      timeRange: `${r.startTime}–${r.endTime}`,
      recurrence: r.recurrence,
      organizer: r.userName,
      status: r.status
    }));

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja cancelar esta reserva?')) {
      cancelReservation(id);
    }
  };

  return (
    <div className="admin-table-section">
      <h3 className="admin-table-title">Todas as Reservas</h3>
      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Título</th>
              <th>Sala</th>
              <th>Data inicial</th>
              <th>Horário</th>
              <th>Recorrência</th>
              <th>Organizador</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {activeReservations.map((r) => (
              <tr key={r.id}>
                <td>{r.title}</td>
                <td>{r.room}</td>
                <td>{r.date}</td>
                <td>{r.timeRange}</td>
                <td>
                  {r.recurrence ? (
                    <span className="recurrence-pill">{r.recurrence}</span>
                  ) : (
                    <span className="em-dash">—</span>
                  )}
                </td>
                <td>{r.organizer}</td>
                <td>
                  <span className={`status-pill ${r.status === 'Confirmado' ? 'confirmed' : 'pending'}`}>{r.status}</span>
                </td>
                <td>
                  <button 
                    className="table-action-btn delete-action" 
                    title="Cancelar Reserva"
                    onClick={() => handleDelete(r.id)}
                    style={{ color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    <Trash2 size={15} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/** ── Salas (admin) ── */
function SalasAdminTab() {
  const [rooms, setRooms] = useState<RoomData[]>(ROOMS_DATA);
  const [showNewModal, setShowNewModal] = useState(false);

  const toggleActive = (id: RoomId) => {
    setRooms((prev) => prev.map((r) => r.id === id ? { ...r, active: !r.active } : r));
  };

  const handleDelete = (id: RoomId) => {
    if (window.confirm('Tem certeza que deseja remover esta sala?')) {
      setRooms((prev) => prev.filter((r) => r.id !== id));
    }
  };

  return (
    <div className="admin-table-section">
      <div className="admin-table-header-row">
        <div>
          <h3 className="admin-table-title">Salas cadastradas</h3>
          <p className="admin-table-desc">Crie, edite e gerencie as salas e seus recursos.</p>
        </div>
        <button id="new-room-btn" className="btn-primary admin-new-btn" onClick={() => setShowNewModal(true)}>
          <Plus size={16} /> Nova sala
        </button>
      </div>

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Sala</th>
              <th>Capacidade</th>
              <th>Localização</th>
              <th>Horário</th>
              <th>Recursos</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {rooms.map((room) => (
              <tr key={room.id}>
                <td>
                  <span className="room-dot-cell" style={{ background: ROOM_COLORS[room.id] }} />
                  {room.name}
                </td>
                <td>{room.capacity}</td>
                <td>{room.location}</td>
                <td>{room.schedule}</td>
                <td>
                  <div className="resource-tags-sm">
                    {room.resources.map((res) => (
                      <span key={res} className="resource-tag-sm">{res}</span>
                    ))}
                  </div>
                </td>
                <td>
                  <div className="table-actions">
                    <button className="table-action-btn" title="Editar" id={`edit-room-${room.id}`}>
                      <Pencil size={15} />
                    </button>
                    <button
                      className={`table-action-btn ${room.active ? 'active-toggle' : 'inactive-toggle'}`}
                      title={room.active ? 'Desativar' : 'Ativar'}
                      id={`toggle-room-${room.id}`}
                      onClick={() => toggleActive(room.id)}
                    >
                      <Power size={15} />
                    </button>
                    <button
                      className="table-action-btn delete-action"
                      title="Remover"
                      id={`delete-room-${room.id}`}
                      onClick={() => handleDelete(room.id)}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showNewModal && <NewRoomModal onClose={() => setShowNewModal(false)} />}
    </div>
  );
}

/** ── Nova sala modal ── */
function NewRoomModal({ onClose }: { onClose: () => void }) {
  const COLORS = ['#f96915', '#111827', '#3b82f6', '#22c55e', '#a855f7', '#ef4444', '#f59e0b', '#14b8a6', '#ec4899'];
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [resources, setResources] = useState<string[]>([]);
  const [customRes, setCustomRes] = useState('');
  const PRESET_RES = ['Projetor', 'Quadro Branco', 'Serviço de Café', 'Videoconferência'];

  const togglePreset = (res: string) => {
    setResources((prev) => prev.includes(res) ? prev.filter((r) => r !== res) : [...prev, res]);
  };
  const addCustom = () => {
    if (customRes.trim()) {
      setResources((prev) => [...prev, customRes.trim()]);
      setCustomRes('');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Nova sala</h2>
          <button id="new-room-modal-close" className="modal-close-btn" onClick={onClose}><X size={20} /></button>
        </div>
        <div className="modal-form">
          <div className="form-group">
            <label>Nome *</label>
            <input id="new-room-name" type="text" className="form-input" placeholder="Ex.: Sala Atelier" />
          </div>
          <div className="form-row-2">
            <div className="form-group">
              <label>Capacidade *</label>
              <input id="new-room-capacity" type="number" className="form-input" defaultValue={6} min={1} />
            </div>
            <div className="form-group">
              <label>Andar / Localização</label>
              <input id="new-room-floor" type="text" className="form-input" placeholder="Ex.: 2º andar" />
            </div>
          </div>
          <div className="form-row-2">
            <div className="form-group">
              <label>Início do expediente</label>
              <input id="new-room-start" type="time" className="form-input" defaultValue="08:00" />
            </div>
            <div className="form-group">
              <label>Fim do expediente</label>
              <input id="new-room-end" type="time" className="form-input" defaultValue="20:00" />
            </div>
          </div>
          <div className="form-group">
            <label>Cor de identificação</label>
            <div className="color-palette">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  id={`color-${c.slice(1)}`}
                  className={`color-swatch ${selectedColor === c ? 'selected' : ''}`}
                  style={{ background: c }}
                  onClick={() => setSelectedColor(c)}
                />
              ))}
            </div>
          </div>
          <div className="form-group">
            <label>Recursos / Equipamentos</label>
            {resources.length === 0 && (
              <span className="no-resources-text">Nenhum recurso adicionado.</span>
            )}
            <div className="custom-res-row">
              <input
                id="new-room-custom-resource"
                type="text"
                className="form-input"
                placeholder="Ex.: Smart TV"
                value={customRes}
                onChange={(e) => setCustomRes(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addCustom()}
              />
              <button id="add-resource-btn" className="add-resource-btn" onClick={addCustom} type="button">
                <Plus size={18} />
              </button>
            </div>
            <div className="preset-res-row">
              {PRESET_RES.map((res) => (
                <button
                  key={res}
                  type="button"
                  id={`preset-res-${res.replace(/\s/g, '-')}`}
                  className={`preset-res-btn ${resources.includes(res) ? 'selected' : ''}`}
                  onClick={() => togglePreset(res)}
                >
                  + {res}
                </button>
              ))}
            </div>
          </div>
          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input id="new-room-active" type="checkbox" defaultChecked />
              Sala ativa (disponível para reservas)
            </label>
          </div>
          <div className="modal-footer">
            <button id="new-room-cancel" className="btn-secondary" onClick={onClose}>Cancelar</button>
            <button id="new-room-save" className="btn-primary modal-submit" onClick={onClose}>Salvar</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/** ── Usuários ── */
function UsuariosTab() {
  const [emails, setEmails] = useState<AuthorizedEmail[]>(EMAILS_DATA);
  const [users, setUsers] = useState<RegisteredUser[]>(USERS_DATA);
  const [newEmail, setNewEmail] = useState('');

  const addEmail = () => {
    const trimmed = newEmail.trim();
    if (!trimmed || emails.some((e) => e.email === trimmed)) return;
    setEmails((prev) => [...prev, { id: `e${Date.now()}`, email: trimmed }]);
    setNewEmail('');
  };

  const removeEmail = (id: string) => {
    setEmails((prev) => prev.filter((e) => e.id !== id));
  };

  const toggleAdmin = (id: string) => {
    setUsers((prev) => prev.map((u) => u.id === id ? { ...u, isAdmin: !u.isAdmin } : u));
  };

  return (
    <div className="usuarios-grid">
      {/* Authorized emails panel */}
      <div className="usuarios-panel">
        <div className="usuarios-panel-header">
          <UserCheck size={18} />
          <div>
            <h3 className="usuarios-panel-title">E-mails autorizados</h3>
            <p className="usuarios-panel-desc">Apenas pessoas com e-mail nesta lista podem criar conta.</p>
          </div>
        </div>
        <div className="email-input-row">
          <input
            id="new-email-input"
            type="email"
            className="form-input"
            placeholder="email@studio.com"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addEmail()}
          />
          <button id="add-email-btn" className="add-email-btn" onClick={addEmail} title="Adicionar e-mail">
            <UserPlus size={18} />
          </button>
        </div>
        <div className="email-list">
          {emails.map((e) => (
            <div key={e.id} className="email-item">
              <span>{e.email}</span>
              <button
                id={`remove-email-${e.id}`}
                className="table-action-btn delete-action"
                onClick={() => removeEmail(e.id)}
                title="Remover e-mail"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Registered users panel */}
      <div className="usuarios-panel">
        <div className="usuarios-panel-header">
          <Crown size={18} />
          <div>
            <h3 className="usuarios-panel-title">Usuários cadastrados</h3>
            <p className="usuarios-panel-desc">Promova ou remova permissões de administrador.</p>
          </div>
        </div>
        <div className="user-list">
          {users.map((u) => (
            <div key={u.id} className="user-item">
              <div className="user-info">
                <span className="user-name">{u.name}</span>
                <span className="user-email">{u.email}</span>
              </div>
              <button
                id={`toggle-admin-${u.id}`}
                className={`admin-toggle-btn ${u.isAdmin ? 'is-admin' : ''}`}
                onClick={() => toggleAdmin(u.id)}
              >
                {u.isAdmin ? 'Admin' : 'Tornar admin'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** ── Empresa ── */
function EmpresaTab() {
  return (
    <div className="empresa-form">
      <div className="empresa-section">
        <h3 className="empresa-section-title">Identidade da empresa</h3>

        <div className="form-group">
          <label>Nome da empresa</label>
          <input id="company-name" type="text" className="form-input" defaultValue="FGMF Arquitetos" />
        </div>
        <div className="form-group">
          <label>Slogan / descrição</label>
          <input id="company-slogan" type="text" className="form-input" defaultValue="Reserva de Salas" />
        </div>
        <div className="form-group">
          <label>Logo</label>
          <div className="logo-row">
            <div className="logo-preview">
              <span>·F·</span>
              <span>G··</span>
              <span>·MF</span>
            </div>
            <button id="change-logo-btn" className="btn-secondary logo-action-btn">↑ Trocar logo</button>
            <button id="remove-logo-btn" className="btn-secondary logo-action-btn">✕ Remover</button>
          </div>
        </div>
        <div className="form-row-2">
          <div className="form-group">
            <label>Cor primária</label>
            <div className="color-input-row">
              <div className="color-swatch-preview" style={{ background: '#f96915' }} />
              <input id="primary-color-input" type="text" className="form-input" defaultValue="#f96915" />
            </div>
          </div>
          <div className="form-group">
            <label>Cor de destaque (opcional)</label>
            <div className="color-input-row">
              <div className="color-swatch-preview" style={{ background: '#e5e7eb' }} />
              <input id="accent-color-input" type="text" className="form-input" placeholder="Ex.: #f5f5f5" />
            </div>
          </div>
        </div>
      </div>

      <div className="empresa-section">
        <h3 className="empresa-section-title">Configurações gerais</h3>
        <div className="form-row-2">
          <div className="form-group">
            <label>Horizonte máximo de reservas (semanas)</label>
            <input id="max-weeks" type="number" className="form-input" defaultValue={26} min={1} />
          </div>
          <div className="form-group">
            <label>Granularidade dos horários (minutos)</label>
            <input id="time-granularity" type="number" className="form-input" defaultValue={30} min={15} step={15} />
          </div>
        </div>
        <div className="form-row-2">
          <div className="form-group">
            <label>Horário padrão de início</label>
            <input id="default-start" type="time" className="form-input" defaultValue="08:00" />
          </div>
          <div className="form-group">
            <label>Horário padrão de término</label>
            <input id="default-end" type="time" className="form-input" defaultValue="20:00" />
          </div>
        </div>
      </div>

      <div className="empresa-save-row">
        <button id="save-empresa-btn" className="btn-primary empresa-save-btn">Salvar configurações</button>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   Main Admin Component
────────────────────────────────────────────── */
export function Admin() {
  const [activeTab, setActiveTab] = useState<AdminTab>('analises');

  const TABS: { id: AdminTab; label: string }[] = [
    { id: 'analises', label: 'Análises' },
    { id: 'reservas', label: 'Reservas' },
    { id: 'salas', label: 'Salas' },
    { id: 'usuarios', label: 'Usuários' },
    { id: 'empresa', label: 'Empresa' },
  ];

  return (
    <div className="admin-page">
      <h1 className="admin-title">Painel Administrativo</h1>

      <div className="admin-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            id={`admin-tab-${tab.id}`}
            className={`admin-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="admin-content">
        {activeTab === 'analises' && <AnalisesTab />}
        {activeTab === 'reservas' && <ReservasTab />}
        {activeTab === 'salas' && <SalasAdminTab />}
        {activeTab === 'usuarios' && <UsuariosTab />}
        {activeTab === 'empresa' && <EmpresaTab />}
      </div>
    </div>
  );
}
