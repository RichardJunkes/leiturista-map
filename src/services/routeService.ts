import { Point } from '../components/Map';

interface RoutePoint {
  lat: number,
  lng: number
}

/**
 * Busca os pontos no mapa através da requisição a API Open Route Service.
 * @param start Ponto de partida.
 * @param end Ponto de destino.
 * @returns Array de Coordenadas (latitude e Longitude)
 */
export async function fetchRoute(start: Point, end: Point): Promise<RoutePoint[]> {
  const apiKey = import.meta.env.VITE_OPEN_ROUTE_API_KEY;
  const response = await fetch(
    `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${apiKey}&start=${start.lng},${start.lat}&end=${end.lng},${end.lat}`
  );

  if (!response.ok) {
    throw new Error(`Erro ao calcular rota: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const coordinates = data?.features?.[0]?.geometry?.coordinates ?? [];

  return coordinates.map(([lng, lat]: number[]) => ({ lat, lng }));
}