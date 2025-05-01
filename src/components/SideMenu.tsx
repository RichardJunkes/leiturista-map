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
} from '@mui/material';
import {
  Close as CloseIcon,
  LocationOn as LocationOnIcon,
} from '@mui/icons-material';
import RouteIcon from '@mui/icons-material/Route';

interface Point {
  lat: number;
  lng: number;
  address: string;
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
  startPoint: Point | null;
  endPoint: Point | null;
  onStartPointChange: (point: Point) => void;
  onEndPointChange: (point: Point) => void;
  onCalculateRoute: () => void;
}

const SideMenu = ({
  isOpen,
  onClose,
  startPoint,
  endPoint,
  onStartPointChange,
  onEndPointChange,
  onCalculateRoute,
}: SideMenuProps) => {
  const [startAddress, setStartAddress] = useState('');
  const [endAddress, setEndAddress] = useState('');
  const [startSuggestions, setStartSuggestions] = useState<AddressSuggestion[]>([]);
  const [endSuggestions, setEndSuggestions] = useState<AddressSuggestion[]>([]);
  const [loadingStart, setLoadingStart] = useState(false);
  const [loadingEnd, setLoadingEnd] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAddressSuggestions = async (query: string, setSuggestions: (suggestions: AddressSuggestion[]) => void, setLoading: (loading: boolean) => void) => {
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
      fetchAddressSuggestions(startAddress, setStartSuggestions, setLoadingStart);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [startAddress]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchAddressSuggestions(endAddress, setEndSuggestions, setLoadingEnd);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [endAddress]);

  const handleStartAddressSelect = (suggestion: AddressSuggestion | null) => {
    if (suggestion) {
      onStartPointChange({
        lat: parseFloat(suggestion.lat.toString()),
        lng: parseFloat(suggestion.lon.toString()),
        address: suggestion.display_name,
      });
    }
  };

  const handleEndAddressSelect = (suggestion: AddressSuggestion | null) => {
    if (suggestion) {
      onEndPointChange({
        lat: parseFloat(suggestion.lat.toString()),
        lng: parseFloat(suggestion.lon.toString()),
        address: suggestion.display_name,
      });
    }
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
          <Typography variant="h6">Definir Rota</Typography>
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
            Ponto de Partida
          </Typography>
          <Autocomplete
            freeSolo
            options={startSuggestions}
            getOptionLabel={(option) => typeof option === 'string' ? option : option.display_name}
            loading={loadingStart}
            onInputChange={(_, newValue) => setStartAddress(newValue)}
            onChange={(_, newValue) => handleStartAddressSelect(newValue as AddressSuggestion)}
            renderInput={(params) => (
              <TextField
                {...params}
                fullWidth
                size="small"
                placeholder="Digite o endereço de partida"
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {loadingStart ? <CircularProgress color="inherit" size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            Ponto de Chegada
          </Typography>
          <Autocomplete
            freeSolo
            options={endSuggestions}
            getOptionLabel={(option) => typeof option === 'string' ? option : option.display_name}
            loading={loadingEnd}
            onInputChange={(_, newValue) => setEndAddress(newValue)}
            onChange={(_, newValue) => handleEndAddressSelect(newValue as AddressSuggestion)}
            renderInput={(params) => (
              <TextField
                {...params}
                fullWidth
                size="small"
                placeholder="Digite o endereço de destino"
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {loadingEnd ? <CircularProgress color="inherit" size={20} /> : null}
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
          disabled={!startPoint || !endPoint}
          sx={{ mb: 3 }}
        >
          Calcular Rota
        </Button>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle1" sx={{ mb: 1 }}>
          Pontos Selecionados
        </Typography>
        <List>
          {startPoint && (
            <ListItem>
              <LocationOnIcon color="primary" sx={{ mr: 1 }} />
              <ListItemText
                primary="Partida"
                secondary={startPoint.address}
              />
            </ListItem>
          )}
          {endPoint && (
            <ListItem>
              <LocationOnIcon color="secondary" sx={{ mr: 1 }} />
              <ListItemText
                primary="Destino"
                secondary={endPoint.address}
              />
            </ListItem>
          )}
        </List>
      </Box>
    </Drawer>
  );
};

export default SideMenu; 