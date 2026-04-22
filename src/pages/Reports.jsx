import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CheckCircle, XCircle, Download } from 'lucide-react';
import * as XLSX from 'xlsx';

export default function Reports() {
  const { departments, orders, installments, payInstallment } = useStore();
  const [selectedDeptId, setSelectedDeptId] = useState('');
  const [confirmingId, setConfirmingId] = useState(null);
  const [loadingId, setLoadingId] = useState(null);
  const [personNameFilter, setPersonNameFilter] = useState('');

  const handleDarBaixa = async instId => {
    setLoadingId(instId);
    setConfirmingId(null);
    await payInstallment(instId);
    setLoadingId(null);
  };

  const handleExportExcel = (ordersList, filenamePrefix) => {
    if (!ordersList || ordersList.length === 0) {
      alert('Nao ha pedidos para exportar.');
      return;
    }

    const exportData = ordersList.map(order => {
      const dept = departments.find(d => d.id === order.departmentId);
      const deptName = dept ? dept.name : 'Desconhecido';
      const { P, M, G, GG, EXG, Babylook, 'Sob Medida': sobMedida, medidasSobMedida } = order.items;
      const totalPecas =
        (P || 0) + (M || 0) + (G || 0) + (GG || 0) + (EXG || 0) + (Babylook || 0) + (sobMedida || 0);

      const orderInsts = installments.filter(i => i.orderId === order.id);
      const valorPago = orderInsts.filter(i => i.isPaid).reduce((acc, i) => acc + i.amount, 0);
      const valorAberto = order.totalAmount - valorPago;

      let status = 'Pendente';
      if (valorPago === order.totalAmount && order.totalAmount > 0) status = 'Pago';
      else if (valorPago > 0) status = 'Parcial';

      const formaPgto = order.paymentMethod === 'vista' ? 'A vista' : 'Parcelado';

      return {
        Departamento: deptName,
        Responsavel: dept ? dept.responsibleName : '',
        Integrante: order.personName,
        Pagamento: formaPgto,
        P: P || 0,
        M: M || 0,
        G: G || 0,
        GG: GG || 0,
        EXG: EXG || 0,
        Babylook: Babylook || 0,
        'Sob Medida': sobMedida || 0,
        'Total Pecas': totalPecas,
        'Valor Total (R$)': order.totalAmount,
        'Valor Pago (R$)': valorPago,
        'Em Aberto (R$)': valorAberto,
        Status: status,
        'Medida: Pescoco': medidasSobMedida?.pescoco || '',
        'Medida: Ombro': medidasSobMedida?.ombro || '',
        'Medida: Peito': medidasSobMedida?.peito || '',
        'Medida: Cintura': medidasSobMedida?.cintura || '',
        'Medida: Quadril': medidasSobMedida?.quadril || '',
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Pedidos');
    worksheet['!cols'] = [
      { wch: 25 }, { wch: 20 }, { wch: 25 }, { wch: 15 },
      { wch: 5 }, { wch: 5 }, { wch: 5 }, { wch: 5 }, { wch: 5 }, { wch: 10 }, { wch: 10 },
      { wch: 12 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 12 },
      { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 },
    ];

    const dateStr = format(new Date(), 'dd-MM-yyyy_HH-mm');
    XLSX.writeFile(workbook, `${filenamePrefix}_${dateStr}.xlsx`);
  };

  const getDeptSummary = deptId => {
    const deptOrders = orders.filter(o => o.departmentId === deptId);
    const sizes = { P: 0, M: 0, G: 0, GG: 0, EXG: 0, Babylook: 0, 'Sob Medida': 0 };
    let totalQty = 0;

    deptOrders.forEach(order => {
      Object.entries(order.items).forEach(([size, qty]) => {
        if (size !== 'medidasSobMedida') {
          sizes[size] = (sizes[size] || 0) + (parseInt(qty, 10) || 0);
          totalQty += parseInt(qty, 10) || 0;
        }
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
  const filteredOrders = selectedSummary
    ? selectedSummary.orders.filter(order => order.personName.toLowerCase().includes(personNameFilter.toLowerCase()))
    : [];

  return (
    <div className="page-shell">
      <header className="page-header">
        <div className="page-title-group">
          <h1 className="page-title">Relatorios e Controle de Pagamentos</h1>
          <p className="page-subtitle">Acompanhe recebimentos e exporte dados para conciliacao.</p>
        </div>
        <span className="page-tag">{orders.length} pedido(s)</span>
      </header>

      <section className="glass-card form-row mobile-stack" style={{ justifyContent: 'space-between' }}>
        <div className="input-group" style={{ flex: 1, minWidth: '220px', maxWidth: '420px', margin: 0 }}>
          <label>Filtrar por Departamento</label>
          <select className="input-field" value={selectedDeptId} onChange={event => setSelectedDeptId(event.target.value)}>
            <option value="">-- Selecione para ver detalhes --</option>
            {departments.map(dept => (
              <option key={dept.id} value={dept.id}>{dept.name}</option>
            ))}
          </select>
        </div>
        <button
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.62rem 1.2rem' }}
          onClick={() => handleExportExcel(orders, 'Relatorio_Completo_Pedidos')}
        >
          <Download size={18} />
          Exportar Relatorio Completo
        </button>
      </section>

      {selectedSummary ? (
        <>
          <section className="glass-card">
            <div className="form-row mobile-stack" style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ margin: 0 }}>Resumo do Departamento</h2>
              <button
                className="btn btn-secondary"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}
                onClick={() => handleExportExcel(selectedSummary.orders, 'Relatorio_Departamento')}
              >
                <Download size={18} />
                Exportar Departamento
              </button>
            </div>

            <div style={{ display: 'flex', gap: '1.4rem', flexWrap: 'wrap', marginBottom: '1.3rem' }}>
              <div>
                <p className="subtitle">Status Geral</p>
                <span className={`badge badge-${selectedSummary.status === 'Pago' ? 'success' : selectedSummary.status === 'Parcial' ? 'warning' : 'danger'}`} style={{ fontSize: '0.9rem' }}>
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

            <p className="subtitle" style={{ marginBottom: '0.45rem' }}>Distribuicao de Tamanhos</p>
            <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
              {Object.entries(selectedSummary.sizes).map(([size, qty]) => (
                <span key={size} className="badge badge-warning">
                  <strong>{size}:</strong> {qty}
                </span>
              ))}
            </div>
          </section>

          <section className="glass-card">
            <h2 style={{ marginBottom: '1rem' }}>Controle Detalhado por Integrante</h2>

            <div className="input-group" style={{ marginBottom: '1.2rem', maxWidth: '420px' }}>
              <label>Filtrar por Integrante</label>
              <input
                type="text"
                className="input-field"
                placeholder="Digite o nome para buscar..."
                value={personNameFilter}
                onChange={event => setPersonNameFilter(event.target.value)}
              />
            </div>

            {filteredOrders.map(order => {
              const orderInsts = selectedSummary.installments.filter(i => i.orderId === order.id);
              const orderPaid = orderInsts.filter(i => i.isPaid).reduce((acc, i) => acc + i.amount, 0);

              return (
                <article
                  key={order.id}
                  style={{
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1rem',
                    marginBottom: '1rem',
                    background: 'var(--surface-alt)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.9rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div>
                      <h3 style={{ margin: 0 }}>{order.personName}</h3>
                      <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                        Total: R$ {order.totalAmount.toFixed(2)} | Pago: R$ {orderPaid.toFixed(2)} | Metodo:{' '}
                        {order.paymentMethod === 'vista' ? 'A vista' : 'Parcelado'}
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
                          <th>Acao</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orderInsts.map(inst => (
                          <tr key={inst.id}>
                            <td>{order.paymentMethod === 'parcelado' ? `${inst.index}a Parcela` : 'Unica'}</td>
                            <td>{format(parseISO(inst.dueDate), 'dd/MM/yyyy', { locale: ptBR })}</td>
                            <td>R$ {inst.amount.toFixed(2)}</td>
                            <td>
                              {inst.isPaid ? (
                                <span className="badge badge-success">
                                  Pago em {inst.paidAt ? format(parseISO(inst.paidAt), 'dd/MM/yy') : '--'}
                                </span>
                              ) : (
                                <span className="badge badge-warning">Pendente</span>
                              )}
                            </td>
                            <td>
                              {!inst.isPaid && (
                                confirmingId === inst.id ? (
                                  <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', flexWrap: 'wrap' }}>
                                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>Confirmar?</span>
                                    <button
                                      className="btn btn-primary"
                                      style={{ padding: '0.2rem 0.6rem', fontSize: '0.8rem', gap: '0.3rem', display: 'flex', alignItems: 'center' }}
                                      disabled={loadingId === inst.id}
                                      onClick={() => handleDarBaixa(inst.id)}
                                    >
                                      <CheckCircle size={13} />
                                      {loadingId === inst.id ? 'Salvando...' : 'Sim'}
                                    </button>
                                    <button
                                      className="btn btn-secondary"
                                      style={{ padding: '0.2rem 0.6rem', fontSize: '0.8rem', gap: '0.3rem', display: 'flex', alignItems: 'center' }}
                                      onClick={() => setConfirmingId(null)}
                                    >
                                      <XCircle size={13} />
                                      Nao
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    className="btn btn-secondary"
                                    style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}
                                    onClick={() => setConfirmingId(inst.id)}
                                  >
                                    Dar Baixa
                                  </button>
                                )
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </article>
              );
            })}

            {selectedSummary.orders.length === 0 && <p>Nenhum pedido para este departamento.</p>}
            {selectedSummary.orders.length > 0 && filteredOrders.length === 0 && (
              <p style={{ color: 'var(--text-muted)' }}>Nenhum integrante encontrado para a busca.</p>
            )}
          </section>
        </>
      ) : (
        <section className="glass-card">
          <p style={{ color: 'var(--text-muted)' }}>
            Selecione um departamento no filtro acima para visualizar os relatorios e registrar pagamentos.
          </p>
        </section>
      )}
    </div>
  );
}
