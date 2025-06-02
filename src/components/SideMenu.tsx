import { useState, useEffect } from 'react';
import {
  Drawer,
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Divider,
  Autocomplete,
  CircularProgress,
  Alert,
  ListItemSecondaryAction,
} from '@mui/material';
import {
  Close as CloseIcon,
  LocationOn as LocationOnIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import RouteIcon from '@mui/icons-material/Route';

interface Point {
  lat: number;
  lng: number;
  address: string;
  isCheckpoint?: boolean;
}

interface AddressSuggestion {
  display_name: string;
  lat: number;
  lon: number;
  importance: number;
}

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
  points: Point[];
  onPointsChange: (points: Point[]) => void;
  onCalculateRoute: () => void;
}

const SideMenu = ({
  isOpen,
  onClose,
  points,
  onPointsChange,
  onCalculateRoute,
}: SideMenuProps) => {
  const [searchAddress, setSearchAddress] = useState('');
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAddressSuggestions = async (query: string) => {
    if (!query) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=br&limit=5&addressdetails=1`
      );
      const data = await response.json();
      setSuggestions(data);
    } catch (error) {
      console.error('Erro ao buscar sugestões:', error);
      setError('Erro ao buscar endereços. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchAddressSuggestions(searchAddress);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchAddress]);

  const handleAddressSelect = (suggestion: AddressSuggestion | null) => {
    if (suggestion) {
      const newPoint: Point = {
        lat: parseFloat(suggestion.lat.toString()),
        lng: parseFloat(suggestion.lon.toString()),
        address: suggestion.display_name,
        isCheckpoint: true
      };
      onPointsChange([...points, newPoint]);
      setSearchAddress('');
    }
  };

  const handleRemovePoint = (index: number) => {
    const newPoints = [...points];
    newPoints.splice(index, 1);
    onPointsChange(newPoints);
  };

  return (
    <Drawer
      anchor="left"
      open={isOpen}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: 400,
          maxWidth: '80%',
          backgroundColor: '#fff',
          boxShadow: 'none',
        },
      }}
    >
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Definir Pontos da Rota</Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            Adicionar Ponto
          </Typography>
          <Autocomplete
            freeSolo
            options={suggestions}
            getOptionLabel={(option) => typeof option === 'string' ? option : option.display_name}
            loading={loading}
            value={null}
            inputValue={searchAddress}
            onInputChange={(_, newValue) => setSearchAddress(newValue)}
            onChange={(_, newValue) => handleAddressSelect(newValue as AddressSuggestion)}
            renderInput={(params) => (
              <TextField
                {...params}
                fullWidth
                size="small"
                placeholder="Digite um endereço para adicionar"
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {loading ? <CircularProgress color="inherit" size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />
        </Box>

        <Button
          variant="contained"
          startIcon={<RouteIcon />}
          fullWidth
          onClick={onCalculateRoute}
          disabled={points.length < 2}
          sx={{ mb: 3 }}
        >
          Calcular Rota
        </Button>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle1" sx={{ mb: 1 }}>
          Pontos da Rota ({points.length})
        </Typography>
        <List>
          {points.map((point, index) => (
            <ListItem key={index}>
              <LocationOnIcon color="primary" sx={{ mr: 1 }} />
              <ListItemText
                primary={`Ponto ${index + 1}`}
                secondary={point.address}
              />
              <ListItemSecondaryAction>
                <IconButton edge="end" onClick={() => handleRemovePoint(index)}>
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
          {points.length === 0 && (
            <ListItem>
              <ListItemText
                secondary="Clique no mapa ou pesquise endereços para adicionar pontos à rota"
              />
            </ListItem>
          )}
        </List>
      </Box>
    </Drawer>
  );
};

export default SideMenu; 