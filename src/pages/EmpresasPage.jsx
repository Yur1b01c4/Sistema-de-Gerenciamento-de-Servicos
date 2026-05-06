import { useState } from 'react'
import { useData } from '../contexts/DataContext'
import { useToast } from '../components/ui/Toast'
import { Modal, ConfirmModal } from '../components/ui/Modal'
import { formatarCNPJ, getIniciais } from '../lib/utils'

export default function EmpresasPage() {
  const { empresas, ordens, criarEmpresa, atualizarEmpresa, excluirEmpresa } = useData()
  const showToast = useToast()
  const [modalOpen, setModalOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [form, setForm] = useState({ nome: '', cnpj: '', endereco: '', cidade: '', estado: '', observacoes: '', contatos: [{ nome: '', email: '' }] })

  const resetForm = () => { setForm({ nome: '', cnpj: '', endereco: '', cidade: '', estado: '', observacoes: '', contatos: [{ nome: '', email: '' }] }); setEditingId(null) }

  const abrirNova = () => { resetForm(); setModalOpen(true) }

  const abrirEdicao = (id) => {
    const emp = empresas.find(e => e.id === id)
    if (!emp) return
    setEditingId(id)
    setForm({ nome: emp.nome, cnpj: emp.cnpj || '', endereco: emp.endereco || '', cidade: emp.cidade || '', estado: emp.estado || '', observacoes: emp.observacoes || '', contatos: emp.contatos?.length ? emp.contatos : [{ nome: '', email: '' }] })
    setModalOpen(true)
  }

  const salvar = () => {
    if (!form.nome.trim()) { showToast('O nome da empresa é obrigatório.', 'error'); return }
    const contatos = form.contatos.filter(c => c.nome || c.email)
    const data = { ...form, contatos }
    if (editingId) { atualizarEmpresa(editingId, data); showToast(`${form.nome} atualizada com sucesso!`) }
    else { criarEmpresa(data); showToast(`${form.nome} cadastrada com sucesso!`) }
    setModalOpen(false); resetForm()
  }

  const confirmarExclusao = (id) => {
    const temOS = ordens.some(o => o.empresaId === id)
    if (temOS) { showToast('Não é possível excluir: existem OSs vinculadas a esta empresa.', 'error'); return }
    setDeletingId(id); setConfirmOpen(true)
  }

  const handleDelete = () => {
    try {
      const emp = empresas.find(e => e.id === deletingId)
      excluirEmpresa(deletingId)
      showToast(`${emp?.nome || 'Empresa'} excluída.`, 'error')
    } catch (err) { showToast(err.message, 'error') }
    setConfirmOpen(false); setDeletingId(null)
  }

  const updateContato = (idx, field, value) => {
    const updated = [...form.contatos]
    updated[idx] = { ...updated[idx], [field]: value }
    setForm({ ...form, contatos: updated })
  }

  const addContato = () => setForm({ ...form, contatos: [...form.contatos, { nome: '', email: '' }] })

  const removeContato = (idx) => {
    if (form.contatos.length <= 1) { updateContato(0, 'nome', ''); updateContato(0, 'email', ''); return }
    setForm({ ...form, contatos: form.contatos.filter((_, i) => i !== idx) })
  }

  const deletingEmp = empresas.find(e => e.id === deletingId)

  return (
    <div className="page active" style={{ display: 'block' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Empresas Contratantes</h1>
          <p className="page-subtitle">{empresas.length ? `${empresas.length} empresa${empresas.length > 1 ? 's' : ''} cadastrada${empresas.length > 1 ? 's' : ''}` : 'Nenhuma empresa cadastrada'}</p>
        </div>
        <button className="btn btn-primary" style={{ width: 'auto', padding: 'var(--space-2) var(--space-5)', fontSize: 'var(--text-sm)' }} onClick={abrirNova}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          Nova Empresa
        </button>
      </div>

      {!empresas.length ? (
        <div className="coming-soon">
          <div className="coming-soon-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg></div>
          <h3>Nenhuma empresa cadastrada</h3>
          <p>Cadastre a primeira empresa contratante para começar a registrar serviços e gerar relatórios.</p>
          <button className="btn btn-primary" style={{ width: 'auto', padding: 'var(--space-3) var(--space-6)' }} onClick={abrirNova}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            Cadastrar primeira empresa
          </button>
        </div>
      ) : (
        <div className="empresas-grid">
          {empresas.map(emp => (
            <div key={emp.id} className="empresa-card">
              <div className="empresa-card-header">
                <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-start', flex: 1, minWidth: 0 }}>
                  <div className="empresa-card-avatar">{getIniciais(emp.nome)}</div>
                  <div style={{ minWidth: 0 }}>
                    <div className="empresa-card-name">{emp.nome}</div>
                    <div className="empresa-card-cnpj">{emp.cnpj || '—'}</div>
                  </div>
                </div>
                <div className="empresa-card-actions">
                  <button className="icon-btn" title="Editar" onClick={() => abrirEdicao(emp.id)}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                  </button>
                  <button className="icon-btn danger" title="Excluir" onClick={() => confirmarExclusao(emp.id)}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" /></svg>
                  </button>
                </div>
              </div>
              <div className="empresa-card-info">
                {emp.cidade && <div className="empresa-info-row"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>{emp.cidade}{emp.estado ? ` — ${emp.estado}` : ''}</div>}
                {emp.endereco && <div className="empresa-info-row"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></svg>{emp.endereco}</div>}
              </div>
              <div className="empresa-card-footer">
                <div className="empresa-contatos-count"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>{emp.contatos?.length || 0} contato{(emp.contatos?.length || 0) !== 1 ? 's' : ''} para relatório</div>
                <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>Ativa</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal id="modal-empresa" open={modalOpen} onClose={() => { setModalOpen(false); resetForm() }} title={editingId ? 'Editar Empresa' : 'Nova Empresa'} footer={<><button className="btn-ghost" onClick={() => { setModalOpen(false); resetForm() }}>Cancelar</button><button className="btn-save" onClick={salvar}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: 6 }}><polyline points="20 6 9 17 4 12" /></svg>Salvar empresa</button></>}>
        <div className="modal-body">
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Nome da empresa <span style={{ color: 'var(--color-error)' }}>*</span></label>
            <div className="input-wrapper"><svg className="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg><input className="form-input" type="text" placeholder="Ex: Insta Net Telecom" value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} /></div>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">CNPJ</label>
            <div className="input-wrapper"><svg className="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg><input className="form-input" type="text" placeholder="00.000.000/0000-00" maxLength={18} value={form.cnpj} onChange={e => setForm({ ...form, cnpj: formatarCNPJ(e.target.value) })} /></div>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Endereço</label>
            <div className="input-wrapper"><svg className="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg><input className="form-input" type="text" placeholder="Rua, número, bairro" value={form.endereco} onChange={e => setForm({ ...form, endereco: e.target.value })} /></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px', gap: 'var(--space-3)' }}>
            <div className="form-group" style={{ marginBottom: 0 }}><label className="form-label">Cidade</label><input className="form-input" type="text" placeholder="Ex: Taquaritinga" value={form.cidade} onChange={e => setForm({ ...form, cidade: e.target.value })} /></div>
            <div className="form-group" style={{ marginBottom: 0 }}><label className="form-label">UF</label><input className="form-input" type="text" placeholder="SP" maxLength={2} style={{ textTransform: 'uppercase' }} value={form.estado} onChange={e => setForm({ ...form, estado: e.target.value })} /></div>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}><label className="form-label">Observações</label><textarea className="form-input" placeholder="Informações adicionais..." rows={2} style={{ resize: 'vertical' }} value={form.observacoes} onChange={e => setForm({ ...form, observacoes: e.target.value })} /></div>
          <div>
            <label className="form-label" style={{ marginBottom: 'var(--space-2)' }}>Contatos para envio de relatório</label>
            <div className="contatos-list">
              {form.contatos.map((c, i) => (
                <div key={i} className="contato-row">
                  <input className="form-input" type="text" placeholder="Nome do contato" value={c.nome} onChange={e => updateContato(i, 'nome', e.target.value)} style={{ flex: 0.9 }} />
                  <input className="form-input" type="email" placeholder="E-mail para relatório" value={c.email} onChange={e => updateContato(i, 'email', e.target.value)} style={{ flex: 1.2 }} />
                  <button type="button" className="btn-remove-contato" title="Remover" onClick={() => removeContato(i)}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg></button>
                </div>
              ))}
            </div>
            <button type="button" className="btn-add-contato" onClick={addContato}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>Adicionar contato</button>
          </div>
        </div>
      </Modal>

      <ConfirmModal open={confirmOpen} onClose={() => { setConfirmOpen(false); setDeletingId(null) }} onConfirm={handleDelete} title="Excluir empresa?" message={<>Tem certeza que deseja excluir <strong>{deletingEmp?.nome}</strong>? Esta ação não pode ser desfeita.</>} />
    </div>
  )
}
