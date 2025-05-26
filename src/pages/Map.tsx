import { MapContainer, TileLayer, Polyline, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useState, useEffect } from 'react';
import { Box, IconButton, Alert, Snackbar } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SideMenu from '../components/SideMenu';
import { MapMarker } from '../components/MapMarker';
import { fetchRoute } from '../services/routeService';

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

export interface Point {
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
      const routePoints = await fetchRoute(startPoint, endPoint);

      if (routePoints.length === 0) {
        throw new Error('Nenhum ponto na rota');
      }

      setRoute(routePoints);
    } catch (error) {
      console.error('Erro ao calcular rota:', error);
      setError(`Não foi possível calcular a rota`);
    }
  };

  const handleCloseError = () => {
    setError(null);
  };

  return (
    <Box sx={{ height: '100vh', width: '100%', position: 'relative' }}>
      <IconButton
        aria-label="Abrir menu"
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
          <MapMarker
            position={startPoint}
            label="Ponto de Partida"
            address={startPoint.address}
            icon={icon}
          />
        )}

        {endPoint && (
          <MapMarker
            position={endPoint}
            label="Ponto de Chegada"
            address={endPoint.address}
            icon={icon}
          />
        )}

        {/* {route.length > 0 && ( */}
          <Polyline
            data-testid="polyline"
            positions={route.map(point => [point.lat, point.lng])}
            color="blue"
            weight={3}
          />
        {/* )} */}
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
        <Alert role="alert" onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
} 