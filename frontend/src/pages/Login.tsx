import React, { useState } from 'react';
import './Login.css';

interface LoginProps {
  onLogin: () => void;
}

export function Login({ onLogin }: LoginProps) {
  const [activeTab, setActiveTab] = useState<'entrar' | 'criar'>('entrar');
  const [email, setEmail] = useState('voce@studio.com');
  const [password, setPassword] = useState('password123');
  const [rememberMe, setRememberMe] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate authentication
    localStorage.setItem('isAuthenticated', 'true');
    onLogin();
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
            onClick={() => setActiveTab('entrar')}
          >
            Entrar
          </button>
          <button 
            type="button" 
            className={`login-tab ${activeTab === 'criar' ? 'active' : ''}`}
            onClick={() => setActiveTab('criar')}
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

          <button type="submit" className="btn-login">
            {activeTab === 'entrar' ? 'Entrar' : 'Criar conta'}
          </button>
        </form>

        <p className="login-footer">
          Primeiro acesso? Crie sua conta usando um e-mail autorizado pela sua empresa.
        </p>
      </div>
    </div>
  );
}
