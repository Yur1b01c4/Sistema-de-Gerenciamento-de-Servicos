import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const { updatePassword } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!password || password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.')
      return
    }
    if (password !== confirmPassword) {
      setError('As senhas não coincidem.')
      return
    }

    setLoading(true)
    try {
      await updatePassword(password)
      setSuccess(true)
      setTimeout(() => navigate('/dashboard'), 3000)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div id="screen-login" className="screen active" style={{ display: 'flex' }}>
      <button className="theme-toggle" onClick={toggleTheme} aria-label="Alternar tema">
        {theme === 'dark' ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" /></svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
        )}
      </button>

      <div className="login-card">
        <div className="login-logo">
          <div className="logo-mark">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
              <path d="M16 22 L12 16 L16 10 L20 16 Z" fill="white" opacity="0.9" />
              <path d="M8 8 Q16 3 24 8" stroke="#F47B20" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              <path d="M10.5 11 Q16 7.5 21.5 11" stroke="#F47B20" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.7" />
              <circle cx="16" cy="22" r="2" fill="#F47B20" />
            </svg>
          </div>
          <div className="logo-wordmark">
            <div className="brand-jm">JM <span>TELECOM</span></div>
            <div className="brand-tagline">Sistema de Gestão</div>
          </div>
        </div>

        {success ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-4) 0' }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%', background: 'rgba(16, 185, 129, 0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--space-5)'
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
            </div>
            <h2 className="login-title" style={{ marginBottom: 'var(--space-3)' }}>Senha atualizada! ✅</h2>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
              Sua senha foi redefinida com sucesso.<br />Redirecionando para o sistema...
            </p>
          </div>
        ) : (
          <>
            <h2 className="login-title">Redefinir senha</h2>
            <p className="login-subtitle">Crie uma nova senha segura</p>

            {error && (
              <div className="alert alert-error visible" role="alert">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <div className="form-group">
                <label className="form-label" htmlFor="new-password">Nova senha</label>
                <div className="input-wrapper">
                  <svg className="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                  <input className="form-input" type={showPwd ? 'text' : 'password'} id="new-password" placeholder="Mínimo 6 caracteres" value={password} onChange={e => setPassword(e.target.value)} autoComplete="new-password" autoFocus />
                  <button type="button" className="toggle-password" onClick={() => setShowPwd(!showPwd)} aria-label="Mostrar senha">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="confirm-password">Confirmar nova senha</label>
                <div className="input-wrapper">
                  <svg className="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                  <input className="form-input" type={showPwd ? 'text' : 'password'} id="confirm-password" placeholder="Repita a senha" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} autoComplete="new-password" />
                </div>
              </div>

              <button type="submit" className={`btn btn-primary ${loading ? 'btn-loading' : ''}`} disabled={loading} style={{ marginTop: 'var(--space-3)' }}>
                <span className="btn-text">Salvar nova senha</span>
                <span className="btn-spinner">
                  <svg className="spinner-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
                  Salvando...
                </span>
              </button>
            </form>

            <a href="/login" style={{
              display: 'block', textAlign: 'center', marginTop: 'var(--space-4)',
              fontSize: 'var(--text-sm)', color: 'var(--color-accent)'
            }}>← Voltar para o login</a>
          </>
        )}

        <div className="login-footer">© 2026 JM Telecom — Todos os direitos reservados</div>
      </div>
    </div>
  )
}
