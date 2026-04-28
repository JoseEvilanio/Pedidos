import React from 'react';
import { useStore } from '../store/useStore';
import { Shirt, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';

const SIZE_ORDER = ['PP', 'P', 'M', 'G', 'GG', 'EXG', 'PP Babylook', 'P Babylook', 'M Babylook', 'G Babylook', 'GG Babylook', 'EXG Babylook', 'Sob Medida'];
const brl = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

export default function Dashboard() {
  const { orders, installments } = useStore();

  const totalShirtsSizes = orders.reduce((acc, order) => {
    Object.entries(order.items || {}).forEach(([size, qty]) => {
      if (size !== 'medidasSobMedida') {
        acc[size] = (acc[size] || 0) + (parseInt(qty, 10) || 0);
      }
    });
    return acc;
  }, {});

  const totalShirts = Object.values(totalShirtsSizes).reduce((sum, qty) => sum + qty, 0);
  const totalPaid = installments.filter(inst => inst.isPaid).reduce((sum, inst) => sum + inst.amount, 0);
  const totalPending = installments.filter(inst => !inst.isPaid).reduce((sum, inst) => sum + inst.amount, 0);
  const totalAmount = totalPaid + totalPending;

  const metrics = [
    {
      label: 'Total de Camisas',
      value: totalShirts,
      icon: Shirt,
      iconStyle: { background: 'rgba(13, 94, 166, 0.14)', color: '#0d5ea6' },
    },
    {
      label: 'Arrecadado',
      value: brl.format(totalPaid),
      icon: DollarSign,
      iconStyle: { background: 'rgba(15, 118, 110, 0.14)', color: '#0f766e' },
    },
    {
      label: 'Pendente',
      value: brl.format(totalPending),
      icon: AlertCircle,
      iconStyle: { background: 'rgba(199, 55, 75, 0.12)', color: '#c7374b' },
    },
    {
      label: 'Total Projetado',
      value: brl.format(totalAmount),
      icon: TrendingUp,
      iconStyle: { background: 'rgba(183, 121, 31, 0.14)', color: '#b7791f' },
    },
  ];

  return (
    <div className="page-shell">
      <header className="page-header">
        <div className="page-title-group">
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">
            Visao geral de vendas, status financeiro e distribuicao por tamanho.
          </p>
        </div>
        <span className="page-tag">{orders.length} pedido(s) registrado(s)</span>
      </header>

      <section className="grid-cards metric-grid">
        {metrics.map(metric => {
          const Icon = metric.icon;
          return (
            <article key={metric.label} className="glass-card metric-card">
              <span className="metric-icon" style={metric.iconStyle}>
                <Icon size={22} />
              </span>
              <div>
                <p className="metric-label">{metric.label}</p>
                <p className="metric-value">{metric.value}</p>
              </div>
            </article>
          );
        })}
      </section>

      <section className="glass-card">
        <h2 style={{ marginBottom: '0.85rem' }}>Camisas por Tamanho</h2>
        <div className="size-grid">
          {SIZE_ORDER.map(size => (
            <div key={size} className="size-tile">
              <div className="size-value">{totalShirtsSizes[size] || 0}</div>
              <div className="size-label">{size}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
