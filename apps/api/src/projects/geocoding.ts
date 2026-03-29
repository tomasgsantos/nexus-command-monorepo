const MAPBOX_GEOCODING_URL = 'https://api.mapbox.com/geocoding/v5/mapbox.places';

export interface GeocodingResult {
  lat: number;
  lng: number;
}

export async function geocodeAddress(address: string): Promise<GeocodingResult> {
  const token = import.meta.env.VITE_MAPBOX_TOKEN;

  if (!token) {
    throw new Error('VITE_MAPBOX_TOKEN is not set');
  }

  const encoded = encodeURIComponent(address);
  const url = `${MAPBOX_GEOCODING_URL}/${encoded}.json?access_token=${token}&limit=1`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Geocoding request failed: ${response.status} ${response.statusText}`);
  }

  const body = await response.json();
  const features = body.features;

  if (!features || features.length === 0) {
    throw new Error(`No geocoding results for: ${address}`);
  }

  const [lng, lat] = features[0].center;

  return { lat, lng };
}
