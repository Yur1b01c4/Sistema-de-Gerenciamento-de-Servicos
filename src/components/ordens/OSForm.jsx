import { useState, useEffect } from 'react'
import { Modal } from '../ui/Modal'
import { parseMoeda, getDataAtualLocal, TIPOS_SERVICO } from '../../lib/utils'

export default function OSForm({ open, onClose, onSave, empresas, editingOS }) {
  const getInitial = () => ({
    empresaId: '', cliente: '', endereco: '', numeroEnd: '', cidade: '',
    tipo: '', valor: '', qt: '1', data: getDataAtualLocal(), obs: ''
  })

  const [form, setForm] = useState(getInitial())

  useEffect(() => {
    if (!open) return
    if (editingOS) {
      const d = new Date(editingOS.data)
      const pad = n => String(n).padStart(2, '0')
      setForm({
        empresaId: editingOS.empresaId, cliente: editingOS.cliente,
        endereco: editingOS.endereco, numeroEnd: editingOS.numeroEnd,
        cidade: editingOS.cidade, tipo: editingOS.tipo,
        valor: editingOS.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
        qt: String(editingOS.qt || 1), obs: editingOS.obs || '',
        data: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
      })
    } else {
      setForm({ ...getInitial(), data: getDataAtualLocal() })
    }
  }, [open, editingOS])

  const handleValor = (e) => {
    let raw = e.target.value.replace(/\D/g, '')
    if (!raw) { setForm({ ...form, valor: '' }); return }
    let num = parseInt(raw, 10) / 100
    setForm({ ...form, valor: num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) })
  }

  const handleSave = () => {
    const { empresaId, cliente, endereco, numeroEnd, cidade, tipo, data } = form
    if (!empresaId || !cliente || !endereco || !numeroEnd || !cidade || !tipo || !data) return
    const valor = parseMoeda(form.valor)
    if (valor <= 0) return
    const empresa = empresas.find(e => e.id === empresaId)
    onSave({
      empresaId, empresaNome: empresa?.nome || '', cliente: cliente.trim(),
      endereco: endereco.trim(), numeroEnd: numeroEnd.trim(), cidade: cidade.trim(),
      tipo, valor, qt: parseInt(form.qt) || 1, data, obs: form.obs.trim()
    })
    setForm(getInitial())
  }

  return (
    <Modal id="modal-os" open={open} onClose={() => { onClose(); setForm(getInitial()) }}
      title={editingOS ? `Editar OS #${editingOS.numero}` : 'Nova Ordem de Serviço'} maxWidth="600px"
      footer={<><button className="btn-ghost" onClick={() => { onClose(); setForm(getInitial()) }}>Cancelar</button><button className="btn-save" onClick={handleSave}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: 6 }}><polyline points="20 6 9 17 4 12" /></svg>Salvar OS</button></>}>
      <div className="modal-body" style={{ maxHeight: '72vh', overflowY: 'auto' }}>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Empresa contratante <span style={{ color: 'var(--color-error)' }}>*</span></label>
          <select className="form-input" value={form.empresaId} onChange={e => setForm({ ...form, empresaId: e.target.value })} required>
            <option value="">Selecione a empresa...</option>
            {empresas.map(emp => <option key={emp.id} value={emp.id}>{emp.nome}</option>)}
          </select>
        </div>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Nome do cliente <span style={{ color: 'var(--color-error)' }}>*</span></label>
          <input className="form-input" type="text" placeholder="Nome completo do cliente" value={form.cliente} onChange={e => setForm({ ...form, cliente: e.target.value })} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 90px', gap: 'var(--space-3)' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Rua / Endereço <span style={{ color: 'var(--color-error)' }}>*</span></label>
            <input className="form-input" type="text" placeholder="Nome da rua" value={form.endereco} onChange={e => setForm({ ...form, endereco: e.target.value })} />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Número <span style={{ color: 'var(--color-error)' }}>*</span></label>
            <input className="form-input" type="text" placeholder="Nº" value={form.numeroEnd} onChange={e => setForm({ ...form, numeroEnd: e.target.value })} />
          </div>
        </div>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Cidade <span style={{ color: 'var(--color-error)' }}>*</span></label>
          <input className="form-input" type="text" placeholder="Ex: Taquaritinga" value={form.cidade} onChange={e => setForm({ ...form, cidade: e.target.value })} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px', gap: 'var(--space-3)' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Tipo de serviço <span style={{ color: 'var(--color-error)' }}>*</span></label>
            <select className="form-input" value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value })} required>
              <option value="">Selecione...</option>
              {TIPOS_SERVICO.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Valor <span style={{ color: 'var(--color-error)' }}>*</span></label>
            <div className="input-wrapper"><span className="valor-prefix">R$</span><input className="form-input input-valor" type="text" placeholder="0,00" inputMode="numeric" value={form.valor} onChange={handleValor} /></div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: 'var(--space-3)' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Qtd.</label>
            <input className="form-input" type="number" value={form.qt} min="1" style={{ textAlign: 'center' }} onChange={e => setForm({ ...form, qt: e.target.value })} />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Data prevista <span style={{ color: 'var(--color-error)' }}>*</span></label>
            <input className="form-input" type="datetime-local" value={form.data} onChange={e => setForm({ ...form, data: e.target.value })} />
          </div>
        </div>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Observações</label>
          <textarea className="form-input" placeholder="Informações adicionais sobre o serviço..." rows={2} style={{ resize: 'vertical' }} value={form.obs} onChange={e => setForm({ ...form, obs: e.target.value })} />
        </div>
      </div>
    </Modal>
  )
}
