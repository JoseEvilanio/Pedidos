import React, { useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Shirt } from 'lucide-react';
import { useStore } from '../store/useStore';

const SIZES = ['P', 'M', 'G', 'GG', 'EXG', 'Babylook', 'Sob Medida'];
const SHIRT_PRICE = 120;

export default function Catalogo() {
  const { deptId } = useParams();
  const [searchParams] = useSearchParams();
  const deptName = searchParams.get('name') || 'Seu Departamento';
  const { addOrder } = useStore();

  const [personName, setPersonName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('vista');
  const [installmentsCount, setInstallmentsCount] = useState(1);
  const [items, setItems] = useState({ P: 0, M: 0, G: 0, GG: 0, EXG: 0, Babylook: 0, 'Sob Medida': 0 });
  const [medidasSobMedida, setMedidasSobMedida] = useState({
    pescoco: '',
    ombro: '',
    peito: '',
    cintura: '',
    quadril: '',
  });

  const totalQty = Object.values(items).reduce((acc, qty) => acc + qty, 0);

  const handleSizeChange = (size, value) => {
    setItems(prev => ({ ...prev, [size]: parseInt(value, 10) || 0 }));
  };

  const handleMedidaChange = (field, value) => {
    setMedidasSobMedida(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async event => {
    event.preventDefault();

    if (!personName) {
      alert('Por favor, informe seu nome.');
      return;
    }

    if (totalQty === 0) {
      alert('Selecione pelo menos uma camisa.');
      return;
    }

    if (
      items['Sob Medida'] > 0 &&
      (!medidasSobMedida.pescoco ||
        !medidasSobMedida.ombro ||
        !medidasSobMedida.peito ||
        !medidasSobMedida.cintura ||
        !medidasSobMedida.quadril)
    ) {
      alert('Preencha todas as medidas para Sob Medida.');
      return;
    }

    try {
      const finalItems = { ...items };
      if (finalItems['Sob Medida'] > 0) {
        finalItems.medidasSobMedida = medidasSobMedida;
      }

      await addOrder(
        deptId,
        personName,
        finalItems,
        paymentMethod,
        paymentMethod === 'parcelado' ? installmentsCount : 1
      );

      alert(`Obrigado, ${personName}. Seu pedido foi enviado com sucesso.`);
      setPersonName('');
      setPaymentMethod('vista');
      setInstallmentsCount(1);
      setItems({ P: 0, M: 0, G: 0, GG: 0, EXG: 0, Babylook: 0, 'Sob Medida': 0 });
      setMedidasSobMedida({ pescoco: '', ombro: '', peito: '', cintura: '', quadril: '' });
    } catch (error) {
      alert('Erro ao salvar o pedido. Tente novamente em instantes.');
      console.error(error);
    }
  };

  return (
    <div className="page-shell" style={{ maxWidth: '780px', margin: '0 auto', paddingTop: '1rem', paddingBottom: '1rem' }}>
      <header className="page-header">
        <div className="page-title-group">
          <h1 className="page-title">Formulario de Pedido</h1>
          <p className="page-subtitle">
            Departamento: <strong>{deptName}</strong>
          </p>
        </div>
        <img src="/logo.jpg" alt="ADD BB2" className="brand-logo" />
      </header>

      <section className="glass-card">
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="person-name">Nome completo</label>
            <input
              id="person-name"
              className="input-field"
              value={personName}
              onChange={event => setPersonName(event.target.value)}
              required
              placeholder="Ex: Joao Silva"
            />
          </div>

          <h3 style={{ margin: '1.3rem 0 0.5rem' }}>Tamanhos e Quantidades</h3>
          <p className="subtitle" style={{ marginBottom: '0.9rem' }}>
            Informe quantas camisas deseja em cada tamanho.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: '0.8rem' }}>
            {SIZES.map(size => (
              <div key={size} className="input-group" style={{ marginBottom: 0 }}>
                <label style={{ textAlign: 'center', fontSize: '0.75rem' }}>{size}</label>
                <input
                  type="number"
                  min="0"
                  className="input-field"
                  style={{ textAlign: 'center' }}
                  value={items[size] || ''}
                  onChange={event => handleSizeChange(size, event.target.value)}
                  placeholder="0"
                />
              </div>
            ))}
          </div>

          {items['Sob Medida'] > 0 && (
            <div
              style={{
                marginTop: '1rem',
                background: 'rgba(13, 94, 166, 0.06)',
                border: '1px dashed var(--border-strong)',
                borderRadius: 'var(--radius-md)',
                padding: '0.9rem',
              }}
            >
              <h4 style={{ marginBottom: '0.8rem', color: 'var(--primary)' }}>Medidas (cm)</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '0.7rem' }}>
                {['pescoco', 'ombro', 'peito', 'cintura', 'quadril'].map(field => (
                  <div key={field} className="input-group" style={{ marginBottom: 0 }}>
                    <label style={{ fontSize: '0.75rem', textTransform: 'capitalize' }}>{field}</label>
                    <input
                      type="number"
                      className="input-field"
                      placeholder="Ex: 45"
                      value={medidasSobMedida[field]}
                      onChange={event => handleMedidaChange(field, event.target.value)}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div
            style={{
              marginTop: '1rem',
              marginBottom: '1rem',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              background: 'var(--surface-alt)',
              padding: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.7rem',
            }}
          >
            <span className="subtitle">Resumo do pedido</span>
            <strong>{totalQty} camisa(s)</strong>
            <strong>R$ {(totalQty * SHIRT_PRICE).toFixed(2).replace('.', ',')}</strong>
          </div>

          <h3 style={{ margin: '1.2rem 0 0.6rem' }}>Pagamento</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.8rem' }}>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label htmlFor="payment-method">Forma de pagamento</label>
              <select
                id="payment-method"
                className="input-field"
                value={paymentMethod}
                onChange={event => setPaymentMethod(event.target.value)}
              >
                <option value="vista">A vista</option>
                <option value="parcelado">Parcelado</option>
              </select>
            </div>

            {paymentMethod === 'parcelado' && (
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label htmlFor="installments">Numero de parcelas (max 6x)</label>
                <select
                  id="installments"
                  className="input-field"
                  value={installmentsCount}
                  onChange={event => setInstallmentsCount(parseInt(event.target.value, 10) || 1)}
                >
                  {[1, 2, 3, 4, 5, 6].map(num => {
                    const valorParcela = totalQty > 0 ? (totalQty * SHIRT_PRICE) / num : 0;
                    return (
                      <option key={num} value={num}>
                        {num}x de R$ {valorParcela.toFixed(2).replace('.', ',')}
                      </option>
                    );
                  })}
                </select>
              </div>
            )}
          </div>

          <button type="submit" className="btn btn-primary" style={{ marginTop: '1.3rem', width: '100%', padding: '0.9rem' }}>
            <Shirt size={18} />
            Finalizar Pedido
          </button>
        </form>
      </section>
    </div>
  );
}
