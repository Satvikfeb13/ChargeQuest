import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, CircleMarker } from 'react-leaflet';
import { useNavigate } from 'react-router-dom'; // Added navigate
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Button from './Button';

// Fix for default Leaflet icons in Vite/Webpack
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});

// Custom icons
const stationIcon = (available) => new L.Icon({
  iconUrl: available 
    ? 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png' 
    : 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Component to handle map centering logic
const MapUpdater = ({ center, stations }) => {
  const map = useMap();

  useEffect(() => {
    if (center) {
      map.setView(center, 13);
    } else if (stations.length > 0) {
      // Create bounds from stations
      const bounds = L.latLngBounds(stations.map(s => [s.latitude, s.longitude]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [center, stations, map]);

  return null;
};

const StationMap = ({ userLocation, stations }) => {
  const navigate = useNavigate(); // Hook for navigation
  
  // Default center (Zero Kilometer Stone, Nagpur, India)
  const defaultCenter = [21.1458, 79.0882];
  
  const center = userLocation 
    ? [userLocation.latitude, userLocation.longitude] 
    : defaultCenter;

  const handleNavigate = (station) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${station.latitude},${station.longitude}`;
    window.open(url, '_blank');
  };

  const handleBookNow = (stationId) => {
    navigate(`/stations/${stationId}`);
  };

  return (
    <MapContainer 
      center={center} 
      zoom={5} 
      style={{ height: '600px', width: '100%', borderRadius: '0.5rem', zIndex: 0 }}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      <MapUpdater center={userLocation ? [userLocation.latitude, userLocation.longitude] : null} stations={stations} />

      {/* User Location Marker */}
      {userLocation && (
        <CircleMarker 
          center={[userLocation.latitude, userLocation.longitude]}
          pathOptions={{ fillColor: '#2563eb', color: 'white', weight: 2, fillOpacity: 1 }}
          radius={8}
        >
          <Popup>
            <div className="font-semibold">Your Location</div>
          </Popup>
        </CircleMarker>
      )}

      {/* Station Markers */}
      {stations.map((station) => {
        const sId = station.id || station.stationId || station.station_id;
        const sName = station.stationName || station.station_name || station.name;
        const sPrice = station.pricePerUnit || station.price_per_unit || station.price || 0;
        const sAvailable = (station.status?.toUpperCase() === 'ACTIVE') || station.available || (station.availableSlots > 0);
        
        return (
          <Marker
            key={sId}
            position={[station.latitude, station.longitude]}
            icon={stationIcon(sAvailable)}
          >
            <Popup>
              <div className="p-1 min-w-[200px]">
                <h3 className="font-bold text-lg mb-1">{sName}</h3>
                <p className="text-sm text-gray-400 mb-2">{station.address || station.location || 'Address not available'}</p>
                
                {station.distance !== undefined && (
                  <p className="text-sm text-gray-500 mb-2 font-medium">
                    📍 {station.distance.toFixed(2)} km away
                  </p>
                )}
                
                <div className="flex justify-between items-center mb-3">
                   <div className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold ${
                     sAvailable ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                   }`}>
                     {sAvailable ? '✓ Available' : '✗ Occupied'}
                   </div>
                   {/* Available Slots Display */}
                   <span className="text-xs text-slate-500 font-bold">
                      {station.availableSlots ?? station.available_slots ?? 0} Slots Free
                   </span>
                </div>
  
                <div className="flex gap-2 text-sm text-slate-300 mb-4 font-semibold p-2 bg-slate-800/50 rounded-lg">
                   <span>{station.categoryName || station.type || 'Standard'}</span>
                   <span className="text-slate-600">•</span>
                   <span className="text-primary-400">₹{sPrice}/kWh</span>
                </div>
  
                <div className="flex gap-2">
                    <Button
                      onClick={() => handleBookNow(sId)}
                      variant="primary"
                      fullWidth
                      size="sm"
                      disabled={!sAvailable}
                    >
                      Book Now
                    </Button>
                    <Button
                      onClick={() => handleNavigate(station)}
                      variant="outline"
                      fullWidth
                      size="sm"
                    >
                      ↗ Map
                    </Button>
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
};

export default StationMap;
