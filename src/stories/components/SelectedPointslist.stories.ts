import { Meta, StoryObj } from '@storybook/react';
import SelectedPointsList from '../../components/SelectedPointsList';

const meta = {
  title: 'Components/SelectedPointsList',
  component: SelectedPointsList,
  tags: ['autodocs'],
} satisfies Meta<typeof SelectedPointsList>;

export default meta;

type Story = StoryObj<typeof meta>;

const mockStartPoint = {
  lat: -23.5505,
  lng: -46.6333,
  address: 'Avenida Paulista, São Paulo - SP',
};

const mockEndPoint = {
  lat: -22.9068,
  lng: -43.1729,
  address: 'Praia de Copacabana, Rio de Janeiro - RJ',
};

export const BothPoints: Story = {
  args: {
    startPoint: mockStartPoint,
    endPoint: mockEndPoint,
  },
};

export const OnlyStartPoint: Story = {
  args: {
    startPoint: mockStartPoint,
    endPoint: null,
  },
};

export const OnlyEndPoint: Story = {
  args: {
    startPoint: null,
    endPoint: mockEndPoint,
  },
};

export const NoPoints: Story = {
  args: {
    startPoint: null,
    endPoint: null,
  },
};
