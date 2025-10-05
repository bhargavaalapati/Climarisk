import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents, LayersControl } from 'react-leaflet';
import { Button, Card, Typography, Input } from 'antd';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

// --- LEAFLET ICON FIX (No changes needed here) ---
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;
// --- END ICON FIX ---


const { Title, Text } = Typography;
const { Search } = Input;

// Helper component to programmatically fly to a new map view
function MapViewUpdater({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom);
    }
  }, [center, zoom, map]);

  return null;
}

// Helper component to handle map clicks (unchanged)
function LocationFinder({ onLocationSelect }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng);
    },
  });
  return null;
}


function HomePage() {
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [mapCenter, setMapCenter] = useState([20.5937, 78.9629]); // Initial center is India
  const [mapZoom, setMapZoom] = useState(5);
  const [isSearching, setIsSearching] = useState(false);
  const [locationName, setLocationName] = useState(null);
  const [fullAddress, setFullAddress] = useState(null);
  const navigate = useNavigate();
  const markerRef = useRef(null);

  // This useEffect hook now handles fetching the place name
  // whenever the selectedPosition changes.
  useEffect(() => {
    if (!selectedPosition) return;

    const fetchPlaceName = async (lat, lon) => {
      try {
        const res = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
        );
        const data = await res.json();
        const shortName = data.city || data.locality || data.principalSubdivision || `Location`;
        const parts = [data.locality, data.city, data.principalSubdivision, data.countryName]
          .filter(Boolean)
          .filter((item, idx, arr) => arr.indexOf(item) === idx);
        
        setLocationName(shortName);
        setFullAddress(parts.join(", "));
      } catch (error) {
        setLocationName("Could not fetch name", error);
        setFullAddress(null);
        toast.error("Failed to get location details.");
      }
    };

    fetchPlaceName(selectedPosition.lat, selectedPosition.lng);

    // This part opens the popup automatically
    if (markerRef.current) {
      markerRef.current.openPopup();
    }
  }, [selectedPosition]);

  const handleAnalyzeClick = () => {
    if (selectedPosition) {
      navigate(
        `/dashboard?lat=${selectedPosition.lat.toFixed(4)}&lon=${selectedPosition.lng.toFixed(4)}`
      );
    }
  };

  const handleSearch = async (value) => {
    if (!value.trim()) {
      toast.error("Please enter a location to search.");
      return;
    }
    setIsSearching(true);
    const loadingToastId = toast.loading('Searching for location...');
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${value}`);
      const data = await response.json();
      toast.dismiss(loadingToastId);
      if (data && data.length > 0) {
        const { lat, lon, display_name } = data[0];
        const newPosition = { lat: parseFloat(lat), lng: parseFloat(lon) };
        setMapCenter(newPosition);
        setSelectedPosition(newPosition);
        setMapZoom(13); // Zoom in closer on search result
        toast.success(`Location found: ${display_name}`);
      } else {
        toast.error("Location not found.");
      }
    } catch (error) {
      toast.dismiss(loadingToastId);
      toast.error("Could not connect to the location service.", error);
    } finally {
      setIsSearching(false);
    }
  };
  
  const handleMapClick = (pos) => {
    setSelectedPosition(pos);
    setMapCenter(pos);
    setMapZoom(13); // Zoom in closer on clicked location
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <Card style={{ border: '1px solid #e8e8e8' }}>
        <div style={{ marginBottom: '24px' }}>
          <Title level={4}>Select a Location</Title>
          <Text type="secondary">Click on the map or use the search bar to find a place.</Text>
          <Search
            placeholder="e.g., Visakhapatnam, India"
            onSearch={handleSearch}
            enterButton="Search"
            size="large"
            loading={isSearching}
            style={{ marginTop: '16px' }}
          />
        </div>
        <div style={{ height: '60vh', borderRadius: '8px', overflow: 'hidden' }}>
          <MapContainer
            center={mapCenter}
            zoom={mapZoom}
            style={{ height: '100%', width: '100%' }}
            worldCopyJump={false}
            maxBounds={[[-90, -180], [90, 180]]}
            maxBoundsViscosity={1.0}
          >
            <MapViewUpdater center={mapCenter} zoom={mapZoom} />
            
            <LayersControl position="topright">
              <LayersControl.BaseLayer checked name="Esri World Imagery">
                <TileLayer
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                  attribution="&copy; Esri &mdash; i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
                  noWrap={true} 
                />
              </LayersControl.BaseLayer>
              <LayersControl.BaseLayer name="Street Map">
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  noWrap={true}
                />
              </LayersControl.BaseLayer>
              <LayersControl.Overlay name="VIIRS Night Lights" checked>
                <TileLayer
                  url="https://tiles.maps.eox.at/wmts/1.0.0/VIIRS_CityLights/default/g/{z}/{y}/{x}.jpg"
                  attribution='&copy; <a href="https://eox.at">EOX</a> & <a href="https://www.nasa.gov/mission_pages/NPP/news/VIIRS.html">NASA VIIRS</a>'
                  noWrap={true}
                />
              </LayersControl.Overlay>
            </LayersControl>
            
            <LocationFinder onLocationSelect={handleMapClick} />

            {selectedPosition && (
              <Marker position={selectedPosition} ref={markerRef}>
                <Popup>
                  <div>
                    <p><strong>{locationName || "Loading..."}</strong></p>
                    {fullAddress && (
                      <p style={{ fontSize: "0.85rem", color: "rgba(0,0,0,0.6)", margin: 0 }}>
                        {fullAddress}
                      </p>
                    )}
                    <p style={{ fontSize: "0.75rem", color: "#999", marginTop: '4px' }}>
                      Lat: {selectedPosition.lat.toFixed(4)}, Lon: {selectedPosition.lng.toFixed(4)}
                    </p>
                    <Button
                      type="primary"
                      size="small"
                      onClick={handleAnalyzeClick}
                      style={{ marginTop: '8px', width: '100%' }}
                    >
                      Analyze Risk
                    </Button>
                  </div>
                </Popup>
              </Marker>
            )}
          </MapContainer>
        </div>
      </Card>
    </motion.div>
  );
}

export default HomePage;