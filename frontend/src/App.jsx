import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import { useEffect, useState } from 'react'
import 'leaflet/dist/leaflet.css'

function getColor(aqi) {
  if (aqi <= 50) return '#00e400'
  if (aqi <= 100) return '#ffff00'
  if (aqi <= 150) return '#ff7e00'
  if (aqi <= 200) return '#ff0000'
  if (aqi <= 300) return '#8f3f97'
  return '#7e0023'
}

function App() {
  const [stations, setStations] = useState([])

  useEffect(() => {
    fetch('http://localhost:8000/aqi/kerala')
      .then(res => res.json())
      .then(data => setStations(data))
  }, [])

  return (
    <MapContainer
      center={[10.5, 76.2]}
      zoom={7}
      style={{ height: '100vh', width: '100%' }}
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
            AQI: {station.aqi}
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  )
}

export default App