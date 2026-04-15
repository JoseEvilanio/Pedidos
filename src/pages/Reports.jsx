import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function Reports() {
  const { departments, orders, installments, payInstallment } = useStore();
  const [selectedDeptId, setSelectedDeptId] = useState('');

  // Group data by department
  const getDeptSummary = (deptId) => {
    const deptOrders = orders.filter(o => o.departmentId === deptId);
    
    const sizes = { P: 0, M: 0, G: 0, GG: 0, Babylook: 0 };
    let totalQty = 0;
    
    deptOrders.forEach(o => {
      Object.entries(o.items).forEach(([s, q]) => {
        sizes[s] += q;
        totalQty += q;
      });
    });

    const deptInstallments = installments.filter(i => deptOrders.some(o => o.id === i.orderId));
    const totalAmount = deptOrders.reduce((acc, o) => acc + o.totalAmount, 0);
    const totalPaid = deptInstallments.filter(i => i.isPaid).reduce((acc, i) => acc + i.amount, 0);
    const totalPending = totalAmount - totalPaid;

    let status = 'Pendente';
    if (totalPaid === totalAmount && totalAmount > 0) status = 'Pago';
    else if (totalPaid > 0) status = 'Parcial';

    return { sizes, totalQty, totalAmount, totalPaid, totalPending, status, orders: deptOrders, installments: deptInstallments };
  };

  const selectedSummary = selectedDeptId ? getDeptSummary(selectedDeptId) : null;

  return (
    <div>
      <h1 className="title">Relatórios e Controle de Pagamentos</h1>

      <div className="glass-card" style={{ marginBottom: '2rem' }}>
        <div className="input-group" style={{ maxWidth: '400px' }}>
          <label>Filtrar por Departamento</label>
          <select className="input-field" value={selectedDeptId} onChange={e => setSelectedDeptId(e.target.value)}>
            <option value="">-- Selecione para ver detalhes --</option>
            {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
      </div>

      {selectedSummary && (
        <div className="glass-card" style={{ marginBottom: '2rem' }}>
          <h2 style={{ marginBottom: '1rem' }}>Resumo do Departamento</h2>
          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
            <div>
              <p className="subtitle">Status Geral</p>
              <span className={`badge badge-${selectedSummary.status === 'Pago' ? 'success' : selectedSummary.status === 'Parcial' ? 'warning' : 'danger'}`} style={{ fontSize: '1rem' }}>
                {selectedSummary.status}
              </span>
            </div>
            <div>
              <p className="subtitle">Total de Camisas</p>
              <h3>{selectedSummary.totalQty}</h3>
            </div>
            <div>
              <p className="subtitle">Valor Total</p>
              <h3>R$ {selectedSummary.totalAmount.toFixed(2)}</h3>
            </div>
            <div>
              <p className="subtitle">Pago</p>
              <h3 style={{ color: 'var(--secondary)' }}>R$ {selectedSummary.totalPaid.toFixed(2)}</h3>
            </div>
            <div>
              <p className="subtitle">Em Aberto</p>
              <h3 style={{ color: 'var(--danger)' }}>R$ {selectedSummary.totalPending.toFixed(2)}</h3>
            </div>
          </div>

          <p className="subtitle" style={{ marginBottom: '0.5rem' }}>Distribuição de Tamanhos:</p>
          <div style={{ display: 'flex', gap: '1rem' }}>
            {Object.entries(selectedSummary.sizes).map(([size, qty]) => (
              <span key={size}><strong>{size}:</strong> {qty}</span>
            ))}
          </div>
        </div>
      )}

      {selectedSummary && (
        <div className="glass-card">
          <h2 style={{ marginBottom: '1rem' }}>Controle Detalhado por Integrante</h2>
          
          {selectedSummary.orders.map(order => {
            const orderInsts = selectedSummary.installments.filter(i => i.orderId === order.id);
            const orderPaid = orderInsts.filter(i => i.isPaid).reduce((acc, i) => acc + i.amount, 0);
            
            return (
              <div key={order.id} style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '1rem', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div>
                    <h3 style={{ margin: 0 }}>{order.personName}</h3>
                    <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                      Total: R$ {order.totalAmount.toFixed(2)} | Pago: R$ {orderPaid.toFixed(2)} | Método: {order.paymentMethod === 'vista' ? 'À vista' : 'Parcelado'}
                    </p>
                  </div>
                </div>
                
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Parcela</th>
                        <th>Vencimento</th>
                        <th>Valor</th>
                        <th>Status</th>
                        <th>Ação</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orderInsts.map((inst, idx) => (
                        <tr key={inst.id}>
                          <td>{order.paymentMethod === 'parcelado' ? `${inst.index}ª Parcela` : 'Única'}</td>
                          <td>{format(parseISO(inst.dueDate), 'dd/MM/yyyy', { locale: ptBR })}</td>
                          <td>R$ {inst.amount.toFixed(2)}</td>
                          <td>
                            {inst.isPaid ? (
                              <span className="badge badge-success">Pago em {format(parseISO(inst.paidAt), 'dd/MM/yy')}</span>
                            ) : (
                              <span className="badge badge-warning">Pendente</span>
                            )}
                          </td>
                          <td>
                            {!inst.isPaid && (
                              <button className="btn btn-secondary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }} onClick={() => {
                                if(window.confirm('Confirmar recebimento desta parcela?')) {
                                  payInstallment(inst.id);
                                }
                              }}>
                                Dar Baixa
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
          {selectedSummary.orders.length === 0 && <p>Nenhum pedido para este departamento.</p>}
        </div>
      )}

      {!selectedSummary && (
        <div className="glass-card">
          <p style={{ color: 'var(--text-muted)' }}>Selecione um departamento no filtro acima para visualizar os relatórios e registrar pagamentos.</p>
        </div>
      )}

    </div>
  );
}
