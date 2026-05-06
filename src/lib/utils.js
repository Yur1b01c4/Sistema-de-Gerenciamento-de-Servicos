export function gerarId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export function formatarCNPJ(v) {
  v = v.replace(/\D/g, '').slice(0, 14);
  if (v.length <= 2) return v;
  if (v.length <= 5) return v.replace(/^(\d{2})(\d+)/, '$1.$2');
  if (v.length <= 8) return v.replace(/^(\d{2})(\d{3})(\d+)/, '$1.$2.$3');
  if (v.length <= 12) return v.replace(/^(\d{2})(\d{3})(\d{3})(\d+)/, '$1.$2.$3/$4');
  return v.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d+)/, '$1.$2.$3/$4-$5');
}

export function parseMoeda(str) {
  if (!str) return 0;
  return parseFloat(str.replace(/\./g, '').replace(',', '.')) || 0;
}

export function formatarMoeda(num) {
  return num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function getIniciais(nome) {
  return nome.trim().split(/\s+/).slice(0, 2).map(w => w[0].toUpperCase()).join('');
}

export function formatDataCurta(iso) {
  const d = new Date(iso);
  if (isNaN(d)) return iso;
  return d.toLocaleDateString('pt-BR');
}

export function formatDataHora(iso) {
  const d = new Date(iso);
  if (isNaN(d)) return iso;
  return d.toLocaleDateString('pt-BR') + ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

export function getDataAtualLocal() {
  const now = new Date();
  const pad = n => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

export function getSaudacao() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

export function tipoAbrev(tipo) {
  const map = {
    'Instalação': 'Instalação',
    'Mudança de Endereço': 'Mudança End.',
    'Troca de Equipamento': 'Troca Equi.',
    'Mudança de Cômodo': 'Mudança Côm.',
    'Reparo de Rede': 'Reparo',
    'Manutenção Preventiva': 'Manutenção',
    'Outros': 'Outros'
  };
  return map[tipo] || tipo;
}

export const TIPOS_SERVICO = [
  'Instalação',
  'Mudança de Endereço',
  'Troca de Equipamento',
  'Mudança de Cômodo',
  'Reparo de Rede',
  'Manutenção Preventiva',
  'Outros'
];
