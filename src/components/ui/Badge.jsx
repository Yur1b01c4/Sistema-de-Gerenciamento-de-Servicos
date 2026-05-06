export function Badge({ status }) {
  const map = {
    aberta: ['badge-warning', 'Aberta'],
    concluida: ['badge-success', 'Concluída'],
    faturada: ['badge-accent', 'Faturada'],
  }
  const [cls, label] = map[status] || ['badge-primary', status]
  return <span className={`badge ${cls}`}>{label}</span>
}

export function BadgeType({ children }) {
  return <span className="badge badge-primary" style={{ fontSize: '0.65rem' }}>{children}</span>
}
