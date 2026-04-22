import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AlertTriangle, CheckCircle2, Upload } from 'lucide-react';
import { useStore } from '../store/useStore';

export default function ImportOrder() {
  const { payload } = useParams();
  const navigate = useNavigate();
  const { addOrder, departments } = useStore();
  const [orderData, setOrderData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    try {
      const decodedPayload = decodeURIComponent(escape(window.atob(payload)));
      setOrderData(JSON.parse(decodedPayload));
    } catch (decodeError) {
      setError('Importacao invalida ou corrompida. O link pode estar quebrado.');
    }
  }, [payload]);

  const handleImport = async () => {
    if (!orderData) return;
    try {
      await addOrder(
        orderData.departmentId,
        orderData.personName,
        orderData.items,
        orderData.paymentMethod,
        orderData.installmentsCount
      );
      alert('Pedido importado com sucesso.');
      navigate('/orders');
    } catch (importError) {
      alert('Erro ao importar pedido.');
    }
  };

  if (error) {
    return (
      <div className="page-shell" style={{ maxWidth: '680px', margin: '0 auto', paddingTop: '1.5rem' }}>
        <section className="glass-card" style={{ textAlign: 'center' }}>
          <AlertTriangle size={36} color="var(--danger)" style={{ marginBottom: '0.6rem' }} />
          <h1 className="title" style={{ color: 'var(--danger)', marginBottom: '0.35rem' }}>
            Erro na Importacao
          </h1>
          <p className="subtitle">{error}</p>
          <button type="button" className="btn btn-outline" onClick={() => navigate('/')} style={{ marginTop: '1.1rem' }}>
            Voltar ao Inicio
          </button>
        </section>
      </div>
    );
  }

  if (!orderData) {
    return (
      <div className="page-shell" style={{ maxWidth: '680px', margin: '0 auto', paddingTop: '1.5rem' }}>
        <section className="glass-card" style={{ textAlign: 'center' }}>
          Carregando dados...
        </section>
      </div>
    );
  }

  const department = departments.find(item => item.id === orderData.departmentId);
  const totalQty = Object.entries(orderData.items).reduce((acc, [key, qty]) => {
    if (key === 'medidasSobMedida') return acc;
    return acc + (parseInt(qty, 10) || 0);
  }, 0);
  const totalAmount = totalQty * 120;

  return (
    <div className="page-shell" style={{ maxWidth: '740px', margin: '0 auto', paddingTop: '1.2rem', paddingBottom: '1rem' }}>
      <header className="page-header">
        <div className="page-title-group">
          <h1 className="page-title">Importar Pedido</h1>
          <p className="page-subtitle">
            Confira os dados recebidos e confirme para incluir no sistema.
          </p>
        </div>
        <span className="page-tag">
          <Upload size={14} />
          Confirmacao Manual
        </span>
      </header>

      <section className="glass-card">
        <div style={{ marginBottom: '0.9rem' }}>
          <p className="subtitle">Departamento</p>
          <h3>{department ? department.name : `Desconhecido (ID: ${orderData.departmentId})`}</h3>
        </div>

        <div style={{ marginBottom: '0.9rem' }}>
          <p className="subtitle">Integrante</p>
          <h3>{orderData.personName}</h3>
        </div>

        <div style={{ marginBottom: '0.9rem' }}>
          <p className="subtitle">Tamanhos</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
            {Object.entries(orderData.items).map(([size, qty]) =>
              size !== 'medidasSobMedida' && qty > 0 ? (
                <span key={size} className="badge badge-success" style={{ fontSize: '0.83rem' }}>
                  {size}: {qty}
                </span>
              ) : null
            )}
          </div>
        </div>

        {orderData.items['Sob Medida'] > 0 && orderData.items.medidasSobMedida && (
          <div style={{ marginBottom: '0.9rem' }}>
            <p className="subtitle">Medidas Sob Medida (cm)</p>
            <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '0.7rem', background: 'var(--surface-alt)' }}>
              <p>
                <strong>Pescoco:</strong> {orderData.items.medidasSobMedida.pescoco}
              </p>
              <p>
                <strong>Ombro:</strong> {orderData.items.medidasSobMedida.ombro}
              </p>
              <p>
                <strong>Peito:</strong> {orderData.items.medidasSobMedida.peito}
              </p>
              <p>
                <strong>Cintura:</strong> {orderData.items.medidasSobMedida.cintura}
              </p>
              <p>
                <strong>Quadril:</strong> {orderData.items.medidasSobMedida.quadril}
              </p>
            </div>
          </div>
        )}

        <div
          style={{
            marginBottom: '1.1rem',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            background: 'var(--surface-alt)',
            padding: '0.8rem',
            display: 'grid',
            gap: '0.4rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.6rem' }}>
            <span>Total de Camisas</span>
            <strong>{totalQty}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.6rem' }}>
            <span>Valor Total</span>
            <strong>R$ {totalAmount.toFixed(2).replace('.', ',')}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.6rem' }}>
            <span>Pagamento</span>
            <strong>
              {orderData.paymentMethod === 'vista'
                ? 'A vista'
                : `Parcelado em ${orderData.installmentsCount}x`}
            </strong>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.7rem', flexWrap: 'wrap' }}>
          <button type="button" className="btn btn-outline" style={{ flex: '1 1 180px' }} onClick={() => navigate('/')}>
            Cancelar
          </button>
          <button type="button" className="btn btn-primary" style={{ flex: '1 1 220px' }} onClick={handleImport}>
            <CheckCircle2 size={16} />
            Confirmar Importacao
          </button>
        </div>
      </section>
    </div>
  );
}
