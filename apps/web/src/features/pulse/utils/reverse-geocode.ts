const MAPBOX_REVERSE_URL = 'https://api.mapbox.com/geocoding/v5/mapbox.places';

export interface ReverseGeocodeResult {
  address: string | null;
  city: string | null;
  country: string | null;
}

export async function reverseGeocode(lat: number, lng: number): Promise<ReverseGeocodeResult> {
  const token = import.meta.env.VITE_MAPBOX_TOKEN;
  if (!token) return { address: null, city: null, country: null };

  const res = await fetch(
    `${MAPBOX_REVERSE_URL}/${lng},${lat}.json?access_token=${token}&limit=1`,
  );
  if (!res.ok) return { address: null, city: null, country: null };

  const data = await res.json();
  const feature = data.features?.[0];
  if (!feature) return { address: null, city: null, country: null };

  const address = feature.place_name ?? null;
  const context: { id: string; text: string }[] = feature.context ?? [];
  const city = context.find((c) => c.id.startsWith('place.'))?.text ?? null;
  const country = context.find((c) => c.id.startsWith('country.'))?.text ?? null;

  return { address, city, country };
}
