import { useMap } from 'react-leaflet'
import { useEffect } from 'react'

function MapController({ flyTo }) {
  const map = useMap()

  useEffect(() => {
    if (flyTo) {
      map.flyTo([flyTo.lat, flyTo.lng], 13, {
        duration: 1.5
      })
    }
  }, [flyTo, map])

  return null
}

export default MapController