import React from 'react';
import { useStore } from '../store/useStore';
import { Shirt, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';

export default function Dashboard() {
  const { orders, installments } = useStore();

  const totalShirtsSizes = orders.reduce((acc, order) => {
    Object.entries(order.items).forEach(([size, qty]) => {
      acc[size] = (acc[size] || 0) + (parseInt(qty) || 0);
    });
    return acc;
  }, {});

  const totalShirts = Object.values(totalShirtsSizes).reduce((a, b) => a + b, 0);

  const totalPaid = installments.filter(i => i.isPaid).reduce((acc, curr) => acc + curr.amount, 0);
  const totalPending = installments.filter(i => !i.isPaid).reduce((acc, curr) => acc + curr.amount, 0);
  const totalAmount = totalPaid + totalPending;

  return (
    <div>
      <h1 className="title">Dashboard</h1>
      
      <div className="grid-cards" style={{ marginBottom: '2rem' }}>
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '1rem', background: '#e0e7ff', color: '#4f46e5', borderRadius: '50%' }}>
            <Shirt size={24} />
          </div>
          <div>
            <div className="subtitle" style={{ fontSize: '0.875rem' }}>Total de Camisas</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{totalShirts}</div>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '1rem', background: '#d1fae5', color: '#059669', borderRadius: '50%' }}>
            <DollarSign size={24} />
          </div>
          <div>
            <div className="subtitle" style={{ fontSize: '0.875rem' }}>Arrecadado</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>R$ {totalPaid.toFixed(2)}</div>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '1rem', background: '#fee2e2', color: '#dc2626', borderRadius: '50%' }}>
            <AlertCircle size={24} />
          </div>
          <div>
            <div className="subtitle" style={{ fontSize: '0.875rem' }}>Pendente</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>R$ {totalPending.toFixed(2)}</div>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '1rem', background: '#fef3c7', color: '#d97706', borderRadius: '50%' }}>
            <TrendingUp size={24} />
          </div>
          <div>
            <div className="subtitle" style={{ fontSize: '0.875rem' }}>Total Projetado</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>R$ {totalAmount.toFixed(2)}</div>
          </div>
        </div>
      </div>

      <div className="glass-card" style={{ marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>Camisas por Tamanho (Geral)</h2>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          {['P', 'M', 'G', 'GG', 'Babylook'].map(size => (
            <div key={size} style={{ background: 'var(--background)', padding: '1rem 2rem', borderRadius: 'var(--radius-md)', textAlign: 'center', flex: 1, minWidth: '100px' }}>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary)' }}>{totalShirtsSizes[size] || 0}</div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{size}</div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
