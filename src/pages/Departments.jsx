import React, { useState } from 'react';
import { useStore } from '../store/useStore';

export default function Departments() {
  const { departments, addDepartment } = useStore();
  const [name, setName] = useState('');
  const [responsibleName, setResponsibleName] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(name && responsibleName) {
      try {
        await addDepartment(name, responsibleName);
        setName('');
        setResponsibleName('');
      } catch (err) {
        alert('Erro ao gravar no banco de dados! Verifique sua conexão com o Supabase. (Erro: ' + err.message + ')');
      }
    }
  };

  return (
    <div>
      <h1 className="title">Departamentos</h1>
      
      <div className="glass-card" style={{ marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>Novo Departamento</h2>
        <form onSubmit={handleSubmit} className="form-row">
          <div className="input-group" style={{ flex: 1, marginBottom: 0 }}>
            <label>Nome do Departamento</label>
            <input className="input-field" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Ex: Jovens" />
          </div>
          <div className="input-group" style={{ flex: 1, marginBottom: 0 }}>
            <label>Responsável</label>
            <input className="input-field" value={responsibleName} onChange={(e) => setResponsibleName(e.target.value)} required placeholder="Nome do responsável" />
          </div>
          <button type="submit" className="btn btn-primary">Cadastrar</button>
        </form>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Responsável</th>
              <th style={{ width: '150px' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {departments.length === 0 ? (
              <tr><td colSpan="3" style={{ textAlign: 'center' }}>Nenhum departamento cadastrado</td></tr>
            ) : (
              departments.map(d => (
                <tr key={d.id}>
                  <td>{d.name}</td>
                  <td>{d.responsibleName}</td>
                  <td>
                    <button 
                      className="btn btn-outline" 
                      style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}
                      onClick={() => {
                        const publicUrl = `${window.location.origin}/catalogo/${d.id}?name=${encodeURIComponent(d.name)}`;
                        navigator.clipboard.writeText(publicUrl);
                        alert('Link público do departamento copiado!');
                      }}
                    >
                      Copiar Link
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
