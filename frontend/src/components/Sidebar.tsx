import { Link, useLocation } from 'react-router-dom';
import { LayoutGrid, Calendar, CalendarCheck, BookOpen, Settings, LogOut } from 'lucide-react';
import './Sidebar.css';

interface SidebarProps {
  onLogout?: () => void;
}

export function Sidebar({ onLogout }: SidebarProps) {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <aside className="sidebar">
      <div className="sidebar-logo-section">
        <div className="fgmf-logo">
          <span>·</span><span>F</span><span>·</span>
          <span>G</span><span>·</span><span>·</span>
          <span>·</span><span>M</span><span>F</span>
        </div>
        <div className="sidebar-logo-text">
          <div className="logo-title">FGMF Arquitetos</div>
          <div className="logo-subtitle">Reserva de Salas</div>
        </div>
      </div>

      <div className="sidebar-nav">
        <div className="nav-section-title">Navegação</div>
        <ul>
          <li>
            <Link to="/dashboard" className={isActive('/dashboard') ? 'active' : ''}>
              <LayoutGrid size={20} />
              <span>Painel</span>
            </Link>
          </li>
          <li>
            <Link to="/calendar" className={isActive('/calendar') ? 'active' : ''}>
              <Calendar size={20} />
              <span>Calendário</span>
            </Link>
          </li>
          <li>
            <Link to="/my-reservations" className={isActive('/my-reservations') ? 'active' : ''}>
              <CalendarCheck size={20} />
              <span>Minhas Reservas</span>
            </Link>
          </li>
          <li>
            <Link to="/rooms" className={isActive('/rooms') ? 'active' : ''}>
              <BookOpen size={20} />
              <span>Salas</span>
            </Link>
          </li>
        </ul>

        <div className="nav-section-title adm">Administração</div>
        <ul>
          <li>
            <Link to="/admin" className={isActive('/admin') ? 'active' : ''}>
              <Settings size={20} />
              <span>Administração</span>
            </Link>
          </li>
        </ul>
      </div>

      <div className="sidebar-footer">
        <div className="user-profile">
          <div className="user-name">Isabella Vargas</div>
          <div className="user-email-role">admin@studio.com · Admin</div>
        </div>
        <button onClick={onLogout} className="logout-btn">
          <LogOut size={18} />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );
}
