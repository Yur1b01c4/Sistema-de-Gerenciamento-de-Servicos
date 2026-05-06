import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useData } from '../contexts/DataContext'
import { Badge } from '../components/ui/Badge'
import { getSaudacao, formatarMoeda, tipoAbrev } from '../lib/utils'

export default function DashboardPage() {
  const { user } = useAuth()
  const { ordens } = useData()
  const navigate = useNavigate()

  const stats = useMemo(() => {
    const now = new Date()
    const mesAtual = now.getMonth()
    const anoAtual = now.getFullYear()
    const hojeStr = now.toDateString()

    const osMes = ordens.filter(o => { const d = new Date(o.data); return d.getMonth() === mesAtual && d.getFullYear() === anoAtual })
    const osHoje = ordens.filter(o => new Date(o.data).toDateString() === hojeStr)
    const valorMes = osMes.reduce((s, o) => s + o.valor, 0)
    const abertas = ordens.filter(o => o.status === 'aberta').length

    return { osMes: osMes.length, osHoje: osHoje.length, valorMes, abertas }
  }, [ordens])

  const ultimas = useMemo(() => [...ordens].reverse().slice(0, 10), [ordens])

  const firstName = user?.name?.split(' ')[0] || 'Técnico'

  return (
    <div className="page active" style={{ display: 'block' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">{getSaudacao()}, {firstName} 👷</p>
        </div>
        <button className="btn btn-primary" style={{ width: 'auto', padding: 'var(--space-2) var(--space-5)', fontSize: 'var(--text-sm)' }} onClick={() => navigate('/os?nova=1')}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          Nova OS
        </button>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card kpi-clickable" onClick={() => navigate('/os?filtro=mes')} title="Ver OS do mês">
          <div className="kpi-label">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
            OS no mês
          </div>
          <div className="kpi-value">{stats.osMes}</div>
          <div className="kpi-delta kpi-hint">Clique para filtrar ↗</div>
        </div>
        <div className="kpi-card kpi-clickable" onClick={() => navigate('/os?filtro=mes')} title="Ver faturamento do mês">
          <div className="kpi-label">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
            Faturado no mês
          </div>
          <div className="kpi-value success">R$ {formatarMoeda(stats.valorMes)}</div>
          <div className="kpi-delta kpi-hint">Clique para filtrar ↗</div>
        </div>
        <div className="kpi-card kpi-clickable" onClick={() => navigate('/os?filtro=hoje')} title="Ver OS de hoje">
          <div className="kpi-label">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
            OS hoje
          </div>
          <div className="kpi-value accent">{stats.osHoje}</div>
          <div className="kpi-delta kpi-hint">Clique para filtrar ↗</div>
        </div>
        <div className="kpi-card kpi-clickable" onClick={() => navigate('/os?filtro=abertas')} title="Ver OS abertas">
          <div className="kpi-label">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
            OS abertas
          </div>
          <div className="kpi-value warning">{stats.abertas}</div>
          <div className="kpi-delta kpi-hint">Clique para filtrar ↗</div>
        </div>
      </div>

      <div className="table-card">
        <div className="table-header">
          <span className="table-title">Últimas Ordens de Serviço</span>
          <button className="btn" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-accent)', padding: 'var(--space-1) var(--space-2)' }} onClick={() => navigate('/os')}>Ver todas →</button>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead><tr><th>OS</th><th>Cliente</th><th>Endereço</th><th>Serviço</th><th>Técnico</th><th>Valor</th><th>Status</th></tr></thead>
            <tbody>
              {!ultimas.length ? (
                <tr><td colSpan="7" style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: 'var(--space-8)' }}>Nenhuma OS registrada ainda</td></tr>
              ) : ultimas.map(os => (
                <tr key={os.id}>
                  <td style={{ fontWeight: 600, color: 'var(--color-accent)' }}>#{os.numero}</td>
                  <td>{os.cliente}</td>
                  <td style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)' }}>{os.endereco}, {os.numeroEnd}</td>
                  <td><span className="badge badge-primary">{tipoAbrev(os.tipo)}</span></td>
                  <td style={{ color: 'var(--color-text-muted)' }}>{os.tecnico}</td>
                  <td style={{ fontWeight: 600 }}>R$ {formatarMoeda(os.valor)}</td>
                  <td><Badge status={os.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
