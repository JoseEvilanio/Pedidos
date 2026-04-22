import React, { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';

export default function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location]);

  return (
    <div className="app-container">
      <header className="mobile-top-bar">
        <div className="mobile-brand">
          <img src="/favicon.png" alt="ADD BB2" className="brand-logo" />
          <div>
            <h2 className="brand-title">ADD BB2</h2>
            <p className="brand-subtitle">Gestao de Pedidos</p>
          </div>
        </div>
        <button
          type="button"
          className="mobile-menu-btn"
          onClick={() => setIsSidebarOpen(true)}
          aria-label="Abrir menu lateral"
        >
          <Menu size={24} />
        </button>
      </header>

      <div
        className={`sidebar-overlay ${isSidebarOpen ? 'open' : ''}`}
        onClick={() => setIsSidebarOpen(false)}
      />

      <Sidebar isOpen={isSidebarOpen} closeSidebar={() => setIsSidebarOpen(false)} />

      <div className="main-wrapper">
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
