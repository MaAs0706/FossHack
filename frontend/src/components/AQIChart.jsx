import { useEffect, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'

function AQIChart({ station, onClose }) {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!station) return
    
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
          time: new Date(r.recorded_at).toLocaleTimeString([], { 
            hour: '2-digit', minute: '2-digit' 
          })
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
      bottom: '20px',
      left: '20px',
      background: 'white',
      borderRadius: '12px',
      padding: '16px',
      width: '380px',
      boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
      zIndex: 1000
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div>
          <div style={{ fontWeight: 'bold', fontSize: '13px' }}>{station.name}</div>
          <div style={{ fontSize: '11px', color: '#888' }}>Past 24 hours — AQI trend</div>
        </div>
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: '#888' }}
        >
          ✕
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', color: '#888', padding: '20px' }}>Loading...</div>
      ) : history.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#888', padding: '20px' }}>No historical data yet</div>
      ) : (
        <ResponsiveContainer width="100%" height={150}>
          <LineChart data={history}>
            <XAxis dataKey="time" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
            <YAxis domain={['auto', 'auto']} tick={{ fontSize: 10 }} width={30} />
            <Tooltip
              formatter={(value) => [`AQI: ${value}`, '']}
              labelStyle={{ fontSize: 11 }}
            />
            <ReferenceLine y={100} stroke="#ffff00" strokeDasharray="3 3" />
            <ReferenceLine y={150} stroke="#ff7e00" strokeDasharray="3 3" />
            <ReferenceLine y={200} stroke="#ff0000" strokeDasharray="3 3" />
            <Line
              type="monotone"
              dataKey="aqi"
              stroke="#2196F3"
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}

export default AQIChart