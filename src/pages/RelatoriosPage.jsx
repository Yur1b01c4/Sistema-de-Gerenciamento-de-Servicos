import { useState, useMemo } from 'react'
import { useData } from '../contexts/DataContext'
import { useToast } from '../components/ui/Toast'
import { Badge } from '../components/ui/Badge'
import { formatarMoeda, tipoAbrev } from '../lib/utils'

export default function RelatoriosPage() {
  const { ordens, empresas, marcarFaturadas } = useData()
  const showToast = useToast()
  const [empresaId, setEmpresaId] = useState('')
  const [dataInicio, setDataInicio] = useState(() => { const n = new Date(); return `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,'0')}-01` })
  const [dataFim, setDataFim] = useState(() => { const n = new Date(new Date().getFullYear(), new Date().getMonth()+1, 0); return `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,'0')}-${String(n.getDate()).padStart(2,'0')}` })
  const [tecnico, setTecnico] = useState('')
  const [showPreview, setShowPreview] = useState(false)
  const [osFiltradas, setOsFiltradas] = useState([])

  const tecnicos = useMemo(() => [...new Set(ordens.map(o => o.tecnico))], [ordens])

  const gerarPrevia = () => {
    if (!empresaId) { showToast('Selecione a empresa contratante.', 'error'); return }
    if (!dataInicio || !dataFim) { showToast('Informe o período completo.', 'error'); return }
    const inicio = new Date(dataInicio + 'T00:00:00')
    const fim = new Date(dataFim + 'T23:59:59')
    const filtradas = ordens.filter(os => {
      const d = new Date(os.data)
      if (os.empresaId !== empresaId) return false
      if (d < inicio || d > fim) return false
      if (tecnico && os.tecnico !== tecnico) return false
      if (os.status !== 'concluida') return false
      return true
    })
    setOsFiltradas(filtradas)
    setShowPreview(true)
    if (!filtradas.length) showToast('Nenhuma OS concluída encontrada para os filtros.', 'error')
  }

  const totalValor = osFiltradas.reduce((s, o) => s + o.valor, 0)
  const totalQt = osFiltradas.reduce((s, o) => s + (o.qt || 1), 0)
  const concluidas = osFiltradas.filter(o => o.status === 'concluida').length
  const faturadas = osFiltradas.filter(o => o.status === 'faturada').length
  const emp = empresas.find(e => e.id === empresaId)

  const handleMarcarFaturadas = () => {
    const ids = osFiltradas.filter(o => o.status === 'concluida').map(o => o.id)
    if (!ids.length) { showToast('Nenhuma OS concluída para faturar.', 'error'); return }
    marcarFaturadas(ids)
    gerarPrevia()
    showToast(`${ids.length} OS${ids.length > 1 ? 's' : ''} marcada${ids.length > 1 ? 's' : ''} como faturada${ids.length > 1 ? 's' : ''}! ✓`)
  }

  const exportarPDF = () => {
    if (!osFiltradas.length) { showToast('Gere a prévia primeiro.', 'error'); return }
    const { jsPDF } = window.jspdf
    const doc = new jsPDF()
    const empNome = emp?.nome || 'Empresa'
    const empCnpj = emp?.cnpj || ''
    const inicioBR = new Date(dataInicio+'T00:00:00').toLocaleDateString('pt-BR')
    const fimBR = new Date(dataFim+'T00:00:00').toLocaleDateString('pt-BR')
    const tecStr = tecnico || [...new Set(osFiltradas.map(o => o.tecnico))].join(' / ')

    doc.setFillColor(10, 27, 61); doc.rect(0, 0, 210, 38, 'F')
    doc.setFillColor(244, 123, 32); doc.rect(0, 38, 210, 2, 'F')
    doc.setTextColor(255, 255, 255); doc.setFont('helvetica', 'bold'); doc.setFontSize(22); doc.text('JM TELECOM', 15, 18)
    doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.text('Serviços de Telecomunicações', 15, 25); doc.text('(16) 98199-3048', 15, 31)

    doc.setTextColor(10, 27, 61); doc.setFont('helvetica', 'bold'); doc.setFontSize(13); doc.text('RELATÓRIO DE SERVIÇOS', 15, 52)
    doc.setDrawColor(244, 123, 32); doc.setLineWidth(0.5); doc.line(15, 55, 80, 55)
    doc.setFontSize(10); doc.setTextColor(80, 80, 80)
    doc.setFont('helvetica', 'normal'); doc.text('Empresa:', 15, 63); doc.setFont('helvetica', 'bold'); doc.text(empNome + (empCnpj ? '  —  ' + empCnpj : ''), 44, 63)
    doc.setFont('helvetica', 'normal'); doc.text('Período:', 15, 69); doc.setFont('helvetica', 'bold'); doc.text(`${inicioBR} a ${fimBR}`, 44, 69)
    doc.setFont('helvetica', 'normal'); doc.text('Técnico(s):', 15, 75); doc.setFont('helvetica', 'bold'); doc.text(tecStr, 44, 75)

    const tableBody = osFiltradas.map((os, i) => [i+1, os.cliente, `${os.endereco}, ${os.numeroEnd}`, os.cidade, tipoAbrev(os.tipo), new Date(os.data).toLocaleDateString('pt-BR'), `R$ ${formatarMoeda(os.valor)}`, os.qt || 1])
    doc.autoTable({
      startY: 82, head: [['#', 'Cliente', 'Endereço', 'Cidade', 'Serviço', 'Data', 'Valor', 'Qt']], body: tableBody,
      foot: [['', '', '', '', '', `Total (${osFiltradas.length})`, `R$ ${formatarMoeda(totalValor)}`, totalQt]],
      styles: { fontSize: 8, cellPadding: 3, lineColor: [200, 205, 214], lineWidth: 0.25 },
      headStyles: { fillColor: [10, 27, 61], textColor: 255, fontStyle: 'bold', fontSize: 8 },
      footStyles: { fillColor: [10, 27, 61], textColor: 255, fontStyle: 'bold', fontSize: 9 },
      alternateRowStyles: { fillColor: [245, 245, 247] },
      columnStyles: { 0: { cellWidth: 10, halign: 'center' }, 6: { halign: 'right', fontStyle: 'bold' }, 7: { cellWidth: 12, halign: 'center' } },
      margin: { left: 15, right: 15 },
    })
    const finalY = doc.lastAutoTable.finalY + 12
    doc.setDrawColor(200, 200, 200); doc.setLineWidth(0.3); doc.line(15, finalY-4, 195, finalY-4)
    doc.setFontSize(8); doc.setTextColor(160, 160, 160); doc.setFont('helvetica', 'normal')
    doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 15, finalY); doc.text('JM Telecom — (16) 98199-3048', 15, finalY+5)
    doc.save(`relatorio_${empNome.replace(/\s+/g, '_')}_${dataInicio}_a_${dataFim}.pdf`)
    showToast('PDF exportado com sucesso! 📄')
  }

  const exportarXLSX = () => {
    if (!osFiltradas.length) { showToast('Gere a prévia primeiro.', 'error'); return }
    const empNome = emp?.nome || 'Empresa'
    const header = ['TÉCNICO', 'MÊS', 'CIDADE', 'CLIENTE', 'ENDEREÇO', 'NUM', 'DATA', 'TIPO DE SERVIÇO', 'VALOR', 'QT']
    const rows = osFiltradas.map(os => [os.tecnico, new Date(os.data).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }), os.cidade, os.cliente, os.endereco, os.numeroEnd, new Date(os.data).toLocaleDateString('pt-BR'), os.tipo, os.valor, os.qt || 1])
    const totalsRow = ['', '', '', '', '', '', '', 'TOTAL', totalValor, totalQt]
    const ws = XLSX.utils.aoa_to_sheet([header, ...rows, totalsRow])
    ws['!cols'] = [{wch:16},{wch:18},{wch:16},{wch:22},{wch:26},{wch:6},{wch:12},{wch:28},{wch:12},{wch:5}]
    const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, 'Serviços')
    XLSX.writeFile(wb, `relatorio_${empNome.replace(/\s+/g, '_')}_${dataInicio}_a_${dataFim}.xlsx`)
    showToast('XLSX exportado com sucesso! 📊')
  }

  return (
    <div className="page active" style={{ display: 'block' }}>
      <div className="page-header"><div><h1 className="page-title">Gerar Relatório</h1><p className="page-subtitle">Exporte PDF ou XLSX por empresa e período</p></div></div>
      <div className="relatorio-filtros">
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Empresa contratante <span style={{ color: 'var(--color-error)' }}>*</span></label>
          <select className="form-input" value={empresaId} onChange={e => setEmpresaId(e.target.value)}><option value="">Selecione a empresa...</option>{empresas.map(e => <option key={e.id} value={e.id}>{e.nome}</option>)}</select>
        </div>
        <div className="relatorio-filtros-row">
          <div className="form-group" style={{ marginBottom: 0 }}><label className="form-label">Data início <span style={{ color: 'var(--color-error)' }}>*</span></label><input className="form-input" type="date" value={dataInicio} onChange={e => setDataInicio(e.target.value)} /></div>
          <div className="form-group" style={{ marginBottom: 0 }}><label className="form-label">Data fim <span style={{ color: 'var(--color-error)' }}>*</span></label><input className="form-input" type="date" value={dataFim} onChange={e => setDataFim(e.target.value)} /></div>
        </div>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Técnico</label>
          <select className="form-input" value={tecnico} onChange={e => setTecnico(e.target.value)}><option value="">Todos os técnicos</option>{tecnicos.map(t => <option key={t} value={t}>{t}</option>)}</select>
        </div>
        <div className="relatorio-filtros-actions">
          <button className="btn btn-primary" style={{ width: 'auto', padding: 'var(--space-3) var(--space-6)' }} onClick={gerarPrevia}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>Gerar Prévia
          </button>
        </div>
      </div>

      {showPreview && osFiltradas.length > 0 && (
        <div>
          <div className="relatorio-summary">
            <div className="relatorio-summary-card"><div className="relatorio-summary-label">Total de serviços</div><div className="relatorio-summary-value">{osFiltradas.length}</div></div>
            <div className="relatorio-summary-card"><div className="relatorio-summary-label">Valor total</div><div className="relatorio-summary-value" style={{ color: 'var(--color-success)' }}>R$ {formatarMoeda(totalValor)}</div></div>
            <div className="relatorio-summary-card"><div className="relatorio-summary-label">Quantidade</div><div className="relatorio-summary-value">{totalQt}</div></div>
            <div className="relatorio-summary-card"><div className="relatorio-summary-label">Status</div><div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'center', flexWrap: 'wrap', marginTop: 'var(--space-1)' }}>{concluidas > 0 && <Badge status="concluida" />}{faturadas > 0 && <Badge status="faturada" />}</div></div>
          </div>
          <div className="table-card">
            <div className="table-header"><span className="table-title">{emp?.nome || ''} — {new Date(dataInicio+'T00:00:00').toLocaleDateString('pt-BR')} a {new Date(dataFim+'T00:00:00').toLocaleDateString('pt-BR')}</span></div>
            <div style={{ overflowX: 'auto' }}>
              <table><thead><tr><th>#</th><th>Cliente</th><th>Endereço</th><th>Cidade</th><th>Serviço</th><th>Data</th><th>Técnico</th><th style={{ textAlign: 'right' }}>Valor</th><th style={{ textAlign: 'center' }}>Qt</th><th>Status</th></tr></thead>
                <tbody>{osFiltradas.map((os, i) => (
                  <tr key={os.id}>
                    <td style={{ fontWeight: 600, color: 'var(--color-accent)' }}>{i+1}</td><td style={{ fontWeight: 500 }}>{os.cliente}</td>
                    <td style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>{os.endereco}, {os.numeroEnd}</td><td style={{ fontSize: 'var(--text-xs)' }}>{os.cidade}</td>
                    <td><span className="badge badge-primary" style={{ fontSize: '0.65rem' }}>{tipoAbrev(os.tipo)}</span></td>
                    <td style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>{new Date(os.data).toLocaleDateString('pt-BR')}</td>
                    <td style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>{os.tecnico}</td>
                    <td style={{ fontWeight: 600, textAlign: 'right', whiteSpace: 'nowrap' }}>R$ {formatarMoeda(os.valor)}</td>
                    <td style={{ textAlign: 'center' }}>{os.qt || 1}</td><td><Badge status={os.status} /></td>
                  </tr>
                ))}</tbody>
                <tfoot><tr style={{ background: 'var(--color-surface-offset)', fontWeight: 700 }}>
                  <td colSpan="7" style={{ fontSize: 'var(--text-sm)', borderTop: '2px solid var(--color-border)' }}>Total: {osFiltradas.length} serviço{osFiltradas.length > 1 ? 's' : ''}</td>
                  <td style={{ textAlign: 'right', fontSize: 'var(--text-sm)', borderTop: '2px solid var(--color-border)', whiteSpace: 'nowrap', color: 'var(--color-success)' }}>R$ {formatarMoeda(totalValor)}</td>
                  <td style={{ textAlign: 'center', fontSize: 'var(--text-sm)', borderTop: '2px solid var(--color-border)' }}>{totalQt}</td><td style={{ borderTop: '2px solid var(--color-border)' }}></td>
                </tr></tfoot>
              </table>
            </div>
          </div>
          <div className="relatorio-actions">
            <button className="btn-export btn-export-pdf" onClick={exportarPDF}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>Exportar PDF</button>
            <button className="btn-export btn-export-xlsx" onClick={exportarXLSX}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>Exportar XLSX</button>
            {concluidas > 0 && <button className="btn-export btn-export-faturar" onClick={handleMarcarFaturadas}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>Marcar concluídas como Faturadas</button>}
          </div>
        </div>
      )}

      {showPreview && !osFiltradas.length && (
        <div className="coming-soon"><div className="coming-soon-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg></div><h3>Nenhuma OS encontrada</h3><p>Não há ordens concluídas/faturadas para os filtros selecionados.</p></div>
      )}
    </div>
  )
}
