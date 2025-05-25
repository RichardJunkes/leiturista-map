import type { Meta, StoryObj } from '@storybook/react';
import 'leaflet/dist/leaflet.css';

// Corrige os ícones do Leaflet no Storybook
import L from 'leaflet';
import Map from '../../pages/Map';
delete (L.Icon.Default as any).prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const meta = {
  title: 'Pages/Map',
  component: Map,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen', // Garante que o mapa ocupe toda a tela
  },
} satisfies Meta<typeof Map>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
