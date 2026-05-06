import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'

const DataContext = createContext()

export function DataProvider({ children }) {
  const { user } = useAuth()
  const [empresas, setEmpresas] = useState([])
  const [ordens, setOrdens] = useState([])
  const [loadingData, setLoadingData] = useState(false)

  // ── LOAD DATA FROM SUPABASE ──
  useEffect(() => {
    if (!user) { setEmpresas([]); setOrdens([]); return }
    loadData()
  }, [user])

  const loadData = async () => {
    setLoadingData(true)
    try {
      // Load empresas with contatos
      const { data: empData, error: empErr } = await supabase
        .from('empresas')
        .select('*, empresa_contatos(*)')
        .order('criado_em', { ascending: false })

      if (empErr) console.error('Erro empresas:', empErr)

      const empresasFormatted = (empData || []).map(e => ({
        id: e.id, nome: e.nome, cnpj: e.cnpj || '', endereco: e.endereco || '',
        cidade: e.cidade || '', estado: e.estado || '', observacoes: e.observacoes || '',
        contatos: (e.empresa_contatos || []).map(c => ({ id: c.id, nome: c.nome_contato, email: c.email })),
        criadoEm: e.criado_em
      }))
      setEmpresas(empresasFormatted)

      // Load ordens (without profiles join - no direct FK)
      const { data: osData, error: osErr } = await supabase
        .from('ordens_servico')
        .select('*, empresas(nome)')
        .order('criado_em', { ascending: false })

      if (osErr) console.error('Erro ordens:', osErr)

      // Load profiles separately to map tecnico names
      let profilesMap = {}
      try {
        const { data: profilesData } = await supabase.from('profiles').select('id, nome')
        if (profilesData) {
          profilesData.forEach(p => { profilesMap[p.id] = p.nome })
        }
      } catch (e) { console.warn('Perfis não carregados:', e) }

      const ordensFormatted = (osData || []).map(o => ({
        id: o.id, numero: o.numero, empresaId: o.empresa_id,
        empresaNome: o.empresas?.nome || '', tecnico: profilesMap[o.usuario_id] || 'Técnico',
        cliente: o.cliente, endereco: o.endereco, numeroEnd: o.numero_endereco,
        cidade: o.cidade, data: o.data_hora, tipo: o.tipo_servico,
        valor: parseFloat(o.valor) || 0, qt: o.quantidade || 1, status: o.status,
        obs: o.observacoes || '', obsExecucao: o.obs_execucao || '',
        dataExecucao: o.data_execucao, foto: o.foto_url || null,
        gps: o.lat ? { lat: o.lat, lng: o.lng, precisao: o.gps_precisao, ts: o.gps_timestamp } : null,
        criadoEm: o.criado_em, concluidoEm: o.concluido_em
      }))
      setOrdens(ordensFormatted)
    } catch (err) {
      console.error('Erro ao carregar dados:', err)
    } finally {
      setLoadingData(false)
    }
  }

  // ── EMPRESAS ──
  const criarEmpresa = useCallback(async (data) => {
    const { data: emp, error } = await supabase.from('empresas').insert({
      nome: data.nome, cnpj: data.cnpj, endereco: data.endereco,
      cidade: data.cidade, estado: data.estado, observacoes: data.observacoes
    }).select().single()

    if (error) throw new Error(error.message)

    // Insert contatos
    if (data.contatos?.length) {
      const contatos = data.contatos.filter(c => c.nome || c.email).map(c => ({
        empresa_id: emp.id, nome_contato: c.nome, email: c.email
      }))
      if (contatos.length) await supabase.from('empresa_contatos').insert(contatos)
    }

    await loadData()
    return emp
  }, [])

  const atualizarEmpresa = useCallback(async (id, data) => {
    await supabase.from('empresas').update({
      nome: data.nome, cnpj: data.cnpj, endereco: data.endereco,
      cidade: data.cidade, estado: data.estado, observacoes: data.observacoes
    }).eq('id', id)

    // Replace contatos
    await supabase.from('empresa_contatos').delete().eq('empresa_id', id)
    if (data.contatos?.length) {
      const contatos = data.contatos.filter(c => c.nome || c.email).map(c => ({
        empresa_id: id, nome_contato: c.nome, email: c.email
      }))
      if (contatos.length) await supabase.from('empresa_contatos').insert(contatos)
    }

    await loadData()
  }, [])

  const excluirEmpresa = useCallback(async (id) => {
    // Check for linked OS
    const { data: linkedOS } = await supabase
      .from('ordens_servico').select('id').eq('empresa_id', id).limit(1)
    if (linkedOS?.length) throw new Error('Não é possível excluir: existem OSs vinculadas a esta empresa.')

    const { error } = await supabase.from('empresas').delete().eq('id', id)
    if (error) throw new Error(error.message)
    await loadData()
  }, [])

  // ── ORDENS DE SERVIÇO ──
  const criarOS = useCallback(async (data) => {
    const { error } = await supabase.from('ordens_servico').insert({
      empresa_id: data.empresaId, usuario_id: user.id,
      cliente: data.cliente, endereco: data.endereco,
      numero_endereco: data.numeroEnd, cidade: data.cidade,
      data_hora: data.data, tipo_servico: data.tipo,
      valor: data.valor, quantidade: data.qt,
      observacoes: data.obs || ''
    })
    if (error) throw new Error(error.message)
    await loadData()
  }, [user])

  const atualizarOS = useCallback(async (id, data) => {
    await supabase.from('ordens_servico').update({
      empresa_id: data.empresaId, cliente: data.cliente,
      endereco: data.endereco, numero_endereco: data.numeroEnd,
      cidade: data.cidade, data_hora: data.data,
      tipo_servico: data.tipo, valor: data.valor,
      quantidade: data.qt, observacoes: data.obs || ''
    }).eq('id', id)
    await loadData()
  }, [])

  const excluirOS = useCallback(async (id) => {
    const os = ordens.find(o => o.id === id)
    if (os && os.status !== 'aberta') throw new Error('Só é possível excluir OSs com status "Aberta".')
    await supabase.from('ordens_servico').delete().eq('id', id)
    await loadData()
  }, [ordens])

  const concluirOS = useCallback(async (id, data) => {
    let fotoUrl = null

    // Upload photo to Supabase Storage if present
    if (data.foto) {
      try {
        const base64 = data.foto.split(',')[1]
        const byteArray = Uint8Array.from(atob(base64), c => c.charCodeAt(0))
        const blob = new Blob([byteArray], { type: 'image/jpeg' })
        const fileName = `${id}/${Date.now()}.jpg`

        const { error: upErr } = await supabase.storage
          .from('os-fotos')
          .upload(fileName, blob, { contentType: 'image/jpeg', upsert: true })

        if (!upErr) {
          const { data: urlData } = supabase.storage.from('os-fotos').getPublicUrl(fileName)
          fotoUrl = urlData.publicUrl
        }
      } catch (err) {
        console.error('Erro no upload da foto:', err)
      }
    }

    const updateData = {
      status: 'concluida', data_execucao: data.dataExecucao,
      obs_execucao: data.obsExecucao || '', concluido_em: new Date().toISOString()
    }
    if (fotoUrl) updateData.foto_url = fotoUrl
    if (data.gps) {
      updateData.lat = data.gps.lat; updateData.lng = data.gps.lng
      updateData.gps_precisao = data.gps.precisao; updateData.gps_timestamp = data.gps.ts
    }

    await supabase.from('ordens_servico').update(updateData).eq('id', id)
    await loadData()
  }, [])

  const marcarFaturadas = useCallback(async (ids) => {
    await supabase.from('ordens_servico')
      .update({ status: 'faturada' })
      .in('id', ids)
      .eq('status', 'concluida')
    await loadData()
  }, [])

  return (
    <DataContext.Provider value={{
      empresas, ordens, loadingData,
      criarEmpresa, atualizarEmpresa, excluirEmpresa,
      criarOS, atualizarOS, excluirOS, concluirOS, marcarFaturadas
    }}>
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  return useContext(DataContext)
}
