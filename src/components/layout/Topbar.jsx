import { useTheme } from '../../contexts/ThemeContext'
import { useAuth } from '../../contexts/AuthContext'

export default function Topbar({ onMenuToggle }) {
  const { theme, toggleTheme } = useTheme()
  const { user } = useAuth()

  return (
    <header className="topbar">
      <button className="topbar-menu-btn" id="menu-toggle" aria-label="Menu" onClick={onMenuToggle}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      <div className="topbar-logo">
        <div className="topbar-logo-mark">
          <svg width="18" height="18" viewBox="0 0 32 32" fill="none" aria-hidden="true">
            <path d="M16 22 L12 16 L16 10 L20 16 Z" fill="white" opacity="0.9" />
            <path d="M8 8 Q16 3 24 8" stroke="#F47B20" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <path d="M10.5 11 Q16 7.5 21.5 11" stroke="#F47B20" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.7" />
            <circle cx="16" cy="22" r="2" fill="#F47B20" />
          </svg>
        </div>
        <span className="topbar-brand">GESTÃO <span>SERVIÇOS</span></span>
      </div>

      <div className="sync-badge synced" id="sync-badge">
        <div className="sync-dot"></div>
        <span>Sincronizado</span>
      </div>

      <button className="theme-toggle" style={{ position: 'static', width: 36, height: 36 }} onClick={toggleTheme} aria-label="Alternar tema">
        {theme === 'dark' ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" /></svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
        )}
      </button>

      <div className="user-btn">
        <div className="user-avatar">{user?.initials || '??'}</div>
        <span className="user-name">{user?.name || 'Usuário'}</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
      </div>
    </header>
  )
}
