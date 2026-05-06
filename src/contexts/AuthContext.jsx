import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [ready, setReady] = useState(false)
  const initRef = useRef(false)

  useEffect(() => {
    if (initRef.current) return
    initRef.current = true

    // Hard timeout - never stay on loading screen more than 4 seconds
    const timeout = setTimeout(() => {
      console.warn('⚠️ Timeout na verificação de sessão')
      setReady(true)
    }, 4000)

    const init = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        if (error) { console.error('getSession error:', error); setReady(true); return }

        if (data?.session?.user) {
          const authUser = data.session.user
          // Build user from auth data directly (don't depend on profiles table)
          const email = authUser.email || ''
          const meta = authUser.user_metadata || {}
          const name = meta.nome || email.split('@')[0]

          setUser({
            id: authUser.id,
            email: email,
            name: name.charAt(0).toUpperCase() + name.slice(1),
            initials: (meta.iniciais || name.slice(0, 2)).toUpperCase()
          })

          // Try to enrich with profile data (non-blocking)
          try {
            const { data: profile } = await supabase
              .from('profiles')
              .select('nome, iniciais')
              .eq('id', authUser.id)
              .single()

            if (profile) {
              setUser(prev => ({
                ...prev,
                name: profile.nome || prev.name,
                initials: profile.iniciais || prev.initials
              }))
            }
          } catch (e) {
            console.warn('Perfil não encontrado:', e)
          }
        }
      } catch (err) {
        console.error('Erro sessão:', err)
      } finally {
        clearTimeout(timeout)
        setReady(true)
      }
    }

    init()

    return () => clearTimeout(timeout)
  }, [])

  const login = useCallback(async (email, password) => {
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        throw new Error(
          error.message === 'Invalid login credentials'
            ? 'E-mail ou senha incorretos. Tente novamente.'
            : error.message
        )
      }
      const authUser = data.user
      const meta = authUser.user_metadata || {}
      const name = meta.nome || email.split('@')[0]

      const profile = {
        id: authUser.id, email: authUser.email,
        name: name.charAt(0).toUpperCase() + name.slice(1),
        initials: (meta.iniciais || name.slice(0, 2)).toUpperCase()
      }
      setUser(profile)

      // Enrich with profile table (non-blocking)
      supabase.from('profiles').select('nome, iniciais').eq('id', authUser.id).single()
        .then(({ data: p }) => {
          if (p) setUser(prev => ({ ...prev, name: p.nome || prev.name, initials: p.iniciais || prev.initials }))
        }).catch(() => {})

      return profile
    } finally {
      setLoading(false)
    }
  }, [])

  const resetPassword = useCallback(async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    })
    if (error) throw new Error(error.message)
  }, [])

  const updatePassword = useCallback(async (newPassword) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) throw new Error(error.message)
  }, [])

  const logout = useCallback(async () => {
    await supabase.auth.signOut()
    setUser(null)
  }, [])

  if (!ready) {
    return (
      <AuthContext.Provider value={{ user: null, loading: true, login, logout, resetPassword, updatePassword, isAuthenticated: false }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          height: '100vh', background: '#0a0f1c', color: '#888', fontFamily: 'Inter, sans-serif'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: 32, height: 32, border: '3px solid #333', borderTop: '3px solid #F47B20',
              borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto'
            }} />
            <p style={{ marginTop: 16, fontSize: 14 }}>Carregando...</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
          </div>
        </div>
      </AuthContext.Provider>
    )
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, resetPassword, updatePassword, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
