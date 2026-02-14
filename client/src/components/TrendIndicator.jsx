import './TrendIndicator.css'

export default function TrendIndicator({ trend }) {
  function getIcon() {
    if (trend.direction === 'improving') return '↑'
    if (trend.direction === 'declining') return '↓'
    if (trend.direction === 'stable') return '→'
    return '●'
  }

  function getColor() {
    if (trend.direction === 'improving') return 'var(--success)'
    if (trend.direction === 'declining') return 'var(--danger)'
    return 'var(--gray-600)'
  }

  function getLabel() {
    if (trend.direction === 'improving') return 'Improving'
    if (trend.direction === 'declining') return 'Declining'
    if (trend.direction === 'stable') return 'Stable'
    return 'New'
  }

  return (
    <div className="trend-indicator" style={{ color: getColor() }}>
      <span className="trend-icon">{getIcon()}</span>
      <span className="trend-label">{getLabel()}</span>
      {trend.percentage > 0 && <span className="trend-percentage">{trend.percentage}%</span>}
    </div>
  )
}
