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

function HospitalMarkers() {
  const [hospitals, setHospitals] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('http://localhost:8000/vulnerability/hospitals')
      .then(res => res.json())
      .then(data => {
        setHospitals(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return null

  return hospitals.map((hospital, i) => (
    <CircleMarker
      key={i}
      center={[hospital.lat, hospital.lng]}
      radius={6}
      fillColor={getRiskColor(hospital.vulnerability_score)}
      color="#333"
      weight={1}
      fillOpacity={0.7}
    >
      <Popup>
        <strong>🏥 {hospital.name}</strong><br />
        Vulnerability Score: {hospital.vulnerability_score}<br />
        Risk Level: {hospital.risk_level}
      </Popup>
    </CircleMarker>
  ))
}

export default HospitalMarkers