import { Modal } from '../ui/Modal'
import { Badge } from '../ui/Badge'
import { formatarMoeda } from '../../lib/utils'

export default function OSDetalhe({ open, onClose, os, onConcluir }) {
  if (!os) return null
  const d = new Date(os.data)
  const dataF = d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }) + ' às ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

  const showConcluir = os.status === 'aberta'

  return (
    <Modal id="modal-os-detalhe" open={open} onClose={onClose} maxWidth="560px"
      title={<><span>OS #{String(os.numero).padStart(3, '0')}</span><div style={{ marginTop: 4 }}><Badge status={os.status} /></div></>}
      footer={<><button className="btn-ghost" onClick={onClose}>Fechar</button>{showConcluir && <button className="btn-save" style={{ background: 'var(--color-success)', boxShadow: 'none' }} onClick={() => onConcluir(os.id)}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: 6 }}><polyline points="20 6 9 17 4 12" /></svg>Marcar como Concluída</button>}</>}>
      <div className="modal-body" style={{ maxHeight: '75vh', overflowY: 'auto' }}>
        {os.foto && <img className="os-detail-photo" src={os.foto} alt="Foto de evidência" style={{ marginBottom: 'var(--space-5)' }} />}
        <div className="os-detail-grid">
          <div className="os-detail-section"><div className="os-detail-label">Empresa contratante</div><div className="os-detail-value">{os.empresaNome || '—'}</div></div>
          <div className="os-detail-section"><div className="os-detail-label">Técnico</div><div className="os-detail-value">{os.tecnico}</div></div>
          <div className="os-detail-section"><div className="os-detail-label">Cliente</div><div className="os-detail-value">{os.cliente}</div></div>
          <div className="os-detail-section"><div className="os-detail-label">Data / Hora</div><div className="os-detail-value">{dataF}</div></div>
          <div className="os-detail-section" style={{ gridColumn: '1/-1' }}><div className="os-detail-label">Endereço</div><div className="os-detail-value">{os.endereco}, {os.numeroEnd} — {os.cidade}</div></div>
          <div className="os-detail-section"><div className="os-detail-label">Tipo de serviço</div><div className="os-detail-value">{os.tipo}</div></div>
          <div className="os-detail-section"><div className="os-detail-label">Valor</div><div className="os-detail-value" style={{ fontWeight: 700, fontSize: 'var(--text-lg)', color: 'var(--color-success)' }}>R$ {formatarMoeda(os.valor)}</div></div>
          {os.gps && <div className="os-detail-section" style={{ gridColumn: '1/-1' }}><div className="os-detail-label">Localização GPS</div><div className="os-detail-value" style={{ fontFamily: 'monospace', fontSize: 'var(--text-xs)' }}>Lat: {os.gps.lat} / Lng: {os.gps.lng}{os.gps.ts && <><br />Capturado em: {new Date(os.gps.ts).toLocaleString('pt-BR')}</>}</div></div>}
          {os.obs && <div className="os-detail-section" style={{ gridColumn: '1/-1' }}><div className="os-detail-label">Observações</div><div className="os-detail-value">{os.obs}</div></div>}
        </div>
      </div>
    </Modal>
  )
}
