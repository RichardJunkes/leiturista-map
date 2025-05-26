import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import AddressAutocomplete from '../../components/AddressAutocomplete';

const meta = {
  title: 'Components/AddressAutocomplete',
  component: AddressAutocomplete,
  tags: ['autodocs'],
} satisfies Meta<typeof AddressAutocomplete>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Endereço',
    placeholder: 'Digite um endereço...',
    loading: false,
    value: '',
    options: [
      {
        display_name: 'Av. Paulista, São Paulo - SP, Brasil',
        lat: -23.561414,
        lon: -46.655881,
        importance: 0.9,
      },
      {
        display_name: 'Praça da Sé, São Paulo - SP, Brasil',
        lat: -23.5505,
        lon: -46.6333,
        importance: 0.8,
      },
    ],
    onInputChange: fn(),
    onOptionSelect: fn(),
  },
};
