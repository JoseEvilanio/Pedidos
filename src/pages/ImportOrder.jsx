import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
      const data = JSON.parse(decodedPayload);
      setOrderData(data);
    } catch (e) {
      setError('Importação inválida ou corrompida. O link pode estar quebrado.');
    }
  }, [payload]);

  const handleImport = () => {
    if (!orderData) return;
    try {
      addOrder(
        orderData.departmentId, 
        orderData.personName, 
        orderData.items, 
        orderData.paymentMethod, 
        orderData.installmentsCount
      );
      alert('Pedido importado com sucesso!');
      navigate('/orders');
    } catch(e) {
      alert('Erro inesperado ao importar pedido.');
    }
  };

  if (error) {
    return (
      <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
        <h1 className="title" style={{ color: 'var(--danger)' }}>Erro na Importação</h1>
        <p className="subtitle">{error}</p>
        <button className="btn btn-outline" onClick={() => navigate('/')} style={{ marginTop: '2rem' }}>Voltar ao Início</button>
      </div>
    );
  }

  if (!orderData) return <div style={{ padding: '2rem', textAlign: 'center' }}>Carregando dados...</div>;

  const dept = departments.find(d => d.id === orderData.departmentId);
  const totalQty = Object.entries(orderData.items).reduce((acc, [s, q]) => s !== 'medidasSobMedida' ? acc + (parseInt(q)||0) : acc, 0);
  const totalAmount = totalQty * 120;

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <h1 className="title" style={{ textAlign: 'center' }}>Importar Novo Pedido</h1>
      <p className="subtitle" style={{ textAlign: 'center', marginBottom: '2rem' }}>Você recebeu um pedido externo e precisa confirmar a importação para o sistema.</p>
      
      <div className="glass-card" style={{ marginBottom: '2rem' }}>
        <div style={{ marginBottom: '1rem' }}>
          <p className="subtitle">Departamento</p>
          <h3>{dept ? dept.name : 'Desconhecido (ID: ' + orderData.departmentId + ')'}</h3>
        </div>
        
        <div style={{ marginBottom: '1rem' }}>
          <p className="subtitle">Integrante</p>
          <h3>{orderData.personName}</h3>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <p className="subtitle">Tamanhos</p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {Object.entries(orderData.items).map(([s, q]) => (
              s !== 'medidasSobMedida' && q > 0 ? <span key={s} className="badge badge-success" style={{ fontSize: '1rem' }}>{s}: {q}</span> : null
            ))}
          </div>
        </div>

        {orderData.items['Sob Medida'] > 0 && orderData.items.medidasSobMedida && (
          <div style={{ marginBottom: '1rem' }}>
            <p className="subtitle">Medidas "Sob Medida" (cm)</p>
            <div style={{ background: 'var(--background)', padding: '0.75rem', borderRadius: 'var(--radius-md)', fontSize: '0.875rem' }}>
              <strong>Pescoço:</strong> {orderData.items.medidasSobMedida.pescoco} <br/>
              <strong>Ombro:</strong> {orderData.items.medidasSobMedida.ombro} <br/>
              <strong>Peito:</strong> {orderData.items.medidasSobMedida.peito} <br/>
              <strong>Cintura:</strong> {orderData.items.medidasSobMedida.cintura} <br/>
              <strong>Quadril:</strong> {orderData.items.medidasSobMedida.quadril}
            </div>
          </div>
        )}

        <div style={{ marginBottom: '1.5rem', background: 'var(--background)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span>Total de Camisas:</span>
            <strong>{totalQty}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span>Valor Total:</span>
            <strong>R$ {totalAmount.toFixed(2)}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Pagamento:</span>
            <strong>{orderData.paymentMethod === 'vista' ? 'À vista' : `Parcelado em ${orderData.installmentsCount}x de R$ ${(totalAmount/orderData.installmentsCount).toFixed(2)}`}</strong>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => navigate('/')}>Cancelar / Descartar</button>
          <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleImport}>Confirmar Importação</button>
        </div>
      </div>
    </div>
  );
}
