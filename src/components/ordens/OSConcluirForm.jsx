import { useState, useEffect } from 'react'
import { Modal } from '../ui/Modal'
import { getDataAtualLocal } from '../../lib/utils'

export default function OSConcluirForm({ open, onClose, onConcluir, os }) {
  const [data, setData] = useState('')
  const [obs, setObs] = useState('')
  const [foto, setFoto] = useState(null)
  const [fotoPreview, setFotoPreview] = useState('')
  const [gps, setGps] = useState(null)
  const [gpsStatus, setGpsStatus] = useState('')
  const [gpsText, setGpsText] = useState('Não capturado')

  useEffect(() => {
    if (open) {
      setData(getDataAtualLocal()); setObs(''); setFoto(null); setFotoPreview(''); setGps(null)
      setGpsStatus(''); setGpsText('Não capturado')
      setTimeout(capturarGPS, 400)
    }
  }, [open])

  const capturarGPS = () => {
    setGpsStatus('capturing'); setGpsText('Capturando...')
    if (!navigator.geolocation) { setGpsStatus('error'); setGpsText('GPS não disponível'); return }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const g = { lat: pos.coords.latitude.toFixed(6), lng: pos.coords.longitude.toFixed(6), precisao: Math.round(pos.coords.accuracy), ts: new Date().toISOString() }
        setGps(g); setGpsStatus('captured')
        setGpsText(`Lat: ${g.lat} / Lng: ${g.lng} (±${g.precisao}m)`)
      },
      () => { setGpsStatus('error'); setGpsText('Erro ao capturar GPS') },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const handleFoto = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const MAX = 1200
        let w = img.width, h = img.height
        if (w > MAX) { h = Math.round(h * MAX / w); w = MAX }
        canvas.width = w; canvas.height = h
        canvas.getContext('2d').drawImage(img, 0, 0, w, h)
        const base64 = canvas.toDataURL('image/jpeg', 0.75)
        setFoto(base64); setFotoPreview(base64)
      }
      img.src = ev.target.result
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = () => {
    onConcluir({ dataExecucao: data, obsExecucao: obs, foto, gps })
  }

  return (
    <Modal id="modal-concluir" open={open} onClose={onClose} maxWidth="520px"
      title={os ? `Concluir OS #${String(os.numero).padStart(3, '0')}` : 'Concluir OS'}
      footer={<><button className="btn-ghost" onClick={onClose}>Cancelar</button><button className="btn-save" style={{ background: 'var(--color-success)', boxShadow: 'none', minWidth: 160 }} onClick={handleSubmit}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: 6 }}><polyline points="20 6 9 17 4 12" /></svg>Concluir OS</button></>}>
      <div className="modal-body" style={{ maxHeight: '72vh', overflowY: 'auto' }}>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Data / Hora de execução <span style={{ color: 'var(--color-error)' }}>*</span></label>
          <input className="form-input" type="datetime-local" value={data} onChange={e => setData(e.target.value)} />
        </div>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Localização GPS <span style={{ fontSize: 'var(--text-xs)', fontWeight: 400, color: 'var(--color-text-muted)', marginLeft: 'var(--space-2)' }}>opcional</span></label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
            <div className={`gps-status ${gpsStatus}`}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
              <span>{gpsText}</span>
            </div>
            <button type="button" className="btn-ghost" style={{ padding: 'var(--space-2) var(--space-4)', fontSize: 'var(--text-xs)', minWidth: 'auto' }} onClick={capturarGPS}>Capturar GPS</button>
          </div>
        </div>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Foto de evidência <span style={{ fontSize: 'var(--text-xs)', fontWeight: 400, color: 'var(--color-text-muted)', marginLeft: 'var(--space-2)' }}>opcional</span></label>
          <div className={`foto-preview-area ${fotoPreview ? 'has-photo' : ''}`} onClick={() => document.getElementById('concluir-foto-inp').click()}>
            <input type="file" id="concluir-foto-inp" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={handleFoto} />
            <div className="foto-placeholder">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>
              <span>Toque para tirar foto ou selecionar</span>
            </div>
            {fotoPreview && <img className="foto-preview-img" src={fotoPreview} alt="Foto" style={{ display: 'block' }} />}
            {fotoPreview && <button type="button" className="foto-remove-btn" style={{ display: 'flex' }} onClick={e => { e.stopPropagation(); setFoto(null); setFotoPreview('') }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg></button>}
          </div>
        </div>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Observações da execução</label>
          <textarea className="form-input" placeholder="Ex: Cliente não estava, serviço realizado na caixa externa..." rows={3} style={{ resize: 'vertical' }} value={obs} onChange={e => setObs(e.target.value)} />
        </div>
      </div>
    </Modal>
  )
}
