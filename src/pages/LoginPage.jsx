import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { Modal } from '../components/ui/Modal'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [errors, setErrors] = useState({})
  const [alertMsg, setAlertMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const { login, resetPassword, loading } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  // Forgot password state
  const [showForgot, setShowForgot] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotLoading, setForgotLoading] = useState(false)
  const [forgotError, setForgotError] = useState('')
  const [forgotSent, setForgotSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setAlertMsg(''); setSuccessMsg('')
    const errs = {}
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = true
    if (!password) errs.password = true
    setErrors(errs)
    if (Object.keys(errs).length) return

    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err) {
      setAlertMsg(err.message)
      setPassword('')
    }
  }

  const handleForgotSubmit = async (e) => {
    e.preventDefault()
    setForgotError('')
    if (!forgotEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotEmail)) {
      setForgotError('Informe um e-mail válido.')
      return
    }
    setForgotLoading(true)
    try {
      await resetPassword(forgotEmail)
      setForgotSent(true)
    } catch (err) {
      setForgotError(err.message)
    } finally {
      setForgotLoading(false)
    }
  }

  const openForgot = (e) => {
    e.preventDefault()
    setForgotEmail(email) // pre-fill with current email
    setForgotError('')
    setForgotSent(false)
    setShowForgot(true)
  }

  const closeForgot = () => {
    setShowForgot(false)
    if (forgotSent) {
      setSuccessMsg('E-mail de recuperação enviado! Verifique sua caixa de entrada.')
      setAlertMsg('')
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
            <div className="brand-jm">GESTÃO <span>SERVIÇOS</span></div>
            <div className="brand-tagline">Sistema de Gestão</div>
          </div>
        </div>

        {alertMsg && (
          <div className="alert alert-error visible" role="alert">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
            <span>{alertMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="alert alert-success visible" role="alert" style={{
            background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)',
            color: 'var(--color-success)', borderRadius: 'var(--radius-md)', padding: 'var(--space-3) var(--space-4)',
            fontSize: 'var(--text-sm)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-4)'
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
            <span>{successMsg}</span>
          </div>
        )}

        <h2 className="login-title">Entrar na sua conta</h2>
        <p className="login-subtitle">Bem-vindo de volta 👋</p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="input-email">E-mail</label>
            <div className="input-wrapper">
              <svg className="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
              <input className={`form-input ${errors.email ? 'error' : ''}`} type="email" id="input-email" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" />
            </div>
            {errors.email && <div className="form-error visible"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg><span>E-mail inválido</span></div>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="input-password">Senha</label>
            <div className="input-wrapper">
              <svg className="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
              <input className={`form-input ${errors.password ? 'error' : ''}`} type={showPwd ? 'text' : 'password'} id="input-password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" />
              <button type="button" className="toggle-password" onClick={() => setShowPwd(!showPwd)} aria-label="Mostrar senha">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
              </button>
            </div>
            {errors.password && <div className="form-error visible"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg><span>Senha obrigatória</span></div>}
          </div>

          <a href="#" className="forgot-link" onClick={openForgot}>Esqueci minha senha</a>

          <button type="submit" className={`btn btn-primary ${loading ? 'btn-loading' : ''}`} disabled={loading}>
            <span className="btn-text">Entrar</span>
            <span className="btn-spinner">
              <svg className="spinner-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
              Entrando...
            </span>
          </button>
        </form>

        <div className="login-footer">© 2026 Gestão Serviços — Todos os direitos reservados</div>
      </div>

      {/* Modal Esqueci Minha Senha */}
      <Modal open={showForgot} onClose={closeForgot} title={forgotSent ? '📧 E-mail enviado!' : '🔐 Recuperar senha'} maxWidth="440px">
        {forgotSent ? (
          <div className="modal-body" style={{ textAlign: 'center', padding: 'var(--space-6) var(--space-5)' }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%', background: 'rgba(16, 185, 129, 0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--space-5)'
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
            </div>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', lineHeight: 1.6, marginBottom: 'var(--space-2)' }}>
              Enviamos um link de recuperação para:
            </p>
            <p style={{ fontWeight: 600, fontSize: 'var(--text-base)', color: 'var(--color-text)', marginBottom: 'var(--space-5)' }}>
              {forgotEmail}
            </p>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
              Verifique sua caixa de entrada e spam. O link expira em 1 hora.
            </p>
          </div>
        ) : (
          <form onSubmit={handleForgotSubmit}>
            <div className="modal-body">
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-5)', lineHeight: 1.5 }}>
                Informe o e-mail cadastrado. Enviaremos um link para redefinir sua senha.
              </p>

              {forgotError && (
                <div className="alert alert-error visible" role="alert" style={{ marginBottom: 'var(--space-4)' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                  <span>{forgotError}</span>
                </div>
              )}

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">E-mail</label>
                <div className="input-wrapper">
                  <svg className="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                  <input className="form-input" type="email" placeholder="seu@email.com" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} autoFocus />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn-ghost" onClick={closeForgot}>Cancelar</button>
              <button type="submit" className={`btn-save ${forgotLoading ? 'btn-loading' : ''}`} disabled={forgotLoading} style={{ minWidth: 180 }}>
                {forgotLoading ? (
                  <><svg className="spinner-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: 6, animation: 'spin 0.8s linear infinite' }}><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>Enviando...</>
                ) : (
                  <><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: 6 }}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>Enviar link</>
                )}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  )
}
