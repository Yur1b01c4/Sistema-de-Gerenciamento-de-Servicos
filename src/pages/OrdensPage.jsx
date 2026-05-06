import { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useData } from '../contexts/DataContext'
import { useToast } from '../components/ui/Toast'
import { Badge } from '../components/ui/Badge'
import { ConfirmModal } from '../components/ui/Modal'
import OSForm from '../components/ordens/OSForm'
import OSConcluirForm from '../components/ordens/OSConcluirForm'
import OSDetalhe from '../components/ordens/OSDetalhe'
import { formatarMoeda, formatDataCurta, tipoAbrev } from '../lib/utils'

export default function OrdensPage() {
  const { user } = useAuth()
  const { ordens, empresas, criarOS, atualizarOS, excluirOS, concluirOS } = useData()
  const showToast = useToast()
  const [searchParams] = useSearchParams()

  const [search, setSearch] = useState('')
  const [filtStatus, setFiltStatus] = useState('')
  const [filtTecnico, setFiltTecnico] = useState('')
  const [filtroMes, setFiltroMes] = useState(null)
  const [filtroHoje, setFiltroHoje] = useState(false)

  const [formOpen, setFormOpen] = useState(false)
  const [editingOS, setEditingOS] = useState(null)
  const [concluirOpen, setConcluirOpen] = useState(false)
  const [concluirOS_obj, setConcluirOS_obj] = useState(null)
  const [detalheOpen, setDetalheOpen] = useState(false)
  const [detalheOS, setDetalheOS] = useState(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => {
    const f = searchParams.get('filtro')
    const nova = searchParams.get('nova')
    if (f === 'mes') { const now = new Date(); setFiltroMes(`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`); setFiltroHoje(false) }
    else if (f === 'hoje') { setFiltroHoje(true); setFiltroMes(null) }
    else if (f === 'abertas') { setFiltStatus('aberta'); setFiltroMes(null); setFiltroHoje(false) }
    if (nova === '1') setTimeout(() => setFormOpen(true), 100)
  }, [searchParams])

  const tecnicos = useMemo(() => [...new Set(ordens.map(o => o.tecnico))], [ordens])

  const lista = useMemo(() => {
    let l = [...ordens].reverse()
    if (search) l = l.filter(o => o.cliente.toLowerCase().includes(search.toLowerCase()) || o.endereco.toLowerCase().includes(search.toLowerCase()) || o.cidade.toLowerCase().includes(search.toLowerCase()))
    if (filtStatus) l = l.filter(o => o.status === filtStatus)
    if (filtTecnico) l = l.filter(o => o.tecnico === filtTecnico)
    if (filtroMes) l = l.filter(o => { const d = new Date(o.data); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}` === filtroMes })
    if (filtroHoje) { const h = new Date().toDateString(); l = l.filter(o => new Date(o.data).toDateString() === h) }
    return l
  }, [ordens, search, filtStatus, filtTecnico, filtroMes, filtroHoje])

  const handleSaveOS = (data) => {
    if (editingOS) { atualizarOS(editingOS.id, data); showToast('OS atualizada com sucesso!') }
    else { criarOS({ ...data, tecnico: user?.name || 'Técnico' }); showToast('OS aberta com sucesso! ✓') }
    setFormOpen(false); setEditingOS(null)
  }

  const handleConcluir = (data) => {
    if (!concluirOS_obj) return
    concluirOS(concluirOS_obj.id, data)
    setConcluirOpen(false); setConcluirOS_obj(null)
    showToast('OS concluída com sucesso! ✓')
  }

  const handleDelete = () => {
    try { excluirOS(deletingId); showToast('OS excluída.', 'error') }
    catch (err) { showToast(err.message, 'error') }
    setConfirmOpen(false); setDeletingId(null)
  }

  const abrirConcluir = (id) => {
    const os = ordens.find(o => o.id === id)
    if (os) { setConcluirOS_obj(os); setConcluirOpen(true); setDetalheOpen(false) }
  }

  const confirmarExclusao = (id) => {
    const os = ordens.find(o => o.id === id)
    if (os && os.status !== 'aberta') { showToast('Só é possível excluir OSs com status "Aberta".', 'error'); return }
    setDeletingId(id); setConfirmOpen(true)
  }

  const clearFilters = () => { setSearch(''); setFiltStatus(''); setFiltTecnico(''); setFiltroMes(null); setFiltroHoje(false) }

  const delOS = ordens.find(o => o.id === deletingId)

  return (
    <div className="page active" style={{ display: 'block' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Ordens de Serviço</h1>
          <p className="page-subtitle">{ordens.length ? `${ordens.length} OS${ordens.length > 1 ? 's' : ''} registrada${ordens.length > 1 ? 's' : ''}` : 'Nenhuma OS registrada'}</p>
        </div>
        <button className="btn btn-primary" style={{ width: 'auto', padding: 'var(--space-2) var(--space-5)', fontSize: 'var(--text-sm)' }} onClick={() => { setEditingOS(null); setFormOpen(true) }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>Nova OS
        </button>
      </div>

      <div className="os-filters">
        <div className="input-wrapper" style={{ flex: 1, minWidth: 180 }}>
          <svg className="input-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
          <input className="form-input" type="text" placeholder="Buscar cliente ou endereço..." style={{ fontSize: 'var(--text-sm)' }} value={search} onChange={e => { setSearch(e.target.value); setFiltroMes(null); setFiltroHoje(false) }} />
        </div>
        <select className="form-input" style={{ fontSize: 'var(--text-sm)', flex: '0 0 auto', width: 'auto' }} value={filtStatus} onChange={e => { setFiltStatus(e.target.value); setFiltroMes(null); setFiltroHoje(false) }}>
          <option value="">Todos os status</option><option value="aberta">Aberta</option><option value="concluida">Concluída</option><option value="faturada">Faturada</option>
        </select>
        <select className="form-input" style={{ fontSize: 'var(--text-sm)', flex: '0 0 auto', width: 'auto' }} value={filtTecnico} onChange={e => { setFiltTecnico(e.target.value); setFiltroMes(null); setFiltroHoje(false) }}>
          <option value="">Todos os técnicos</option>
          {tecnicos.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {!ordens.length ? (
        <div className="coming-soon">
          <div className="coming-soon-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg></div>
          <h3>Nenhuma OS registrada ainda</h3><p>Registre o primeiro serviço para começar.</p>
          <button className="btn btn-primary" style={{ width: 'auto', padding: 'var(--space-3) var(--space-6)' }} onClick={() => setFormOpen(true)}>Registrar primeira OS</button>
        </div>
      ) : (
        <div className="table-card"><div style={{ overflowX: 'auto' }}>
          <table><thead><tr><th>OS</th><th>Cliente</th><th>Endereço</th><th>Serviço</th><th>Técnico</th><th>Data</th><th style={{ textAlign: 'right' }}>Valor</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {!lista.length ? <tr><td colSpan="9" style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: 'var(--space-8)' }}>Nenhuma OS encontrada com esses filtros</td></tr> :
              lista.map(os => (
                <tr key={os.id}>
                  <td style={{ fontWeight: 700, color: 'var(--color-accent)', fontVariantNumeric: 'tabular-nums' }}>#{String(os.numero).padStart(3, '0')}</td>
                  <td style={{ fontWeight: 500, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{os.cliente}</td>
                  <td style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{os.endereco}, {os.numeroEnd}<br />{os.cidade}</td>
                  <td style={{ fontSize: 'var(--text-xs)' }}><span className="badge badge-primary" style={{ fontSize: '0.65rem' }}>{tipoAbrev(os.tipo)}</span></td>
                  <td style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>{os.tecnico}</td>
                  <td style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>{formatDataCurta(os.data)}</td>
                  <td style={{ fontWeight: 600, textAlign: 'right', whiteSpace: 'nowrap' }}>R$ {formatarMoeda(os.valor)}</td>
                  <td><Badge status={os.status} /></td>
                  <td>
                    <div className="os-row-actions">
                      <button className="icon-btn" title="Ver detalhes" onClick={() => { setDetalheOS(os); setDetalheOpen(true) }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg></button>
                      {os.status === 'aberta' && <>
                        <button className="icon-btn" title="Concluir" onClick={() => abrirConcluir(os.id)}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg></button>
                        <button className="icon-btn" title="Editar" onClick={() => { setEditingOS(os); setFormOpen(true) }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg></button>
                        <button className="icon-btn danger" title="Excluir" onClick={() => confirmarExclusao(os.id)}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" /></svg></button>
                      </>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div></div>
      )}

      <OSForm open={formOpen} onClose={() => { setFormOpen(false); setEditingOS(null) }} onSave={handleSaveOS} empresas={empresas} editingOS={editingOS} />
      <OSConcluirForm open={concluirOpen} onClose={() => setConcluirOpen(false)} onConcluir={handleConcluir} os={concluirOS_obj} />
      <OSDetalhe open={detalheOpen} onClose={() => setDetalheOpen(false)} os={detalheOS} onConcluir={abrirConcluir} />
      <ConfirmModal open={confirmOpen} onClose={() => { setConfirmOpen(false); setDeletingId(null) }} onConfirm={handleDelete} title="Excluir OS?" message={<>Excluir <strong>OS #{delOS ? String(delOS.numero).padStart(3,'0') : ''} — {delOS?.cliente}</strong>?</>} />
    </div>
  )
}
