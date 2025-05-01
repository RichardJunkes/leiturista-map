import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useState, useEffect } from 'react';
import { Box, Typography, IconButton, Alert, Snackbar } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SideMenu from './SideMenu';

// Fix para o ícone do marcador
const icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface Point {
  lat: number;
  lng: number;
  address: string;
}

interface RoutePoint {
  lat: number;
  lng: number;
}

function MapClickHandler({ onMapClick }: { onMapClick: (e: L.LeafletMouseEvent) => void }) {
  useMapEvents({
    click: onMapClick,
  });
  return null;
}

function RouteUpdater({ route }: { route: RoutePoint[] }) {
  const map = useMap();

  useEffect(() => {
    if (route.length > 0) {
      const bounds = L.latLngBounds(route.map((point: RoutePoint) => [point.lat, point.lng]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [route, map]);

  return null;
}

export default function Map() {
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [endPoint, setEndPoint] = useState<Point | null>(null);
  const [route, setRoute] = useState<RoutePoint[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleMapClick = (e: L.LeafletMouseEvent) => {
    const { lat, lng } = e.latlng;
    const newPoint = {
      lat,
      lng,
      address: `Ponto ${lat.toFixed(4)}, ${lng.toFixed(4)}`
    };

    if (!startPoint) {
      setStartPoint(newPoint);
    } else if (!endPoint) {
      setEndPoint(newPoint);
    } else {
      setStartPoint(newPoint);
      setEndPoint(null);
      setRoute([]);
    }
  };

  const calculateRoute = async () => {
    if (!startPoint || !endPoint) return;

    try {
      // Usando a API do OpenRouteService
      const response = await fetch(
        `https://api.openrouteservice.org/v2/directions/driving-car?api_key=5b3ce3597851110001cf6248d6a497e3a5f24d6dae5c227d84a3edd3&start=${startPoint.lng},${startPoint.lat}&end=${endPoint.lng},${endPoint.lat}`
      );

      if (!response.ok) {
        throw new Error(`Erro ao calcular rota: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.features || !data.features[0] || !data.features[0].geometry) {
        throw new Error('Dados da rota inválidos');
      }

      // Convertendo as coordenadas do GeoJSON para o formato esperado pelo Polyline
      const coordinates = data.features[0].geometry.coordinates;
      const routePoints = coordinates.map((coord: number[]) => ({
        lat: coord[1], // OpenRouteService retorna [longitude, latitude]
        lng: coord[0]
      }));

      if (routePoints.length === 0) {
        throw new Error('Nenhum ponto na rota');
      }

      setRoute(routePoints);
    } catch (error) {
      console.error('Erro ao calcular rota:', error);
      setError(`Não foi possível calcular a rota: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  };

  const handleCloseError = () => {
    setError(null);
  };

  return (
    <Box sx={{ height: '100vh', width: '100%', position: 'relative' }}>
      <IconButton
        onClick={() => setIsMenuOpen(true)}
        sx={{
          position: 'absolute',
          top: 80,
          left: 16,
          zIndex: 1000,
          backgroundColor: 'white',
          '&:hover': {
            backgroundColor: 'white',
          },
        }}
      >
        <MenuIcon />
      </IconButton>

      <MapContainer
        center={[-15.77972, -47.92972]}
        zoom={4}
        style={{ height: '100%', width: '100%' }}
      >
        <MapClickHandler onMapClick={handleMapClick} />
        <RouteUpdater route={route} />
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {startPoint && (
          <Marker position={[startPoint.lat, startPoint.lng]} icon={icon}>
            <Popup>
              <Typography variant="body2">Ponto de Partida</Typography>
              <Typography variant="caption">{startPoint.address}</Typography>
            </Popup>
          </Marker>
        )}

        {endPoint && (
          <Marker position={[endPoint.lat, endPoint.lng]} icon={icon}>
            <Popup>
              <Typography variant="body2">Ponto de Chegada</Typography>
              <Typography variant="caption">{endPoint.address}</Typography>
            </Popup>
          </Marker>
        )}

        {route.length > 0 && (
          <Polyline
            positions={route.map(point => [point.lat, point.lng])}
            color="blue"
            weight={3}
          />
        )}
      </MapContainer>

      <SideMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        startPoint={startPoint}
        endPoint={endPoint}
        onStartPointChange={setStartPoint}
        onEndPointChange={setEndPoint}
        onCalculateRoute={calculateRoute}
      />

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={handleCloseError}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
} 