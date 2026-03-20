import { useState, useEffect } from 'react'

function getRiskColor(score) {
  if (score <= 50) return '#00e400'
  if (score <= 100) return '#ffff00'
  if (score <= 150) return '#ff7e00'
  if (score <= 200) return '#ff0000'
  if (score <= 300) return '#8f3f97'
  return '#7e0023'
}

function RankingsSidebar({ onLocationSelect }) {
  const [schools, setSchools] = useState([])
  const [hospitals, setHospitals] = useState([])
  const [activeTab, setActiveTab] = useState('schools')
  const [loading, setLoading] = useState(true)

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

  return (
    <div style={{
      width: '300px',
      background: '#1a1a2e',
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      overflowY: 'auto'
    }}>

      <div style={{ padding: '16px', borderBottom: '1px solid #333' }}>
        <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '12px' }}>
          ⚠️ At-Risk Locations
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setActiveTab('schools')}
            style={{
              flex: 1,
              padding: '6px',
              background: activeTab === 'schools' ? '#4CAF50' : '#333',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            🏫 Schools
          </button>
          <button
            onClick={() => setActiveTab('hospitals')}
            style={{
              flex: 1,
              padding: '6px',
              background: activeTab === 'hospitals' ? '#2196F3' : '#333',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            🏥 Hospitals
          </button>
        </div>
      </div>

      <div style={{ padding: '12px', flex: 1 }}>
        {loading ? (
          <div style={{ color: '#aaa', fontSize: '13px', textAlign: 'center', marginTop: '20px' }}>
            Loading...
          </div>
        ) : (
          items.map((item, i) => (
            <div
              key={i}
              onClick={() => onLocationSelect({ 
  lat: item.lat, 
  lng: item.lng,
  name: item.name,
  score: item.vulnerability_score,
  risk_level: item.risk_level
})}
              onMouseEnter={e => e.currentTarget.style.background = '#333355'}
              onMouseLeave={e => e.currentTarget.style.background = '#252540'}
              style={{
                background: '#252540',
                borderRadius: '8px',
                padding: '10px 12px',
                marginBottom: '8px',
                borderLeft: `4px solid ${getRiskColor(item.vulnerability_score)}`,
                cursor: 'pointer',
                transition: 'background 0.2s'
              }}
            >
              <div style={{ fontSize: '12px', color: '#aaa', marginBottom: '4px' }}>
                #{i + 1} {icon}
              </div>
              <div style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '4px', lineHeight: '1.3' }}>
                {item.name}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: '#aaa' }}>
                  Score: {item.vulnerability_score}
                </span>
                <span style={{
                  fontSize: '11px',
                  padding: '2px 8px',
                  borderRadius: '10px',
                  background: getRiskColor(item.vulnerability_score),
                  color: item.vulnerability_score <= 100 ? '#333' : 'white'
                }}>
                  {item.risk_level}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default RankingsSidebar