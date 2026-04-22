import React, { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import {
  ShoppingBag, ChevronDown, ChevronUp, Users, Filter, Plus, X,
  CheckCircle, Clock, CreditCard, DollarSign,
} from 'lucide-react';

const SIZES = ['P', 'M', 'G', 'GG', 'EXG', 'Babylook', 'Sob Medida'];
const SHIRT_PRICE = 120;

const SIZE_COLORS = {
  P:            { bg: '#EDE9FE', text: '#5B21B6', border: '#C4B5FD' },
  M:            { bg: '#DBEAFE', text: '#1D4ED8', border: '#93C5FD' },
  G:            { bg: '#D1FAE5', text: '#065F46', border: '#6EE7B7' },
  GG:           { bg: '#FEF3C7', text: '#92400E', border: '#FCD34D' },
  EXG:          { bg: '#FFEDD5', text: '#C2410C', border: '#FDBA74' },
  Babylook:     { bg: '#FCE7F3', text: '#9D174D', border: '#F9A8D4' },
  'Sob Medida': { bg: '#E0E7FF', text: '#3730A3', border: '#A5B4FC' },
};

function SizeBadge({ size, qty }) {
  if (!qty || qty === 0) return null;
  const c = SIZE_COLORS[size];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
      padding: '0.2rem 0.6rem', borderRadius: '999px',
      fontSize: '0.78rem', fontWeight: 700,
      background: c.bg, color: c.text, border: `1px solid ${c.border}`,
      whiteSpace: 'nowrap',
    }}>
      {size} <span style={{ opacity: 0.8 }}>×{qty}</span>
    </span>
  );
}

// ─── Installment Row ────────────────────────────────────────────────────────

