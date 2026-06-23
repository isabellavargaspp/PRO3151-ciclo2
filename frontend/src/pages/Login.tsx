import React, { useState } from 'react';
import './Login.css';
import { apiLogin, apiRegister } from '../context/api';

interface LoginProps {
  onLogin: () => void;
}

export function Login({ onLogin }: LoginProps) {
  const [activeTab, setActiveTab] = useState<'entrar' | 'criar'>('entrar');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (activeTab === 'entrar') {
        await apiLogin(email, password);
      } else {
        await apiRegister(name, email, password);
        await apiLogin(email, password);
      }
      localStorage.setItem('isAuthenticated', 'true');
      onLogin();
    } catch (err: any) {
      if (err.status === 401) {
        setError('E-mail ou senha inválidos.');
      } else if (err.status === 400) {
        setError('E-mail já cadastrado.');
      } else {
        setError('Não foi possível conectar ao servidor. Verifique se o backend está rodando.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-content">
        <div className="login-logo-section">
          <div className="fgmf-logo-large">
            <span>·</span><span>F</span><span>·</span>
            <span>G</span><span>·</span><span>·</span>
            <span>·</span><span>M</span><span>F</span>
          </div>
          <h1>FGMF Arquitetos</h1>
          <p className="subtitle">Reserva de Salas</p>
        </div>

        <div className="login-tabs">
          <button
            type="button"
            className={`login-tab ${activeTab === 'entrar' ? 'active' : ''}`}
            onClick={() => { setActiveTab('entrar'); setError(''); }}
          >
            Entrar
          </button>
          <button
            type="button"
            className={`login-tab ${activeTab === 'criar' ? 'active' : ''}`}
            onClick={() => { setActiveTab('criar'); setError(''); }}
          >
            Criar conta
          </button>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          {activeTab === 'criar' && (
            <div className="form-group">
              <label htmlFor="name">Nome completo</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome"
                required
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">E-mail</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="voce@studio.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Senha</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          {activeTab === 'entrar' && (
            <div className="form-actions">
              <label className="remember-me">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Lembrar de mim</span>
              </label>
            </div>
          )}

          {error && (
            <div className="login-error" style={{
              color: '#c0392b',
              fontSize: '13px',
              marginBottom: '12px',
              padding: '10px',
              background: '#fdf0ef',
              borderRadius: '6px',
              border: '1px solid #f5c6c2'
            }}>
              {error}
            </div>
          )}

          <button type="submit" className="btn-login" disabled={loading}>
            {loading
              ? 'Aguarde...'
              : activeTab === 'entrar' ? 'Entrar' : 'Criar conta'}
          </button>
        </form>

        <p className="login-footer">
          Primeiro acesso? Crie sua conta usando um e-mail autorizado pela sua empresa.
        </p>
      </div>
    </div>
  );
}
