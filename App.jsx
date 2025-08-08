import React, { useEffect, useRef, useState } from 'react'
import maplibregl from 'maplibre-gl'
import { Shield, MapPin, Target, Radio, Layers } from 'lucide-react'

function jitterWithinMiles(lat, lon, radiusMiles) {
  if (lat == null || lon == null) return { lat, lon }
  const milesPerDegLat = 69.0
  const milesPerDegLon = Math.cos((lat * Math.PI) / 180) * 69.172
  const r = Math.sqrt(Math.random()) * radiusMiles
  const theta = Math.random() * 2 * Math.PI
  const dLat = (r * Math.sin(theta)) / milesPerDegLat
  const dLon = (r * Math.cos(theta)) / milesPerDegLon
  return { lat: lat + dLat, lon: lon + dLon }
}

export default function App() {
  const mapRef = useRef(null)
  const map = useRef(null)

  const [coords, setCoords] = useState(null)
  const [error, setError] = useState(null)
  const [privacy, setPrivacy] = useState('blur')
  const [shareMode, setShareMode] = useState('radius3')
  const [sharePreview, setSharePreview] = useState(null)
  const [opacity, setOpacity] = useState({ hillshade: 0.6, topo: 0.0, worldcover: 0.0 })
  const [toggles, setToggles] = useState({ hillshade: true, topo: false, worldcover: false })

  useEffect(() => {
    if (!navigator.geolocation) { setError('Geolocation not supported'); return }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        let lat = pos.coords.latitude
        let lon = pos.coords.longitude
        if (privacy === 'blur') { lat = Math.round(lat*1000)/1000; lon = Math.round(lon*1000)/1000 }
        setCoords({ lat, lon })
      },
      () => setError('GPS access denied or unavailable')
    )
  }, [privacy])

  useEffect(() => {
    if (!coords || map.current) return
    map.current = new maplibregl.Map({
      container: mapRef.current,
      center: [coords.lon, coords.lat],
      zoom: 11,
      style: {
        version: 8,
        sources: {
          osm: {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '© OpenStreetMap contributors',
          },
          usgs_hillshade: {
            type: 'raster',
            tiles: ['https://basemap.nationalmap.gov/arcgis/rest/services/USGSShadedReliefOnly/MapServer/tile/{z}/{y}/{x}'],
            tileSize: 256,
            attribution: 'USGS Shaded Relief',
          },
          usgs_topo: {
            type: 'raster',
            tiles: ['https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/tile/{z}/{y}/{x}'],
            tileSize: 256,
            attribution: 'USGS Topo',
          },
          worldcover: {
            type: 'raster',
            tiles: ['https://tiles.maps.eox.at/wms/?service=WMS&request=GetMap&layers=worldcover&styles=&format=image/png&transparent=true&version=1.1.1&height=256&width=256&srs=EPSG:3857&bbox={bbox-epsg-3857}'],
            tileSize: 256,
            attribution: 'ESA WorldCover (demo)',
          },
        },
        layers: [
          { id: 'osm', type: 'raster', source: 'osm' },
          { id: 'usgs_hillshade', type: 'raster', source: 'usgs_hillshade', paint: {'raster-opacity': 0.6} },
          { id: 'usgs_topo', type: 'raster', source: 'usgs_topo', paint: {'raster-opacity': 0.0} },
          { id: 'worldcover', type: 'raster', source: 'worldcover', paint: {'raster-opacity': 0.0} },
        ],
      },
    })
    map.current.addControl(new maplibregl.NavigationControl(), 'top-left')
    new maplibregl.Marker({ color: '#111827' }).setLngLat([coords.lon, coords.lat]).addTo(map.current)
  }, [coords])

  useEffect(() => { if (coords && map.current) map.current.setCenter([coords.lon, coords.lat]) }, [coords])

  useEffect(() => {
    if (!coords) return
    setSharePreview(shareMode === 'radius3' ? jitterWithinMiles(coords.lat, coords.lon, 3) : { ...coords })
  }, [coords, shareMode])

  useEffect(() => {
    if (!map.current) return
    for (const k of ['usgs_hillshade','usgs_topo','worldcover']) {
      const on = toggles[k.replace('usgs_','')]
      map.current.setLayoutProperty(k, 'visibility', on ? 'visible' : 'none')
    }
    map.current.setPaintProperty('usgs_hillshade','raster-opacity', opacity.hillshade)
    map.current.setPaintProperty('usgs_topo','raster-opacity', opacity.topo)
    map.current.setPaintProperty('worldcover','raster-opacity', opacity.worldcover)
  }, [toggles, opacity])

  return (
    <div className="wrap">
      <div className="title"><Shield size={18}/> Waypoint — Map prototype v0.4</div>

      <div className="card bar" style={{ marginBottom: 10 }}>
        <label className="pill"><MapPin size={16}/> Privacy:&nbsp;
          <select value={privacy} onChange={(e)=>setPrivacy(e.target.value)}>
            <option value="blur">Blur to ~1 km (recommended)</option>
            <option value="exact">Exact coordinates</option>
          </select>
        </label>

        <label className="pill"><Radio size={16}/> Sharing:&nbsp;
          <select value={shareMode} onChange={(e)=>setShareMode(e.target.value)}>
            <option value="radius3">General area (~3 mi)</option>
            <option value="point">Point (uses privacy blur)</option>
          </select>
        </label>

        <span className="pill"><Target size={16}/> {coords ? `${coords.lat.toFixed(3)}, ${coords.lon.toFixed(3)}` : (error || 'Locating…')}</span>
        <span className="pill">Share preview: {sharePreview ? `${sharePreview.lat.toFixed(3)}, ${sharePreview.lon.toFixed(3)}` : '—'}</span>
      </div>

      <div className="card bar" style={{ marginBottom: 10 }}>
        <span className="pill"><Layers size={16}/> Layers</span>

        <label className="pill"><input type="checkbox" checked={toggles.hillshade} onChange={e=>setToggles(t=>({...t, hillshade:e.target.checked}))}/> USGS Shaded Relief</label>
        <label className="pill"><input type="checkbox" checked={toggles.topo} onChange={e=>setToggles(t=>({...t, topo:e.target.checked}))}/> USGS Topo</label>
        <label className="pill"><input type="checkbox" checked={toggles.worldcover} onChange={e=>setToggles(t=>({...t, worldcover:e.target.checked}))}/> ESA WorldCover</label>

        <label className="pill">Relief opacity <input className="slider" type="range" min="0" max="1" step="0.05" value={opacity.hillshade} onChange={e=>setOpacity(o=>({...o, hillshade:parseFloat(e.target.value)}))}/></label>
        <label className="pill">Topo opacity <input className="slider" type="range" min="0" max="1" step="0.05" value={opacity.topo} onChange={e=>setOpacity(o=>({...o, topo:parseFloat(e.target.value)}))}/></label>
        <label className="pill">WorldCover opacity <input className="slider" type="range" min="0" max="1" step="0.05" value={opacity.worldcover} onChange={e=>setOpacity(o=>({...o, worldcover:parseFloat(e.target.value)}))}/></label>
      </div>

      <div className="card">
        <div ref={mapRef} className="map" />
        <div className="footer">
          Base: OSM. Overlays: USGS Shaded Relief & Topo (National Map), ESA WorldCover (demo tiles). Next build will add BirdCast & eBird overlays; those require API/tiles access and will be wired behind a toggle.
        </div>
      </div>
    </div>
  )
}
