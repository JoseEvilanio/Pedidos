import React, { useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';

export default function Catalogo() {
  const { deptId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const deptName = searchParams.get('name') || 'seu Departamento';
  const { addOrder } = useStore();

  const [personName, setPersonName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('vista');
  const [installmentsCount, setInstallmentsCount] = useState(1);
  const [items, setItems] = useState({ P: 0, M: 0, G: 0, GG: 0, Babylook: 0 });

  const handleSizeChange = (size, value) => {
    setItems(prev => ({ ...prev, [size]: parseInt(value) || 0 }));
  };

  const totalQty = Object.values(items).reduce((acc, q) => acc + q, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!personName) return alert('Por favor, informe seu nome.');
    if (totalQty === 0) return alert('Selecione pelo menos uma camisa.');

    try {
      // Save directly to the cloud Database
      await addOrder(
        deptId,
        personName,
        items,
        paymentMethod,
        paymentMethod === 'parcelado' ? installmentsCount : 1
      );
      
      alert(`Obrigado, ${personName}! Seu pedido foi enviado para o sistema!`);
      // Reset or guide them
      setPersonName('');
      setItems({ P: 0, M: 0, G: 0, GG: 0, Babylook: 0 });
      setPaymentMethod('vista');
      setInstallmentsCount(1);
    } catch(err) {
      alert('Ops! Houve um erro de conexão ao salvar seu pedido. Tente novamente.');
      console.error(err);
    }
  };

  return (
    <div style={{ padding: '1rem', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem', marginTop: '2rem' }}>
        <div style={{ width: '80px', height: '80px', margin: '0 auto 1rem', borderRadius: '1rem', overflow: 'hidden', border: '2px solid var(--border)', display: 'inline-block' }}>
          <img src="/logo.jpg" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        <h1 className="title" style={{ margin: 0 }}>Fazer Pedido</h1>
        <p className="subtitle">Departamento: <strong>{deptName}</strong></p>
      </div>

      <div className="glass-card">
        <form onSubmit={handleSubmit}>
          
          <div className="input-group">
            <label>Qual o seu Nome/Sobrenome?</label>
            <input className="input-field" value={personName} onChange={e => setPersonName(e.target.value)} required placeholder="Ex: João Silva" />
          </div>

          <h3 style={{ margin: '2rem 0 1rem' }}>Tamanhos e Quantidades</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1rem' }}>Informe quantas camisas de cada tamanho você deseja.</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '1rem' }}>
            {['P', 'M', 'G', 'GG', 'Babylook'].map(size => (
               <div key={size} className="input-group" style={{ marginBottom: 0 }}>
                 <label style={{ textAlign: 'center' }}>{size}</label>
                 <input type="number" min="0" className="input-field" style={{ textAlign: 'center' }} value={items[size] || ''} onChange={e => handleSizeChange(size, e.target.value)} placeholder="0" />
               </div>
            ))}
          </div>

          <div style={{ background: 'var(--background)', padding: '1rem', borderRadius: 'var(--radius-md)', margin: '1.5rem 0', textAlign: 'center' }}>
            <span style={{ fontSize: '1.125rem' }}>Total: <strong>{totalQty} camisa(s)</strong> = <strong>R$ {(totalQty * 120).toFixed(2)}</strong></span>
          </div>

          <h3 style={{ margin: '2rem 0 1rem' }}>Forma de Pagamento</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
            <div className="input-group">
              <label>Como você deseja pagar?</label>
              <select className="input-field" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
                <option value="vista">À Vista</option>
                <option value="parcelado">Parcelado</option>
              </select>
            </div>
            
            {paymentMethod === 'parcelado' && (
              <div className="input-group">
                <label>Número de Parcelas (Máx 6x de R$ 20 por camisa)</label>
                <select className="input-field" value={installmentsCount} onChange={e => setInstallmentsCount(parseInt(e.target.value))}>
                  {[1, 2, 3, 4, 5, 6].map(num => {
                    const valorParcela = totalQty > 0 ? (totalQty * 120 / num).toFixed(2).replace('.', ',') : '0,00';
                    return (
                      <option key={num} value={num}>{num}x de R$ {valorParcela}</option>
                    )
                  })}
                </select>
              </div>
            )}
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '2rem', padding: '1rem', fontSize: '1.125rem' }}>
            Finalizar e Enviar Pedido
          </button>
        </form>
      </div>
    </div>
  );
}
