import { Typography } from '@mui/material';
import { Marker, Popup } from 'react-leaflet';

interface MapMarkerProps {
  position: { lat: number; lng: number };
  label: string;
  address: string;
  icon?: L.Icon;
}

/**
 * Marca a posição no mapa.
 */
export const MapMarker = ({ position, label, address, icon }: MapMarkerProps) => {
  return (
    <Marker position={[position.lat, position.lng]} icon={icon}>
      <Popup>
        <Typography variant="body2">{label}</Typography>
        <Typography variant="caption">{address}</Typography>
      </Popup>
    </Marker>
  );
}