function InstallmentRow({ inst, orderId, onPay }) {
  const [customValue, setCustomValue] = useState('');
  const [paying, setPaying] = useState(false);
  const [inputVisible, setInputVisible] = useState(false);

  const handlePay = async () => {
    const val = parseFloat(customValue.replace(',', '.'));
    if (!val || val <= 0) return alert('Informe um valor válido para pagamento.');
    setPaying(true);
    await onPay(orderId, val);
    setPaying(false);
    setCustomValue('');
    setInputVisible(false);
  };

  const dueDateStr = inst.dueDate
    ? new Date(inst.dueDate).toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
    : '-';

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap',
      padding: '0.6rem 0.9rem',
      borderRadius: '0.6rem',
      background: inst.isPaid ? 'rgba(16,185,129,0.06)' : 'rgba(79,70,229,0.04)',
      border: `1px solid ${inst.isPaid ? 'rgba(16,185,129,0.2)' : 'rgba(79,70,229,0.12)'}`,
      transition: 'all 0.2s',
    }}>
      {/* Parcela nº */}
      <span style={{
        fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)',
        minWidth: 28, textAlign: 'center',
      }}>
        {inst.index}ª
      </span>

      {/* Valor */}
      <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)', minWidth: 80 }}>
        R$ {parseFloat(inst.amount).toFixed(2).replace('.', ',')}
      </span>

      {/* Vencimento */}
      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', flex: 1 }}>
        {dueDateStr}
      </span>

      {/* Status */}
      {inst.isPaid ? (
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
          padding: '0.2rem 0.7rem', borderRadius: '999px',
          background: '#D1FAE5', color: '#065F46', fontSize: '0.75rem', fontWeight: 700,
        }}>
          <CheckCircle size={12} /> Pago
        </span>
      ) : (
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
          padding: '0.2rem 0.7rem', borderRadius: '999px',
          background: '#FEF3C7', color: '#92400E', fontSize: '0.75rem', fontWeight: 700,
        }}>
          <Clock size={12} /> Pendente
        </span>
      )}

      {/* Ação de pagamento */}
      {!inst.isPaid && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          {inputVisible ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>R$</span>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder={parseFloat(inst.amount).toFixed(2)}
                  value={customValue}
                  onChange={e => setCustomValue(e.target.value)}
                  style={{
                    width: 90, padding: '0.3rem 0.5rem', borderRadius: '0.4rem',
                    border: '1.5px solid var(--primary)', fontSize: '0.85rem',
                    outline: 'none', background: 'var(--card-bg)', color: 'var(--text-main)',
                    fontWeight: 600,
                  }}
                  autoFocus
                  onKeyDown={e => { if (e.key === 'Enter') handlePay(); if (e.key === 'Escape') setInputVisible(false); }}
                />
              </div>
              <button
                onClick={handlePay}
                disabled={paying}
                style={{
                  padding: '0.3rem 0.75rem', borderRadius: '0.4rem', border: 'none',
                  background: 'var(--primary)', color: 'white', fontWeight: 700,
                  fontSize: '0.78rem', cursor: 'pointer', opacity: paying ? 0.6 : 1,
                  transition: 'opacity 0.2s',
                }}
              >
                {paying ? '...' : 'Confirmar'}
              </button>
              <button
                onClick={() => { setInputVisible(false); setCustomValue(''); }}
                style={{
                  padding: '0.3rem 0.6rem', borderRadius: '0.4rem', border: '1px solid var(--border)',
                  background: 'transparent', color: 'var(--text-muted)', fontWeight: 600,
                  fontSize: '0.78rem', cursor: 'pointer',
                }}
              >
                <X size={12} />
              </button>
            </>
          ) : (
            <button
              onClick={() => setInputVisible(true)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                padding: '0.3rem 0.75rem', borderRadius: '0.4rem', border: 'none',
                background: 'linear-gradient(135deg, var(--primary), #818CF8)',
                color: 'white', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(79,70,229,0.25)',
                transition: 'transform 0.15s, box-shadow 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(79,70,229,0.35)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(79,70,229,0.25)'; }}
            >
              <DollarSign size={12} /> Pagar
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Person Card ─────────────────────────────────────────────────────────────

function PersonCard({ order, deptName, orderInstallments, onPayCustom }) {
  const [expanded, setExpanded] = useState(false);

  const totalQty = Object.values(order.items).reduce((acc, q) => acc + (parseInt(q) || 0), 0);
  const itemsWithQty = SIZES.filter(s => parseInt(order.items[s]) > 0);

  const paidInstallments = orderInstallments.filter(i => i.isPaid).length;
  const totalInstallments = orderInstallments.length;
  const totalPaid = orderInstallments.reduce((sum, i) => sum + (i.isPaid ? parseFloat(i.amount) : 0), 0);
  const totalRemaining = (order.totalAmount || 0) - totalPaid;
  const allPaid = totalInstallments > 0 && paidInstallments === totalInstallments;

  const sortedInstallments = [...orderInstallments].sort((a, b) => a.index - b.index);

  return (
    <div
      className="responsive-card"
      style={{
        background: 'var(--card-bg)',
        border: `1px solid ${allPaid ? 'rgba(16,185,129,0.3)' : 'var(--border)'}`,
        borderRadius: '0.75rem',
        overflow: 'hidden',
        transition: 'box-shadow 0.2s',
      }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow-md)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
    >
      {/* ── Card Header ── */}
      <div
        onClick={() => setExpanded(v => !v)}
        style={{
          display: 'flex', alignItems: 'center', gap: '1rem',
          padding: '1rem 1.25rem', cursor: 'pointer',
        }}
      >
        {/* Avatar */}
        <div style={{
          width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
          background: allPaid
            ? 'linear-gradient(135deg, #10B981, #34D399)'
            : 'linear-gradient(135deg, var(--primary), #818CF8)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white', fontWeight: 700, fontSize: '1rem',
        }}>
          {allPaid ? <CheckCircle size={20} /> : order.personName.charAt(0).toUpperCase()}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-main)' }}>
              {order.personName}
            </span>
            <span style={{
              fontSize: '0.72rem', padding: '0.1rem 0.5rem', borderRadius: '999px',
              background: 'rgba(79,70,229,0.1)', color: 'var(--primary)', fontWeight: 600
            }}>
              {deptName}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.4rem' }}>
            {itemsWithQty.length > 0
              ? SIZES.map(s => parseInt(order.items[s]) > 0
                  ? <SizeBadge key={s} size={s} qty={parseInt(order.items[s])} />
                  : null)
              : <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Sem itens</span>
            }
          </div>
        </div>

        {/* Totals */}
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-main)' }}>
            {totalQty} {totalQty === 1 ? 'camisa' : 'camisas'}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            R$ {(order.totalAmount || 0).toFixed(2).replace('.', ',')}
          </div>
          {/* Status de pagamento */}
          <div style={{ fontSize: '0.72rem', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.3rem', justifyContent: 'flex-end' }}>
            {allPaid ? (
              <span style={{ padding: '0.1rem 0.4rem', borderRadius: '999px', background: '#D1FAE5', color: '#065F46', fontWeight: 600 }}>
                ✓ Quitado
              </span>
            ) : order.paymentMethod === 'vista' ? (
              <span style={{ padding: '0.1rem 0.4rem', borderRadius: '999px', background: '#FEF3C7', color: '#92400E', fontWeight: 600 }}>
                À vista
              </span>
            ) : (
              <span style={{ padding: '0.1rem 0.4rem', borderRadius: '999px', background: '#FEF3C7', color: '#92400E', fontWeight: 600 }}>
                {paidInstallments}/{totalInstallments} parcelas
              </span>
            )}
          </div>
        </div>

        {/* Expand toggle */}
        {orderInstallments.length > 0 && (
          <div style={{ color: 'var(--text-muted)', marginLeft: '0.25rem' }}>
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        )}
      </div>

      {/* ── Installments Panel ── */}
      {expanded && orderInstallments.length > 0 && (
        <div style={{
          borderTop: '1px solid var(--border)',
          padding: '0.75rem 1.25rem 1rem',
          background: 'rgba(0,0,0,0.015)',
        }}>
          {/* Summary bar */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap',
            marginBottom: '0.75rem', padding: '0.5rem 0.75rem',
            background: 'rgba(79,70,229,0.05)', borderRadius: '0.5rem',
          }}>
            <CreditCard size={14} color="var(--primary)" />
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              Pago: <strong style={{ color: '#10B981' }}>R$ {totalPaid.toFixed(2).replace('.', ',')}</strong>
            </span>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              Restante: <strong style={{ color: totalRemaining > 0 ? '#F59E0B' : '#10B981' }}>
                R$ {Math.max(totalRemaining, 0).toFixed(2).replace('.', ',')}
              </strong>
            </span>
          </div>

          {/* Installment rows */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {sortedInstallments.map(inst => (
              <InstallmentRow
                key={inst.id}
                inst={inst}
                orderId={order.id}
                onPay={onPayCustom}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Department Section ───────────────────────────────────────────────────────

function DepartmentSection({ dept, orders, installments, onPayCustom }) {
  const [expanded, setExpanded] = useState(true);

  const deptOrders = orders.filter(o => o.departmentId === dept.id);
  if (deptOrders.length === 0) return null;

  const sizeTotals = SIZES.reduce((acc, s) => {
    acc[s] = deptOrders.reduce((sum, o) => sum + (parseInt(o.items[s]) || 0), 0);
    return acc;
  }, {});

  const totalShirts = Object.values(sizeTotals).reduce((a, b) => a + b, 0);
  const totalValue = deptOrders.reduce((acc, o) => acc + (o.totalAmount || 0), 0);

  return (
    <div style={{
      background: 'var(--card-bg)',
      border: '1px solid var(--border)',
      borderRadius: '1rem',
      overflow: 'hidden',
      boxShadow: 'var(--shadow-sm)',
      marginBottom: '1.5rem',
    }}>
      {/* Header */}
      <div
        className="responsive-card"
        onClick={() => setExpanded(v => !v)}
        style={{
          display: 'flex', alignItems: 'center', gap: '1rem',
          padding: '1.1rem 1.5rem',
          cursor: 'pointer',
          background: 'linear-gradient(90deg, rgba(79,70,229,0.06) 0%, transparent 100%)',
          borderBottom: expanded ? '1px solid var(--border)' : 'none',
          userSelect: 'none',
        }}
      >
        <div style={{
          width: 40, height: 40, borderRadius: '0.6rem', flexShrink: 0,
          background: 'linear-gradient(135deg, var(--primary), #818CF8)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Users size={18} color="white" />
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-main)' }}>
            {dept.name}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Resp: {dept.responsibleName} &nbsp;·&nbsp; {deptOrders.length} integrante{deptOrders.length !== 1 ? 's' : ''}
          </div>
        </div>

        <div style={{ textAlign: 'right', marginLeft: '1rem', flexShrink: 0 }}>
          <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{totalShirts} camisas</div>
          <div style={{ fontSize: '0.82rem', color: 'var(--secondary)', fontWeight: 600 }}>
            R$ {totalValue.toFixed(2).replace('.', ',')}
          </div>
        </div>

        <div style={{ color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
          {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
      </div>

      {/* Person Cards */}
      {expanded && (
        <div style={{ padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {deptOrders.map(o => (
            <PersonCard
              key={o.id}
              order={o}
              deptName={dept.name}
              orderInstallments={installments.filter(i => i.orderId === o.id)}
              onPayCustom={onPayCustom}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function Orders() {
  const { departments, addOrder, orders, installments, payInstallmentCustom } = useStore();

  const [showForm, setShowForm] = useState(false);
  const [filterDeptId, setFilterDeptId] = useState('');

  // Form state
  const [departmentId, setDepartmentId] = useState('');
  const [personName, setPersonName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('vista');
  const [installmentsCount, setInstallmentsCount] = useState(1);
  const [items, setItems] = useState({ P: 0, M: 0, G: 0, GG: 0, EXG: 0, Babylook: 0, 'Sob Medida': 0 });
  const [medidasSobMedida, setMedidasSobMedida] = useState({ pescoco: '', ombro: '', peito: '', cintura: '', quadril: '' });

  const handleSizeChange = (size, value) => {
    setItems(prev => ({ ...prev, [size]: parseInt(value) || 0 }));
  };

  const handleMedidaChange = (field, value) => {
    setMedidasSobMedida(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!departmentId) return alert('Selecione um departamento.');
    if (!personName) return alert('Informe o nome do integrante.');

    if (items['Sob Medida'] > 0 && (!medidasSobMedida.pescoco || !medidasSobMedida.ombro || !medidasSobMedida.peito || !medidasSobMedida.cintura || !medidasSobMedida.quadril)) {
      return alert('Preencha todas as medidas solicitadas para as camisas Sob Medida.');
    }

    const finalItems = { ...items };
    if (finalItems['Sob Medida'] > 0) {
      finalItems.medidasSobMedida = medidasSobMedida;
    }

    await addOrder(departmentId, personName, finalItems, paymentMethod, installmentsCount);

    setPersonName('');
    setPaymentMethod('vista');
    setInstallmentsCount(1);
    setItems({ P: 0, M: 0, G: 0, GG: 0, EXG: 0, Babylook: 0, 'Sob Medida': 0 });
    setMedidasSobMedida({ pescoco: '', ombro: '', peito: '', cintura: '', quadril: '' });
    setShowForm(false);
  };

  const totalQty = Object.values(items).reduce((acc, q) => acc + q, 0);

  const globalTotals = useMemo(() => SIZES.reduce((acc, s) => {
    acc[s] = orders.reduce((sum, o) => sum + (parseInt(o.items[s]) || 0), 0);
    return acc;
  }, {}), [orders]);

  const globalTotal = Object.values(globalTotals).reduce((a, b) => a + b, 0);
  const globalValue = orders.reduce((acc, o) => acc + (o.totalAmount || 0), 0);

  const visibleDepts = filterDeptId
    ? departments.filter(d => d.id === filterDeptId)
    : departments;

  return (
    <div className="page-shell">
      {/* ── Page Header ── */}
      <header className="page-header">
        <div className="page-title-group">
          <h1 className="page-title">Pedidos</h1>
          <p className="page-subtitle">Gerencie os pedidos de camisas por departamento.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(v => !v)} style={{ gap: '0.5rem' }}>
          {showForm ? <><X size={16} /> Fechar</> : <><Plus size={16} /> Novo Pedido</>}
        </button>
      </header>

      {/* ── Global Summary Bar ── */}
      {orders.length > 0 && (
        <div className="responsive-card" style={{
          display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap',
          background: 'linear-gradient(135deg, var(--primary) 0%, #818CF8 100%)',
          borderRadius: '1rem', padding: '1.1rem 1.5rem', marginBottom: '1.5rem',
          color: 'white',
        }}>
          <ShoppingBag size={22} />
          <div style={{ fontWeight: 700, fontSize: '1rem' }}>Resumo Geral</div>
          <div style={{ flex: 1 }} />
          <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>
            {globalTotal} camisas
          </div>
          <div style={{ borderLeft: '1px solid rgba(255,255,255,0.3)', paddingLeft: '1rem', fontWeight: 700 }}>
            R$ {globalValue.toFixed(2).replace('.', ',')}
          </div>
        </div>
      )}

      {/* ── New Order Form ── */}
      {showForm && (
        <div className="glass-card" style={{ marginBottom: '2rem' }}>
          <h2 style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Plus size={20} color="var(--primary)" /> Novo Pedido
          </h2>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="input-group">
                <label>Departamento</label>
                <select className="input-field" value={departmentId} onChange={e => setDepartmentId(e.target.value)} required>
                  <option value="">-- Selecione --</option>
                  {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div className="input-group">
                <label>Nome do Integrante</label>
                <input className="input-field" value={personName} onChange={e => setPersonName(e.target.value)} placeholder="Ex: João Silva" required />
              </div>
            </div>

            <h3 style={{ margin: '0.5rem 0 1rem', fontSize: '0.95rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Tamanhos
            </h3>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
              {SIZES.map(size => (
                <div key={size} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{
                    padding: '0.2rem 0.7rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 700,
                    background: SIZE_COLORS[size].bg, color: SIZE_COLORS[size].text, border: `1px solid ${SIZE_COLORS[size].border}`,
                  }}>{size}</span>
                  <input
                    type="number" min="0" max="99"
                    className="input-field"
                    value={items[size] || ''}
                    onChange={e => handleSizeChange(size, e.target.value)}
                    style={{ width: 72, textAlign: 'center', padding: '0.5rem' }}
                  />
                </div>
              ))}
            </div>

            {items['Sob Medida'] > 0 && (
              <div style={{ background: 'rgba(55, 48, 163, 0.05)', border: '1px dashed var(--border)', borderRadius: 'var(--radius-md)', padding: '1rem', marginBottom: '1rem' }}>
                <h4 style={{ marginBottom: '0.75rem', fontSize: '0.9rem', color: 'var(--primary)' }}>Medidas para "Sob Medida" (em cm)</h4>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  {['pescoco', 'ombro', 'peito', 'cintura', 'quadril'].map(field => (
                    <div key={field} className="input-group" style={{ marginBottom: 0, flex: 1, minWidth: '80px' }}>
                      <label style={{ fontSize: '0.75rem', textTransform: 'capitalize' }}>{field}</label>
                      <input
                        type="number"
                        className="input-field"
                        placeholder="Ex: 45"
                        value={medidasSobMedida[field]}
                        onChange={e => handleMedidaChange(field, e.target.value)}
                        style={{ padding: '0.5rem' }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {totalQty > 0 && (
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '1rem',
                background: 'rgba(79,70,229,0.07)', border: '1px solid rgba(79,70,229,0.2)',
                borderRadius: '0.75rem', padding: '0.6rem 1.1rem', marginBottom: '1rem',
              }}>
                <span style={{ fontWeight: 600, color: 'var(--primary)' }}>{totalQty} camisas</span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>·</span>
                <span style={{ fontWeight: 700, color: 'var(--secondary)' }}>R$ {(totalQty * SHIRT_PRICE).toFixed(2).replace('.', ',')}</span>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="input-group">
                <label>Forma de Pagamento</label>
                <select className="input-field" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
                  <option value="vista">À Vista</option>
                  <option value="parcelado">Parcelado</option>
                </select>
              </div>
              {paymentMethod === 'parcelado' && (
                <div className="input-group">
                  <label>Número de Parcelas (Máx 6x)</label>
                  <select className="input-field" value={installmentsCount} onChange={e => setInstallmentsCount(parseInt(e.target.value) || 1)}>
                    {[1, 2, 3, 4, 5, 6].map(num => {
                      const val = totalQty > 0 ? (totalQty * SHIRT_PRICE / num).toFixed(2).replace('.', ',') : '0,00';
                      return <option key={num} value={num}>{num}x de R$ {val}</option>;
                    })}
                  </select>
                </div>
              )}
            </div>

            <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>
              Confirmar Pedido
            </button>
          </form>
        </div>
      )}

      {/* ── Filter ── */}
      {departments.length > 0 && orders.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
          <Filter size={16} color="var(--text-muted)" />
          <span style={{ color: 'var(--text-muted)', fontSize: '0.87rem', fontWeight: 500 }}>Filtrar:</span>
          <button
            onClick={() => setFilterDeptId('')}
            style={{
              padding: '0.3rem 0.9rem', borderRadius: '999px', border: 'none',
              fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer',
              background: !filterDeptId ? 'var(--primary)' : 'var(--border)',
              color: !filterDeptId ? 'white' : 'var(--text-muted)',
              transition: 'all 0.2s',
            }}
          >
            Todos
          </button>
          {departments.filter(d => orders.some(o => o.departmentId === d.id)).map(d => (
            <button
              key={d.id}
              onClick={() => setFilterDeptId(d.id)}
              style={{
                padding: '0.3rem 0.9rem', borderRadius: '999px', border: 'none',
                fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer',
                background: filterDeptId === d.id ? 'var(--primary)' : 'var(--border)',
                color: filterDeptId === d.id ? 'white' : 'var(--text-muted)',
                transition: 'all 0.2s',
              }}
            >
              {d.name}
            </button>
          ))}
        </div>
      )}

      {/* ── Department Sections ── */}
      {orders.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '4rem 2rem',
          border: '2px dashed var(--border)', borderRadius: '1rem',
          color: 'var(--text-muted)',
        }}>
          <ShoppingBag size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
          <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Nenhum pedido ainda</p>
          <p style={{ fontSize: '0.87rem' }}>Clique em "Novo Pedido" para começar</p>
        </div>
      ) : (
        visibleDepts.map(dept => (
          <DepartmentSection
            key={dept.id}
            dept={dept}
            orders={orders}
            installments={installments}
            onPayCustom={payInstallmentCustom}
          />
        ))
      )}
    </div>
  );
}
