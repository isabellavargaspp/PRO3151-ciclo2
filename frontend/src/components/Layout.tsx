import { Outlet } from 'react-router-dom';
import { Sidebar as SidebarIcon } from 'lucide-react';
import { Sidebar } from './Sidebar';
import './Layout.css';

interface LayoutProps {
  onLogout?: () => void;
}

export function Layout({ onLogout }: LayoutProps) {
  return (
    <div className="layout-container">
      <Sidebar onLogout={onLogout} />
      <div className="layout-main">
        <header className="layout-header">
          <div className="header-left">
            <SidebarIcon size={18} className="sidebar-toggle-icon" />
            <span className="header-title">Reserva de Salas</span>
          </div>
        </header>
        <main className="layout-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
