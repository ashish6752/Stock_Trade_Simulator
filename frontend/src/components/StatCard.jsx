export default function StatCard({ title, value, sub, icon, color = 'green', trend }) {
  const colors = {
    green:  { bg: 'from-brand-500/20 to-brand-700/10', icon: 'bg-brand-500/20 text-brand-400', border: 'border-brand-500/20' },
    red:    { bg: 'from-red-500/20 to-red-700/10',     icon: 'bg-red-500/20 text-red-400',     border: 'border-red-500/20' },
    blue:   { bg: 'from-blue-500/20 to-blue-700/10',   icon: 'bg-blue-500/20 text-blue-400',   border: 'border-blue-500/20' },
    purple: { bg: 'from-purple-500/20 to-purple-700/10',icon: 'bg-purple-500/20 text-purple-400',border: 'border-purple-500/20'},
    yellow: { bg: 'from-yellow-500/20 to-yellow-700/10',icon: 'bg-yellow-500/20 text-yellow-400',border: 'border-yellow-500/20'},
  }
  const c = colors[color] || colors.green

  return (
    <div className={`relative overflow-hidden rounded-2xl border ${c.border} bg-gradient-to-br ${c.bg} p-5 shadow-xl`}>
      <div className="flex items-start justify-between mb-3">
        <p className="text-dark-500 text-sm font-medium">{title}</p>
        {icon && <div className={`w-9 h-9 rounded-xl ${c.icon} flex items-center justify-center text-lg`}>{icon}</div>}
      </div>
      <p className="text-2xl font-bold text-white tracking-tight">{value}</p>
      {sub && (
        <p className={`text-sm mt-1 font-medium ${trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-red-400' : 'text-dark-500'}`}>
          {trend === 'up' ? '▲ ' : trend === 'down' ? '▼ ' : ''}{sub}
        </p>
      )}
    </div>
  )
}
