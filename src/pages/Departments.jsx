import React, { useState } from 'react';
import { Building2, Link2, Check } from 'lucide-react';
import { useStore } from '../store/useStore';

export default function Departments() {
  const { departments, addDepartment } = useStore();
  const [name, setName] = useState('');
  const [responsibleName, setResponsibleName] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  const handleSubmit = async event => {
    event.preventDefault();
    if (!name || !responsibleName) return;

    try {
      await addDepartment(name, responsibleName);
      setName('');
      setResponsibleName('');
    } catch (error) {
      alert(`Erro ao gravar no banco de dados. Detalhe: ${error.message}`);
    }
  };

  const handleCopyLink = async dept => {
    const publicUrl = `${window.location.origin}/catalogo/${dept.id}?name=${encodeURIComponent(dept.name)}`;
    await navigator.clipboard.writeText(publicUrl);
    setCopiedId(dept.id);
    window.setTimeout(() => setCopiedId(null), 1800);
  };

  return (
    <div className="page-shell">
      <header className="page-header">
        <div className="page-title-group">
          <h1 className="page-title">Departamentos</h1>
          <p className="page-subtitle">
            Cadastre departamentos e compartilhe o link de pedidos com cada responsavel.
          </p>
        </div>
        <span className="page-tag">{departments.length} departamento(s)</span>
      </header>

      <section className="glass-card departments-form-card">
        <div className="departments-form-head">
          <h2 className="departments-form-title">
            <Building2 size={18} color="var(--primary)" />
            Novo Departamento
          </h2>
          <p className="departments-form-subtitle">
            Informe nome e responsavel para gerar o link publico de pedidos.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="departments-form-grid">
          <div className="input-group departments-input">
            <label htmlFor="dept-name">Nome do Departamento</label>
            <input
              id="dept-name"
              className="input-field"
              value={name}
              onChange={event => setName(event.target.value)}
              required
              placeholder="Ex: Jovens"
            />
          </div>
          <div className="input-group departments-input">
            <label htmlFor="dept-responsible">Responsavel</label>
            <input
              id="dept-responsible"
              className="input-field"
              value={responsibleName}
              onChange={event => setResponsibleName(event.target.value)}
              required
              placeholder="Nome do responsavel"
            />
          </div>
          <button type="submit" className="btn btn-primary departments-submit-btn">
            Cadastrar
          </button>
        </form>
      </section>

      {departments.length === 0 ? (
        <div className="empty-state">
          <strong>Nenhum departamento cadastrado</strong>
          Cadastre o primeiro departamento para liberar o link de pedidos.
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Responsavel</th>
                <th className="departments-actions-col">Acoes</th>
              </tr>
            </thead>
            <tbody>
              {departments.map(dept => {
                const isCopied = copiedId === dept.id;
                return (
                  <tr key={dept.id}>
                    <td>{dept.name}</td>
                    <td>{dept.responsibleName}</td>
                    <td>
                      <button
                        type="button"
                        className={isCopied ? 'btn btn-secondary' : 'btn btn-outline'}
                        style={{ padding: '0.4rem 0.7rem', fontSize: '0.82rem' }}
                        onClick={() => handleCopyLink(dept)}
                      >
                        {isCopied ? <Check size={14} /> : <Link2 size={14} />}
                        {isCopied ? 'Copiado' : 'Copiar Link'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
