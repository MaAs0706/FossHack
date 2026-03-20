import { CircleMarker, Popup } from 'react-leaflet'
import { useEffect, useState } from 'react'

function getRiskColor(score) {
  if (score <= 50) return '#00e400'
  if (score <= 100) return '#ffff00'
  if (score <= 150) return '#ff7e00'
  if (score <= 200) return '#ff0000'
  if (score <= 300) return '#8f3f97'
  return '#7e0023'
}

function SchoolMarkers() {
  const [schools, setSchools] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('http://localhost:8000/vulnerability/schools')
      .then(res => res.json())
      .then(data => {
        setSchools(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return null

  return schools.map((school, i) => (
    <CircleMarker
      key={i}
      center={[school.lat, school.lng]}
      radius={6}
      fillColor={getRiskColor(school.vulnerability_score)}
      color="#333"
      weight={1}
      fillOpacity={0.7}
    >
      <Popup>
        <strong>🏫 {school.name}</strong><br />
        Vulnerability Score: {school.vulnerability_score}<br />
        Risk Level: {school.risk_level}
      </Popup>
    </CircleMarker>
  ))
}

export default SchoolMarkers