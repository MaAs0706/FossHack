import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import { useEffect, useState } from 'react'
import 'leaflet/dist/leaflet.css'
import SchoolMarkers from './components/SchoolMarkers'
import HospitalMarkers from './components/HospitalMarkers'
import RankingsSidebar from './components/RankingsSidebar'
import MapController from './components/MapController'
import AQIChart from './components/AQIChart'

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
  { color: '#00e400', label: 'Good (0–50)' },
  { color: '#ffff00', label: 'Moderate (51–100)' },
  { color: '#ff7e00', label: 'Sensitive (101–150)' },
  { color: '#ff0000', label: 'Unhealthy (151–200)' },
  { color: '#8f3f97', label: 'Very Unhealthy (201–300)' },
  { color: '#7e0023', label: 'Hazardous (300+)' },
]

function AlertBanner({ stations }) {
  const dangerous = stations.filter(s => s.aqi > 150)
  if (dangerous.length === 0) return null

  return (
    <div style={{
      background: 'linear-gradient(90deg, #3d0000, #7e0023)',
      color: 'white',
      padding: '8px 24px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      fontSize: '12px',
      borderBottom: '1px solid #ff4757',
      flexWrap: 'wrap'
    }}>
      <span style={{
        background: '#ff4757',
        padding: '2px 8px',
        borderRadius: '4px',
        fontFamily: 'var(--font-mono)',
        fontSize: '11px',
        fontWeight: '600',
        letterSpacing: '0.05em'
      }}>⚠ ALERT</span>
      {dangerous.map((s, i) => (
        <span key={i} style={{
          fontFamily: 'var(--font-mono)',
          background: 'rgba(255,71,87,0.2)',
          border: '1px solid rgba(255,71,87,0.4)',
          padding: '2px 10px',
          borderRadius: '4px',
          fontSize: '11px'
        }}>
          {s.name.split(',')[0]} — AQI {s.aqi}
        </span>
      ))}
      <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px' }}>
        Schools and hospitals in affected areas require immediate attention
      </span>
    </div>
  )
}

