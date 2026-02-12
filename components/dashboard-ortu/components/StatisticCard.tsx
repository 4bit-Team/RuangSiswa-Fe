'use client'

interface Props {
  label: string
  value: number
  icon: string
  color: string
}

const StatisticCard = ({ label, value, icon, color }: Props) => {
  return (
    <div className={`rounded-lg p-6 shadow-sm ${color}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-75">{label}</p>
          <p className="text-3xl font-bold mt-1">{value}</p>
        </div>
        <span className="text-4xl opacity-50">{icon}</span>
      </div>
    </div>
  )
}

export default StatisticCard
