import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import Sidebar from './Sidebar';

export default function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  // Close sidebar on route change for mobile users
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location]);

  return (
    <div className="app-container">
      {/* Mobile Top Bar */}
      <div className="mobile-top-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border)' }}>
            <img src="/logo.jpg" alt="SysCamisas Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>SysCamisas</h2>
        </div>
        <button className="mobile-menu-btn" onClick={() => setIsSidebarOpen(true)}>
          <Menu size={28} />
        </button>
      </div>

      {/* Sidebar Overlay */}
      <div 
        className={`sidebar-overlay ${isSidebarOpen ? 'open' : ''}`} 
        onClick={() => setIsSidebarOpen(false)}
      ></div>

      {/* Actual Sidebar Component wrapped to control its classes externally or pass props */}
      <Sidebar isOpen={isSidebarOpen} closeSidebar={() => setIsSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="main-wrapper">
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
