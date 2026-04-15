import React, { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { ShoppingBag, ChevronDown, ChevronUp, Users, Hash, Filter, Plus, X } from 'lucide-react';

const SIZES = ['P', 'M', 'G', 'GG', 'Babylook'];
const SHIRT_PRICE = 120;

const SIZE_COLORS = {
  P:        { bg: '#EDE9FE', text: '#5B21B6', border: '#C4B5FD' },
  M:        { bg: '#DBEAFE', text: '#1D4ED8', border: '#93C5FD' },
  G:        { bg: '#D1FAE5', text: '#065F46', border: '#6EE7B7' },
  GG:       { bg: '#FEF3C7', text: '#92400E', border: '#FCD34D' },
  Babylook: { bg: '#FCE7F3', text: '#9D174D', border: '#F9A8D4' },
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

function PersonCard({ order, deptName }) {
  const totalQty = Object.values(order.items).reduce((acc, q) => acc + (parseInt(q) || 0), 0);
  const itemsWithQty = SIZES.filter(s => parseInt(order.items[s]) > 0);

  return (
    <div style={{
      background: 'var(--card-bg)',
      border: '1px solid var(--border)',
      borderRadius: '0.75rem',
      padding: '1rem 1.25rem',
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      transition: 'box-shadow 0.2s',
      cursor: 'default',
    }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow-md)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
    >
      {/* Avatar */}
      <div style={{
        width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
        background: 'linear-gradient(135deg, var(--primary), #818CF8)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'white', fontWeight: 700, fontSize: '1rem',
      }}>
        {order.personName.charAt(0).toUpperCase()}
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
          R$ {(totalQty * SHIRT_PRICE).toFixed(2).replace('.', ',')}
        </div>
        <div style={{ fontSize: '0.72rem', marginTop: '0.2rem' }}>
          <span style={{
            padding: '0.1rem 0.4rem', borderRadius: '999px',
            background: order.paymentMethod === 'vista' ? '#D1FAE5' : '#FEF3C7',
            color: order.paymentMethod === 'vista' ? '#065F46' : '#92400E',
            fontWeight: 600
          }}>
            {order.paymentMethod === 'vista' ? 'À vista' : 'Parcelado'}
          </span>
        </div>
      </div>
    </div>
  );
}

function DepartmentSection({ dept, orders }) {
  const [expanded, setExpanded] = useState(true);

  const deptOrders = orders.filter(o => o.departmentId === dept.id);
  if (deptOrders.length === 0) return null;

  // Aggregate sizes for this dept
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
        {/* Dept Icon */}
        <div style={{
          width: 40, height: 40, borderRadius: '0.6rem', flexShrink: 0,
          background: 'linear-gradient(135deg, var(--primary), #818CF8)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Users size={18} color="white" />
        </div>

        {/* Name & meta */}
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-main)' }}>
            {dept.name}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Resp: {dept.responsibleName} &nbsp;·&nbsp; {deptOrders.length} integrante{deptOrders.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Size pill summary */}
        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', justifyContent: 'flex-end', flex: 2 }}>
          {SIZES.map(s => sizeTotals[s] > 0 ? (
            <SizeBadge key={s} size={s} qty={sizeTotals[s]} />
          ) : null)}
        </div>

        {/* Stats */}
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
            <PersonCard key={o.id} order={o} deptName={dept.name} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function Orders() {
  const { departments, addOrder, orders } = useStore();

  const [showForm, setShowForm] = useState(false);
  const [filterDeptId, setFilterDeptId] = useState('');

  // Form state
  const [departmentId, setDepartmentId] = useState('');
  const [personName, setPersonName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('vista');
  const [installmentsCount, setInstallmentsCount] = useState(1);
  const [items, setItems] = useState({ P: 0, M: 0, G: 0, GG: 0, Babylook: 0 });

  const handleSizeChange = (size, value) => {
    setItems(prev => ({ ...prev, [size]: parseInt(value) || 0 }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!departmentId) return alert('Selecione um departamento.');
    if (!personName) return alert('Informe o nome do integrante.');

    await addOrder(departmentId, personName, items, paymentMethod, installmentsCount);

    setPersonName('');
    setPaymentMethod('vista');
    setInstallmentsCount(1);
    setItems({ P: 0, M: 0, G: 0, GG: 0, Babylook: 0 });
    setShowForm(false);
  };

  const totalQty = Object.values(items).reduce((acc, q) => acc + q, 0);

  // Global size totals (all depts)
  const globalTotals = useMemo(() => SIZES.reduce((acc, s) => {
    acc[s] = orders.reduce((sum, o) => sum + (parseInt(o.items[s]) || 0), 0);
    return acc;
  }, {}), [orders]);

  const globalTotal = Object.values(globalTotals).reduce((a, b) => a + b, 0);
  const globalValue = orders.reduce((acc, o) => acc + (o.totalAmount || 0), 0);

  // Filter departments to display
  const visibleDepts = filterDeptId
    ? departments.filter(d => d.id === filterDeptId)
    : departments;

  return (
    <div>
      {/* ── Page Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="title" style={{ marginBottom: 0 }}>Pedidos</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Gerencie os pedidos de camisas por departamento
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(v => !v)} style={{ gap: '0.5rem' }}>
          {showForm ? <><X size={16} /> Fechar</> : <><Plus size={16} /> Novo Pedido</>}
        </button>
      </div>

      {/* ── Global Summary Bar ── */}
      {orders.length > 0 && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap',
          background: 'linear-gradient(135deg, var(--primary) 0%, #818CF8 100%)',
          borderRadius: '1rem', padding: '1.1rem 1.5rem', marginBottom: '1.5rem',
          color: 'white',
        }}>
          <ShoppingBag size={22} />
          <div style={{ fontWeight: 700, fontSize: '1rem' }}>Resumo Geral</div>
          <div style={{ flex: 1, display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {SIZES.map(s => globalTotals[s] > 0 ? (
              <span key={s} style={{
                padding: '0.2rem 0.6rem', borderRadius: '999px', fontWeight: 700,
                fontSize: '0.8rem', background: 'rgba(255,255,255,0.2)', color: 'white',
              }}>
                {s} × {globalTotals[s]}
              </span>
            ) : null)}
          </div>
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
                    value={items[size]}
                    onChange={e => handleSizeChange(size, e.target.value)}
                    style={{ width: 72, textAlign: 'center', padding: '0.5rem' }}
                  />
                </div>
              ))}
            </div>

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
          <DepartmentSection key={dept.id} dept={dept} orders={orders} />
        ))
      )}
    </div>
  );
}
