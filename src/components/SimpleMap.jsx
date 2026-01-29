import { useState } from 'react';

const SimpleMap = ({ userLocation, stations }) => {
  const [selectedStation, setSelectedStation] = useState(null);

  if (!userLocation) {
    return (
      <div className="bg-gray-100 rounded-lg p-8 text-center">
        <p className="text-gray-600">Enable location to view map</p>
      </div>
    );
  }

  const handleNavigate = (station) => {
    const url = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.latitude},${userLocation.longitude}&destination=${station.latitude},${station.longitude}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-4">
      {/* Embedded Google Map */}
      <div className="relative w-full h-96 rounded-lg overflow-hidden shadow-md">
        <iframe 
          src={`https://maps.google.com/maps?width=100%25&height=400&hl=en&q=${userLocation.latitude},${userLocation.longitude}&t=&z=13&ie=UTF8&iwloc=B&output=embed`}
          width="100%" 
          height="400" 
          allowFullScreen={true}
          loading="lazy" 
          referrerPolicy="no-referrer-when-downgrade"
          className="border-0"
        />
      </div>

      {/* Station List with Navigate Buttons */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Nearby Stations</h3>
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {stations.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No stations found nearby</p>
          ) : (
            stations.map((station) => (
              <div
                key={station.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{station.name}</h4>
                  <p className="text-sm text-gray-600">{station.location}</p>
                  {station.distance && (
                    <p className="text-xs text-gray-500 mt-1">
                      📍 {station.distance.toFixed(2)} km away
                    </p>
                  )}
                </div>
                <button
                  onClick={() => handleNavigate(station)}
                  className="ml-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
                >
                  Navigate
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Note about Google Maps API */}
      <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg text-sm">
        <p className="font-medium">💡 Tip: For interactive map with station markers</p>
        <p className="mt-1">
          Add your Google Maps API key to <code className="bg-blue-100 px-1 rounded">.env</code> file as <code className="bg-blue-100 px-1 rounded">VITE_GOOGLE_MAPS_API_KEY</code>
        </p>
      </div>
    </div>
  );
};

export default SimpleMap;
