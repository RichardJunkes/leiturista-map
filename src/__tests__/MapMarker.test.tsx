import { render } from '@testing-library/react';
import { MapContainer } from 'react-leaflet';
import '@testing-library/jest-dom';
import { describe, expect, it } from 'vitest';
import L from 'leaflet';
import { MapMarker } from '../components/MapMarker';
import userEvent from '@testing-library/user-event';

// Mock props
const mockPosition = { lat: -15.7797, lng: -47.9297 };
const mockLabel = 'Ponto de Teste';
const mockAddress = 'Rua Exemplo, 123';
const mockIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

describe('MapMarker com interação', () => {
  it('abre o popup ao clicar no marcador', async () => {
    const {findByText, getByText } = render(
      <MapContainer center={mockPosition} zoom={13} style={{ height: '400px', width: '600px' }}>
        <MapMarker
          position={mockPosition}
          label={mockLabel}
          address={mockAddress}
          icon={mockIcon}
        />
      </MapContainer>
    );

    // O marcador é um <div> com role 'button' internamente pelo leaflet, então busca por ele
    // Obs: às vezes o react-leaflet não atribui role, então buscamos por alt text ou title, mas nesse caso não há
    // Como alternativa, vamos buscar pelo elemento do mapa clicando no container, simulando clique no marcador
    
    const markerElements = document.querySelectorAll('.leaflet-marker-icon');
    expect(markerElements.length).toBeGreaterThan(0);

    // Simula clique no primeiro marcador
    await userEvent.click(markerElements[0]);

    // Agora, o conteúdo do popup deve estar visível
    expect(await findByText(mockLabel)).toBeVisible();
    expect(getByText(mockAddress)).toBeVisible();
  });
});
