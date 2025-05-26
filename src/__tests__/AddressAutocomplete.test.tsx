import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AddressAutocomplete from '../components/AddressAutocomplete';

const suggestions = [
  { display_name: 'Rua A, São Paulo', lat: 0, lon: 0, importance: 1 },
  { display_name: 'Rua B, Rio de Janeiro', lat: 0, lon: 0, importance: 1 },
];

describe('AddressAutocomplete', () => {
  it('renderiza e permite selecionar uma sugestão', () => {
    const onInputChange = vi.fn();
    const onOptionSelect = vi.fn();

    render(
      <AddressAutocomplete
        label="Endereço"
        placeholder="Digite um endereço"
        options={suggestions}
        loading={false}
        value=""
        onInputChange={onInputChange}
        onOptionSelect={onOptionSelect}
      />
    );

    const input = screen.getByPlaceholderText(/digite um endereço/i);
    fireEvent.change(input, { target: { value: 'Rua' } });

    expect(onInputChange).toHaveBeenCalledWith('Rua');

    // Simula selecionar uma opção — a lista do Autocomplete rende mais de uma opção, então selecionamos pelo texto
    fireEvent.click(screen.getByText('Rua A, São Paulo'));
    expect(onOptionSelect).toHaveBeenCalledWith(suggestions[0]);
  });
});