function App() {
  const [stations, setStations] = useState([])
  const [showSchools, setShowSchools] = useState(false)
  const [showHospitals, setShowHospitals] = useState(false)
  const [flyTo, setFlyTo] = useState(null)
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [selectedStation, setSelectedStation] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)

  useEffect(() => {
    fetch('http://localhost:8000/aqi/kerala')
      .then(res => res.json())
      .then(data => {
        setStations(data)
        if (data.length > 0) {
          setLastUpdated(new Date(data[0].recorded_at))
        }
      })
  }, [])

  const handleLocationSelect = (location) => {
    setFlyTo(location)
    setSelectedLocation(location)
  }

  const avgAqi = stations.length > 0
    ? Math.round(stations.reduce((sum, s) => sum + s.aqi, 0) / stations.length)
    : null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg-primary)' }}>

      {/* Navbar */}
      <div style={{
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border)',
        padding: '0 24px',
        height: '56px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        flexShrink: 0,
        zIndex: 1000
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px', height: '32px',
            background: 'linear-gradient(135deg, #00d4ff, #00b894)',
            borderRadius: '8px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '16px'
          }}>🌫</div>
          <div>
            <div style={{ fontWeight: '700', fontSize: '15px', letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
              AtmosTrack
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.05em' }}>
              KERALA AIR QUALITY SYSTEM
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={{ width: '1px', height: '32px', background: 'var(--border)', margin: '0 8px' }} />

        {/* Stats */}
        {avgAqi && (
          <>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Avg AQI</span>
              <span style={{ fontSize: '18px', fontWeight: '700', fontFamily: 'var(--font-mono)', color: getColor(avgAqi) }}>{avgAqi}</span>
            </div>
            <div style={{ width: '1px', height: '32px', background: 'var(--border)' }} />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Stations</span>
              <span style={{ fontSize: '18px', fontWeight: '700', fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>{stations.length}</span>
            </div>
            <div style={{ width: '1px', height: '32px', background: 'var(--border)' }} />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Updated</span>
              <span style={{ fontSize: '12px', fontWeight: '500', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                {lastUpdated ? lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
              </span>
            </div>
          </>
        )}

        {/* Spacer */}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setShowSchools(!showSchools)}
            style={{
              background: showSchools ? 'rgba(0,184,148,0.15)' : 'transparent',
              color: showSchools ? '#00b894' : 'var(--text-muted)',
              border: `1px solid ${showSchools ? '#00b894' : 'var(--border)'}`,
              padding: '6px 14px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '12px',
              fontFamily: 'var(--font-main)',
              fontWeight: '500',
              transition: 'all 0.2s',
              display: 'flex', alignItems: 'center', gap: '6px'
            }}
          >
            🏫 Schools
            <span style={{
              background: showSchools ? '#00b894' : 'var(--border)',
              color: showSchools ? 'white' : 'var(--text-muted)',
              padding: '1px 6px',
              borderRadius: '3px',
              fontSize: '10px',
              fontFamily: 'var(--font-mono)'
            }}>{showSchools ? 'ON' : 'OFF'}</span>
          </button>
          <button
            onClick={() => setShowHospitals(!showHospitals)}
            style={{
              background: showHospitals ? 'rgba(0,212,255,0.15)' : 'transparent',
              color: showHospitals ? 'var(--accent-cyan)' : 'var(--text-muted)',
              border: `1px solid ${showHospitals ? 'var(--accent-cyan)' : 'var(--border)'}`,
              padding: '6px 14px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '12px',
              fontFamily: 'var(--font-main)',
              fontWeight: '500',
              transition: 'all 0.2s',
              display: 'flex', alignItems: 'center', gap: '6px'
            }}
          >
            🏥 Hospitals
            <span style={{
              background: showHospitals ? 'var(--accent-cyan)' : 'var(--border)',
              color: showHospitals ? '#000' : 'var(--text-muted)',
              padding: '1px 6px',
              borderRadius: '3px',
              fontSize: '10px',
              fontFamily: 'var(--font-mono)'
            }}>{showHospitals ? 'ON' : 'OFF'}</span>
          </button>
        </div>
      </div>

      {/* Alert Banner */}
      <AlertBanner stations={stations} />

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        <RankingsSidebar onLocationSelect={handleLocationSelect} />

        {/* Map */}
        <div style={{ flex: 1, position: 'relative' }}>
          <MapContainer
            center={[10.5, 76.5]}
            zoom={8}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
              attribution='&copy; Stadia Maps, &copy; OpenStreetMap contributors'
            />
            <MapController flyTo={flyTo} />

            {stations.map((station, i) => (
              <CircleMarker
                key={i}
                center={[station.lat, station.lng]}
                radius={14}
                fillColor={getColor(station.aqi)}
                color="rgba(0,0,0,0.4)"
                weight={2}
                fillOpacity={0.9}
                eventHandlers={{ click: () => setSelectedStation(station) }}
              >
                <Popup className="dark-popup">
                  <div style={{ fontFamily: 'var(--font-main)', minWidth: '180px' }}>
                    <div style={{ fontWeight: '600', fontSize: '13px', marginBottom: '6px' }}>{station.name}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '24px', fontWeight: '700', color: getColor(station.aqi) }}>
                        {station.aqi}
                      </span>
                      <span style={{ fontSize: '11px', color: '#666' }}>{getRiskLabel(station.aqi)}</span>
                    </div>
                    <div style={{ fontSize: '10px', color: '#999', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
                      {new Date(station.recorded_at).toLocaleTimeString()}
                    </div>
                    <div style={{ marginTop: '8px', fontSize: '11px', color: '#00d4ff', cursor: 'pointer' }}>
                      Click marker for 24hr trend →
                    </div>
                  </div>
                </Popup>
              </CircleMarker>
            ))}

            {selectedLocation && (
              <CircleMarker
                center={[selectedLocation.lat, selectedLocation.lng]}
                radius={22}
                fillColor="transparent"
                color="#00d4ff"
                weight={2}
                fillOpacity={0}
                dashArray="6 4"
              />
            )}

            {showSchools && <SchoolMarkers />}
            {showHospitals && <HospitalMarkers />}
          </MapContainer>

          <AQIChart
            station={selectedStation}
            onClose={() => setSelectedStation(null)}
          />

          {/* Legend */}
          <div style={{
            position: 'absolute',
            bottom: '24px',
            right: '12px',
            background: 'rgba(7,13,26,0.92)',
            backdropFilter: 'blur(8px)',
            border: '1px solid var(--border)',
            padding: '12px 16px',
            borderRadius: '8px',
            zIndex: 1000,
            fontSize: '11px',
            minWidth: '180px'
          }}>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              color: 'var(--text-muted)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: '10px',
              paddingBottom: '8px',
              borderBottom: '1px solid var(--border)'
            }}>AQI Scale</div>
            {LEGEND_ITEMS.map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <div style={{
                  width: '10px', height: '10px',
                  borderRadius: '50%',
                  background: item.color,
                  flexShrink: 0,
                  boxShadow: `0 0 6px ${item.color}60`
                }} />
                <span style={{ color: 'var(--text-secondary)', fontSize: '11px' }}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App