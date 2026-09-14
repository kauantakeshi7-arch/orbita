export interface GeocodeResult {
  label: string;
  latitude: number;
  longitude: number;
}

interface OpenMeteoResult {
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  admin1?: string;
}

/**
 * Busca cidades pelo nome usando a API pública de geocodificação da
 * Open-Meteo (gratuita, sem chave). Roda no servidor para não expor CORS
 * nem depender de chave de API no cliente.
 */
export async function searchCities(query: string): Promise<GeocodeResult[]> {
  if (!query || query.trim().length < 2) return [];
  const url = new URL("https://geocoding-api.open-meteo.com/v1/search");
  url.searchParams.set("name", query.trim());
  url.searchParams.set("count", "6");
  url.searchParams.set("language", "pt");
  url.searchParams.set("format", "json");

  const res = await fetch(url.toString(), {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  if (!res.ok) return [];
  const data = (await res.json()) as { results?: OpenMeteoResult[] };
  if (!data.results) return [];

  return data.results.map((r) => ({
    label: [r.name, r.admin1, r.country].filter(Boolean).join(", "),
    latitude: r.latitude,
    longitude: r.longitude,
  }));
}
