const MAPBOX_REVERSE_URL = 'https://api.mapbox.com/geocoding/v5/mapbox.places';

export async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  const token = import.meta.env.VITE_MAPBOX_TOKEN;
  if (!token) return null;

  const res = await fetch(
    `${MAPBOX_REVERSE_URL}/${lng},${lat}.json?access_token=${token}&limit=1`,
  );
  if (!res.ok) return null;

  const data = await res.json();
  return data.features?.[0]?.place_name ?? null;
}
