import { render, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SideMenu from '../components/SideMenu';
import '@testing-library/jest-dom';

const startPoint = { lat: 1, lng: 2, address: 'Start Address' };
const endPoint = { lat: 3, lng: 4, address: 'End Address' };

describe('SideMenu', () => {
  it('renderiza SideMenu aberto e permite fechar', () => {
    const onClose = vi.fn();
    const onStartPointChange = vi.fn();
    const onEndPointChange = vi.fn();
    const onCalculateRoute = vi.fn();

    const {getByText, getByRole } = render(
      <SideMenu
        isOpen={true}
        onClose={onClose}
        startPoint={startPoint}
        endPoint={endPoint}
        onStartPointChange={onStartPointChange}
        onEndPointChange={onEndPointChange}
        onCalculateRoute={onCalculateRoute}
      />
    );

    expect(getByText(/definir rota/i)).toBeInTheDocument();

    // Fecha menu
    fireEvent.click(getByRole('button', { name: /close/i }));
    expect(onClose).toHaveBeenCalled();

    // Botão calcular rota habilitado
    const calcBtn = getByRole('button', { name: /calcular rota/i });
    expect(calcBtn).toBeEnabled();

    // Pontos selecionados aparecem
    expect(getByText(/Ponto de Partida/i)).toBeInTheDocument();
    expect(getByText(/start address/i)).toBeInTheDocument();
    expect(getByText(/Ponto de Chegada/i)).toBeInTheDocument();
    expect(getByText(/end address/i)).toBeInTheDocument();
  });

  it('botão calcular rota desabilitado se pontos faltando', () => {
    const onClose = vi.fn();
    const onStartPointChange = vi.fn();
    const onEndPointChange = vi.fn();
    const onCalculateRoute = vi.fn();

    const { rerender, getByRole } = render(
      <SideMenu
        isOpen={true}
        onClose={onClose}
        startPoint={null}
        endPoint={null}
        onStartPointChange={onStartPointChange}
        onEndPointChange={onEndPointChange}
        onCalculateRoute={onCalculateRoute}
      />
    );

    const calcBtn = getByRole('button', { name: /calcular rota/i });
    expect(calcBtn).toBeDisabled();

    // Agora com só o startPoint
    rerender(
      <SideMenu
        isOpen={true}
        onClose={onClose}
        startPoint={startPoint}
        endPoint={null}
        onStartPointChange={onStartPointChange}
        onEndPointChange={onEndPointChange}
        onCalculateRoute={onCalculateRoute}
      />
    );

    expect(calcBtn).toBeDisabled();
  });
});
