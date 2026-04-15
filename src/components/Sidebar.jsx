import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, ShoppingBag, PieChart, X } from 'lucide-react';

export default function Sidebar({ isOpen, closeSidebar }) {
  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', overflow: 'hidden', flexShrink: 0, border: '1px solid var(--border)' }}>
            <img src="/logo.jpg" alt="SysCamisas Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>ADD BB2</h2>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Gestão de Pedidos</span>
          </div>
        </div>
        <button 
          className="mobile-menu-btn d-md-none" 
          onClick={closeSidebar}
          style={{ padding: '0.5rem', display: window.innerWidth <= 768 ? 'block' : 'none' }}
        >
          <X size={24} />
        </button>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <NavLink to="/" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'} end>
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/departments" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>
          <Users size={20} />
          <span>Departamentos</span>
        </NavLink>
        <NavLink to="/orders" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>
          <ShoppingBag size={20} />
          <span>Pedidos</span>
        </NavLink>
        <NavLink to="/reports" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>
          <PieChart size={20} />
          <span>Relatórios</span>
        </NavLink>
      </nav>
    </div>
  );
}
