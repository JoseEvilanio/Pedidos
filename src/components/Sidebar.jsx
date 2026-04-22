import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, ShoppingBag, PieChart, X } from 'lucide-react';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/departments', label: 'Departamentos', icon: Users },
  { to: '/orders', label: 'Pedidos', icon: ShoppingBag },
  { to: '/reports', label: 'Relatorios', icon: PieChart },
];

export default function Sidebar({ isOpen, closeSidebar }) {
  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-brand">
        <div className="brand-core">
          <img src="/logo.jpg" alt="ADD BB2" className="brand-logo" />
          <div>
            <h2 className="brand-title">ADD BB2</h2>
            <p className="brand-subtitle">Gestao de Pedidos</p>
          </div>
        </div>
        <button
          type="button"
          className="mobile-menu-btn sidebar-close"
          onClick={closeSidebar}
          aria-label="Fechar menu lateral"
        >
          <X size={18} />
        </button>
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map(item => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-footnote">Painel Administrativo</div>
    </aside>
  );
}
