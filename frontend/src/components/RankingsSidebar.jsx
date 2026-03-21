import { useState, useEffect } from 'react'

function getRiskColor(score) {
  if (score <= 50) return '#00e400'
  if (score <= 100) return '#ffff00'
  if (score <= 150) return '#ff7e00'
  if (score <= 200) return '#ff0000'
  if (score <= 300) return '#8f3f97'
  return '#7e0023'
}

function getRiskLabel(score) {
  if (score <= 50) return 'Good'
  if (score <= 100) return 'Moderate'
  if (score <= 150) return 'Sensitive'
  if (score <= 200) return 'Unhealthy'
  if (score <= 300) return 'Very Unhealthy'
  return 'Hazardous'
}

function RankingsSidebar({ onLocationSelect }) {
  const [schools, setSchools] = useState([])
  const [hospitals, setHospitals] = useState([])
  const [activeTab, setActiveTab] = useState('schools')
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    Promise.all([
      fetch('http://localhost:8000/vulnerability/schools').then(r => r.json()),
      fetch('http://localhost:8000/vulnerability/hospitals').then(r => r.json())
    ]).then(([schoolData, hospitalData]) => {
      setSchools(Array.isArray(schoolData) ? schoolData.slice(0, 10) : [])
      setHospitals(Array.isArray(hospitalData) ? hospitalData.slice(0, 10) : [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const items = activeTab === 'schools' ? schools : hospitals
  const icon = activeTab === 'schools' ? '🏫' : '🏥'

  const handleSelect = (item, i) => {
    setSelected(i)
    onLocationSelect({
      lat: item.lat,
      lng: item.lng,
      name: item.name,
      score: item.vulnerability_score,
      risk_level: item.risk_level
    })
  }

  return (
    <div style={{
      width: '280px',
      background: 'var(--bg-secondary)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
    }}>

      {/* Header */}
      <div style={{
        padding: '16px',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '10px',
          color: 'var(--text-muted)',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          marginBottom: '12px'
        }}>
          ⚠ At-Risk Locations
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          background: 'var(--bg-primary)',
          borderRadius: '6px',
          padding: '3px',
          gap: '3px'
        }}>
          {['schools', 'hospitals'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                flex: 1,
                padding: '6px 8px',
                background: activeTab === tab ? 'var(--bg-card)' : 'transparent',
                color: activeTab === tab ? 'var(--text-primary)' : 'var(--text-muted)',
                border: activeTab === tab ? '1px solid var(--border-bright)' : '1px solid transparent',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '11px',
                fontFamily: 'var(--font-main)',
                fontWeight: '500',
                transition: 'all 0.15s'
              }}
            >
              {tab === 'schools' ? '🏫' : '🏥'} {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
        {loading ? (
          <div style={{ padding: '24px 0', textAlign: 'center' }}>
            {[1,2,3,4,5].map(i => (
              <div key={i} style={{
                height: '64px',
                background: 'var(--bg-card)',
                borderRadius: '6px',
                marginBottom: '6px',
                opacity: 0.5 + i * 0.1
              }} />
            ))}
          </div>
        ) : (
          items.map((item, i) => (
            <div
              key={i}
              onClick={() => handleSelect(item, i)}
              style={{
                background: selected === i ? 'var(--bg-card-hover)' : 'var(--bg-card)',
                borderRadius: '6px',
                padding: '10px 12px',
                marginBottom: '6px',
                borderLeft: `3px solid ${getRiskColor(item.vulnerability_score)}`,
                border: selected === i
                  ? `1px solid var(--accent-cyan)`
                  : '1px solid var(--border)',
                borderLeft: `3px solid ${getRiskColor(item.vulnerability_score)}`,
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => {
                if (selected !== i) e.currentTarget.style.background = 'var(--bg-card-hover)'
              }}
              onMouseLeave={e => {
                if (selected !== i) e.currentTarget.style.background = 'var(--bg-card)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '9px',
                    color: 'var(--text-muted)',
                    marginBottom: '3px',
                    letterSpacing: '0.05em'
                  }}>
                    #{String(i + 1).padStart(2, '0')} {icon}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    fontWeight: '500',
                    color: 'var(--text-primary)',
                    lineHeight: '1.3',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {item.name}
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '16px',
                    fontWeight: '700',
                    color: getRiskColor(item.vulnerability_score),
                    lineHeight: '1'
                  }}>
                    {item.vulnerability_score}
                  </div>
                  <div style={{
                    fontSize: '9px',
                    color: 'var(--text-muted)',
                    marginTop: '2px'
                  }}>
                    {getRiskLabel(item.vulnerability_score)}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div style={{
        padding: '12px 16px',
        borderTop: '1px solid var(--border)',
        fontFamily: 'var(--font-mono)',
        fontSize: '10px',
        color: 'var(--text-muted)',
        display: 'flex',
        justifyContent: 'space-between'
      }}>
        <span>Click to locate on map</span>
        <span style={{ color: 'var(--accent-cyan)' }}>↗</span>
      </div>
    </div>
  )
}

export default RankingsSidebar