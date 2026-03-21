import { useEffect, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'

function AQIChart({ station, onClose }) {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!station) return
    setLoading(true)

    fetch(`http://localhost:8000/aqi/history/${encodeURIComponent(station.name)}`)
      .then(res => res.json())
      .then(data => {
        const byHour = {}
        data.forEach(r => {
          const hour = new Date(r.recorded_at).toISOString().slice(0, 13)
          byHour[hour] = r
        })
        const cleaned = Object.values(byHour).map(r => ({
          aqi: r.aqi,
          time: new Date(r.recorded_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }))
        setHistory(cleaned)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [station])

  if (!station) return null

  return (
    <div style={{
      position: 'absolute',
      bottom: '24px',
      left: '16px',
      background: 'rgba(7,13,26,0.95)',
      backdropFilter: 'blur(12px)',
      border: '1px solid var(--border-bright)',
      borderRadius: '10px',
      padding: '16px',
      width: '360px',
      zIndex: 1000,
      boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
        <div>
          <div style={{ fontWeight: '600', fontSize: '13px', color: 'var(--text-primary)', marginBottom: '2px' }}>
            {station.name.split(',')[0]}
          </div>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            color: 'var(--text-muted)',
            letterSpacing: '0.05em',
            textTransform: 'uppercase'
          }}>
            24-hour AQI trend
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px',
            color: 'var(--text-muted)',
            width: '24px',
            height: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >✕</button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px', fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
          Loading data...
        </div>
      ) : history.length === 0 ? (
        <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px', fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
          No historical data yet
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={140}>
          <LineChart data={history} margin={{ top: 4, right: 4, bottom: 0, left: -10 }}>
            <XAxis
              dataKey="time"
              tick={{ fontSize: 9, fill: '#4a6080', fontFamily: 'JetBrains Mono' }}
              interval="preserveStartEnd"
              axisLine={{ stroke: '#1a2d4a' }}
              tickLine={false}
            />
            <YAxis
              domain={['auto', 'auto']}
              tick={{ fontSize: 9, fill: '#4a6080', fontFamily: 'JetBrains Mono' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                background: '#0d1626',
                border: '1px solid #1a2d4a',
                borderRadius: '6px',
                fontSize: '11px',
                fontFamily: 'JetBrains Mono',
                color: '#e8f4fd'
              }}
              formatter={(value) => [`AQI: ${value}`, '']}
              labelStyle={{ color: '#7a9cc4' }}
            />
            <ReferenceLine y={100} stroke="#ffff0040" strokeDasharray="3 3" />
            <ReferenceLine y={150} stroke="#ff7e0040" strokeDasharray="3 3" />
            <ReferenceLine y={200} stroke="#ff000040" strokeDasharray="3 3" />
            <Line
              type="monotone"
              dataKey="aqi"
              stroke="#00d4ff"
              strokeWidth={2}
              dot={{ r: 3, fill: '#00d4ff', strokeWidth: 0 }}
              activeDot={{ r: 5, fill: '#00d4ff', stroke: '#fff', strokeWidth: 1 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}

      <div style={{
        display: 'flex',
        gap: '12px',
        marginTop: '10px',
        paddingTop: '10px',
        borderTop: '1px solid var(--border)',
        fontFamily: 'var(--font-mono)',
        fontSize: '10px',
        color: 'var(--text-muted)'
      }}>
        <span>Current: <span style={{ color: '#00d4ff', fontWeight: '600' }}>{station.aqi}</span></span>
        {history.length > 0 && (
          <>
            <span>Min: <span style={{ color: '#00e400' }}>{Math.min(...history.map(h => h.aqi))}</span></span>
            <span>Max: <span style={{ color: '#ff4757' }}>{Math.max(...history.map(h => h.aqi))}</span></span>
          </>
        )}
      </div>
    </div>
  )
}

export default AQIChart