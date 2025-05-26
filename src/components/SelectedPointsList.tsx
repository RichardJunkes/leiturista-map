import { List, ListItem, ListItemText } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';

interface Point {
  lat: number;
  lng: number;
  address: string;
}

interface SelectedPointsListProps {
  startPoint: Point | null;
  endPoint: Point | null;
}

const SelectedPointsList = ({ startPoint, endPoint }: SelectedPointsListProps) => (
  <List>
    {startPoint && (
      <ListItem>
        <LocationOnIcon color="primary" sx={{ mr: 1 }} />
        <ListItemText primary="Partida" secondary={startPoint.address} />
      </ListItem>
    )}
    {endPoint && (
      <ListItem>
        <LocationOnIcon color="secondary" sx={{ mr: 1 }} />
        <ListItemText primary="Destino" secondary={endPoint.address} />
      </ListItem>
    )}
  </List>
);

export default SelectedPointsList;
