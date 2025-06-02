import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents, useMap, Rectangle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useState, useEffect } from 'react';
import { Box, Typography, IconButton, Alert, Snackbar, Button } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
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
  isCheckpoint?: boolean;
}

interface RoutePoint {
  lat: number;
  lng: number;
}

function MapClickHandler({ onMapClick }: { onMapClick: (e: L.LeafletMouseEvent) => void }) {
  useMapEvents({
    click: onMapClick
  });
  return null;
}

function RouteUpdater({ route, points }: { route: RoutePoint[], points: Point[] }) {
  const map = useMap();

  useEffect(() => {
    if (points.length > 0) {
      const bounds = L.latLngBounds(points.map((point: Point) => [point.lat, point.lng]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [points, map]);

  return null;
}

export default function Map() {
  const [points, setPoints] = useState<Point[]>([]);
  const [route, setRoute] = useState<RoutePoint[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [routeBounds, setRouteBounds] = useState<L.LatLngBounds | null>(null);

  const handleMapClick = async (e: L.LeafletMouseEvent) => {
    const { lat, lng } = e.latlng;
    
    try {
      // Buscar endereço usando Nominatim
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
      );
      
      if (!response.ok) {
        throw new Error('Erro ao buscar endereço');
      }
      
      const data = await response.json();
      const street = data.address?.road || data.address?.street || 'Endereço desconhecido';
      const number = data.address?.house_number || 'S/N';
      const neighborhood = data.address?.suburb || data.address?.neighbourhood || data.address?.district || '';
      const city = data.address?.city || data.address?.town || data.address?.municipality || '';
      
      const formattedAddress = `${street}, ${number}${neighborhood ? `, ${neighborhood}` : ''}${city ? ` - ${city}` : ''}`;

      const newPoint = {
        lat,
        lng,
        address: formattedAddress,
        isCheckpoint: true
      };

      setPoints([...points, newPoint]);
    } catch (error) {
      console.error('Erro ao buscar endereço:', error);
      // Fallback para o formato anterior em caso de erro
      const newPoint = {
        lat,
        lng,
        address: `Ponto ${points.length + 1}`,
        isCheckpoint: true
      };
      setPoints([...points, newPoint]);
      setError('Não foi possível obter o endereço completo deste ponto');
    }
  };

  const calculateRoute = async () => {
    if (points.length < 2) {
      setError('É necessário pelo menos 2 pontos para calcular a rota');
      return;
    }

    try {
      let routePoints: RoutePoint[] = [];
      
      // Calcular rota entre cada par de pontos consecutivos
      for (let i = 0; i < points.length - 1; i++) {
        const start = points[i];
        const end = points[i + 1];
        
        const response = await fetch(
          `https://api.openrouteservice.org/v2/directions/driving-car?api_key=5b3ce3597851110001cf6248d6a497e3a5f24d6dae5c227d84a3edd3&start=${start.lng},${start.lat}&end=${end.lng},${end.lat}`
        );

        if (!response.ok) {
          throw new Error(`Erro ao calcular rota: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        
        if (!data.features?.[0]?.geometry?.coordinates) {
          throw new Error('Dados da rota inválidos');
        }

        const coordinates = data.features[0].geometry.coordinates;
        const segmentPoints = coordinates.map((coord: number[]) => ({
          lat: coord[1],
          lng: coord[0]
        }));

        routePoints = [...routePoints, ...segmentPoints];
      }

      setRoute(routePoints);

      // Calcular bounds da rota
      if (routePoints.length > 0) {
        const bounds = L.latLngBounds(routePoints.map(point => [point.lat, point.lng]));
        // Expandir bounds em 10% para melhor visualização
        bounds.extend([
          [bounds.getSouth() - 0.1 * bounds.getSouth(), bounds.getWest() - 0.1 * bounds.getWest()],
          [bounds.getNorth() + 0.1 * bounds.getNorth(), bounds.getEast() + 0.1 * bounds.getEast()]
        ]);
        setRouteBounds(bounds);
      }
    } catch (error) {
      console.error('Erro ao calcular rota:', error);
      setError(`Não foi possível calcular a rota: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  };

  const handleCloseError = () => {
    setError(null);
  };

  const clearRoute = () => {
    setPoints([]);
    setRoute([]);
    setRouteBounds(null);
  };

  const shareRouteViaWhatsApp = () => {
    if (points.length < 2) {
      setError('É necessário ter pelo menos 2 pontos para compartilhar a rota');
      return;
    }

    const routeText = points.map((point, index) => 
      `📍 Ponto ${index + 1}:\nEndereço: ${point.address}\nLocalização: ${point.lat.toFixed(6)}, ${point.lng.toFixed(6)}`
    ).join('\n\n');

    const message = `🚶‍♂️ *Rota do Leiturista*\n\n${routeText}\n\n📱 Total de pontos: ${points.length}`;
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
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

      <Box
        sx={{
          position: 'absolute',
          top: 80,
          right: 16,
          zIndex: 1000,
          backgroundColor: 'white',
          padding: 1,
          borderRadius: 1,
          boxShadow: 1,
        }}
      >
        <Button
          variant="contained"
          onClick={calculateRoute}
          disabled={points.length < 2}
          sx={{ mb: 1, width: '100%' }}
        >
          Calcular Rota
        </Button>
        <Button
          variant="outlined"
          onClick={clearRoute}
          sx={{ mb: 1, width: '100%' }}
        >
          Limpar Rota
        </Button>
        <Button
          variant="contained"
          color="success"
          startIcon={<WhatsAppIcon />}
          onClick={shareRouteViaWhatsApp}
          disabled={points.length < 2}
          sx={{ width: '100%' }}
        >
          Compartilhar via WhatsApp
        </Button>
      </Box>

      <MapContainer
        center={[-15.77972, -47.92972]}
        zoom={4}
        style={{ height: '100%', width: '100%' }}
      >
        <MapClickHandler onMapClick={handleMapClick} />
        <RouteUpdater route={route} points={points} />
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {points.map((point, index) => (
          <Marker key={index} position={[point.lat, point.lng]} icon={icon}>
            <Popup>
              <Typography variant="body2">Ponto {index + 1}</Typography>
              <Typography variant="caption">{point.address}</Typography>
            </Popup>
          </Marker>
        ))}

        {route.length > 0 && (
          <Polyline
            positions={route.map(point => [point.lat, point.lng])}
            color="blue"
            weight={3}
          />
        )}

        {routeBounds && (
          <Rectangle
            bounds={routeBounds}
            pathOptions={{ color: 'rgba(0, 0, 255, 0.1)', weight: 1 }}
          />
        )}
      </MapContainer>

      <SideMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        points={points}
        onPointsChange={setPoints}
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