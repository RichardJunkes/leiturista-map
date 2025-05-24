import React, { useState, useEffect } from 'react';
import {
  Drawer,
  Box,
  Typography,
  Button,
  IconButton,
  Divider,
  Alert,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import RouteIcon from '@mui/icons-material/Route';

import AddressAutocomplete from './AddressAutocomplete';
import SelectedPointsList from './SelectedPointsList';

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

  const fetchAddressSuggestions = async (
    query: string,
    setSuggestions: (suggestions: AddressSuggestion[]) => void,
    setLoading: (loading: boolean) => void
  ) => {
    if (!query) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query
        )}&countrycodes=br&limit=5&addressdetails=1`
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
          <IconButton aria-label="Close" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)} role="alert">
            {error}
          </Alert>
        )}

        <Box sx={{ mb: 3 }}>
          <AddressAutocomplete
            label="Ponto de Partida"
            placeholder="Digite o endereço de partida"
            options={startSuggestions}
            loading={loadingStart}
            value={startAddress}
            onInputChange={setStartAddress}
            onOptionSelect={handleStartAddressSelect}
          />
        </Box>

        <Box sx={{ mb: 3 }}>
          <AddressAutocomplete
            label="Ponto de Chegada"
            placeholder="Digite o endereço de destino"
            options={endSuggestions}
            loading={loadingEnd}
            value={endAddress}
            onInputChange={setEndAddress}
            onOptionSelect={handleEndAddressSelect}
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
        <SelectedPointsList startPoint={startPoint} endPoint={endPoint} />
      </Box>
    </Drawer>
  );
};

export default SideMenu;
