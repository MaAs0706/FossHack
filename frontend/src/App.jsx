import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import { useEffect, useState } from 'react'
import 'leaflet/dist/leaflet.css'
import SchoolMarkers from './components/SchoolMarkers'
import HospitalMarkers from './components/HospitalMarkers'

function getColor(aqi) {
  if (aqi <= 50) return '#00e400'
  if (aqi <= 100) return '#ffff00'
  if (aqi <= 150) return '#ff7e00'
  if (aqi <= 200) return '#ff0000'
  if (aqi <= 300) return '#8f3f97'
  return '#7e0023'
}

function getRiskLabel(aqi) {
  if (aqi <= 50) return 'Good'
  if (aqi <= 100) return 'Moderate'
  if (aqi <= 150) return 'Unhealthy for Sensitive Groups'
  if (aqi <= 200) return 'Unhealthy'
  if (aqi <= 300) return 'Very Unhealthy'
  return 'Hazardous'
}

const LEGEND_ITEMS = [
  { color: '#00e400', label: 'Good (0-50)' },
  { color: '#ffff00', label: 'Moderate (51-100)' },
  { color: '#ff7e00', label: 'Unhealthy for Sensitive (101-150)' },
  { color: '#ff0000', label: 'Unhealthy (151-200)' },
  { color: '#8f3f97', label: 'Very Unhealthy (201-300)' },
  { color: '#7e0023', label: 'Hazardous (300+)' },
]

function App() {
  const [stations, setStations] = useState([])

  useEffect(() => {
    fetch('http://localhost:8000/aqi/kerala')
      .then(res => res.json())
      .then(data => setStations(data))
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      
      {/* Navbar */}
      <div style={{
        background: '#1a1a2e',
        color: 'white',
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        zIndex: 1000
      }}>
        <span style={{ fontSize: '20px' }}>🌫️</span>
        <span style={{ fontSize: '18px', fontWeight: 'bold' }}>AtmosTrack</span>
        <span style={{ fontSize: '13px', color: '#aaa', marginLeft: '8px' }}>
          Hyperlocal Air Quality Intelligence — Kerala
        </span>
      </div>

      {/* Map */}
      <div style={{ flex: 1, position: 'relative' }}>
        <MapContainer
          center={[10.5, 76.5]}
          zoom={8}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap contributors'
          />
          {stations.map((station, i) => (
            <CircleMarker
              key={i}
              center={[station.lat, station.lng]}
              radius={12}
              fillColor={getColor(station.aqi)}
              color="#fff"
              weight={1}
              fillOpacity={0.9}
            >
              <Popup>
                <strong>{station.name}</strong><br />
                AQI: {station.aqi}<br />
                <span style={{ color: getColor(station.aqi) === '#ffff00' ? '#999' : getColor(station.aqi) }}>
                  {getRiskLabel(station.aqi)}
                </span><br />
                <small style={{ color: '#888' }}>
                  Updated: {new Date(station.recorded_at).toLocaleTimeString()}
                </small>
              </Popup>
            </CircleMarker>
          ))}
          <SchoolMarkers />
          <HospitalMarkers />
        </MapContainer>

        {/* Legend */}
        <div style={{
          position: 'absolute',
          bottom: '30px',
          right: '10px',
          background: 'white',
          padding: '12px 16px',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          zIndex: 1000,
          fontSize: '12px'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>AQI Legend</div>
          {LEGEND_ITEMS.map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <div style={{
                width: '14px', height: '14px',
                borderRadius: '50%',
                background: item.color,
                border: '1px solid #ccc',
                flexShrink: 0
              }} />
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default App