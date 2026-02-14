import { useEffect, useMemo, useState } from 'react'
import './CapacityCalendar.css'

export default function CapacityCalendar({ resources, allocations }) {
  const [selectedResourceId, setSelectedResourceId] = useState(resources[0]?._id || '')

  useEffect(() => {
    if (!selectedResourceId && resources[0]?._id) {
      setSelectedResourceId(resources[0]._id)
    }
  }, [resources, selectedResourceId])

  const { days, monthLabel } = useMemo(() => {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const totalDays = lastDay.getDate()

    const dayList = Array.from({ length: totalDays }, (_, i) => new Date(year, month, i + 1))
    const label = firstDay.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

    return { days: dayList, monthLabel: label }
  }, [])

  function getAllocationForDay(date) {
    if (!selectedResourceId) return 0
    const dayStart = new Date(date)
    const dayEnd = new Date(date)
    dayStart.setHours(0, 0, 0, 0)
    dayEnd.setHours(23, 59, 59, 999)

    const total = allocations
      .filter((alloc) => String(alloc.resource?._id) === String(selectedResourceId))
      .filter((alloc) => {
        const start = new Date(alloc.startDate)
        const end = new Date(alloc.endDate)
        return start <= dayEnd && end >= dayStart
      })
      .reduce((sum, alloc) => sum + (alloc.allocationPercentage || 0), 0)

    return total
  }

  function getCellClass(value) {
    if (value >= 100) return 'cell over'
    if (value >= 80) return 'cell warn'
    if (value > 0) return 'cell ok'
    return 'cell'
  }

  if (resources.length === 0) {
    return (
      <div className="capacity-calendar">
        <h2>Capacity Calendar</h2>
        <p>No resources found yet.</p>
      </div>
    )
  }

  return (
    <div className="capacity-calendar">
      <div className="calendar-header">
        <div>
          <h2>{monthLabel}</h2>
          <p>Capacity by day for selected resource</p>
        </div>
        <select
          value={selectedResourceId}
          onChange={(e) => setSelectedResourceId(e.target.value)}
          className="form-select"
        >
          {resources.map((res) => (
            <option key={res._id} value={res._id}>
              {res.name} ({res.role})
            </option>
          ))}
        </select>
      </div>

      <div className="calendar-grid">
        {days.map((day) => {
          const allocation = getAllocationForDay(day)
          return (
            <div key={day.toISOString()} className={getCellClass(allocation)}>
              <div className="day">{day.getDate()}</div>
              <div className="value">{allocation}%</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
