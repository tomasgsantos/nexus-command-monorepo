/**
 * Unit tests — reverseGeocode utility
 * Covers: success path, failed HTTP response, empty features, network error, missing token
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Provide a fake token so the function doesn't bail out early
vi.stubEnv('VITE_MAPBOX_TOKEN', 'test-token');

import { reverseGeocode } from '../utils/reverse-geocode';


function makeFeature(overrides?: Record<string, unknown>) {
  return {
    place_name: '123 Main St, Springfield, USA',
    context: [
      { id: 'place.123', text: 'Springfield' },
      { id: 'country.456', text: 'USA' },
    ],
    ...overrides,
  };
}

function makeGeoResponse(features: unknown[] = [makeFeature()]) {
  return { features };
}

function stubFetch(response: { ok: boolean; json?: () => Promise<unknown> }) {
  const mockFetch = vi.fn().mockResolvedValue({
    ok: response.ok,
    json: response.json ?? (() => Promise.resolve(makeGeoResponse())),
  });
  vi.stubGlobal('fetch', mockFetch);
  return mockFetch;
}


describe('reverseGeocode', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  beforeEach(() => {
    vi.stubEnv('VITE_MAPBOX_TOKEN', 'test-token');
  });

  it('returns address, city and country on a successful geocode response', async () => {
    stubFetch({
      ok: true,
      json: () => Promise.resolve(makeGeoResponse()),
    });

    const result = await reverseGeocode(40.71, -74.0);

    expect(result.address).toBe('123 Main St, Springfield, USA');
    expect(result.city).toBe('Springfield');
    expect(result.country).toBe('USA');
  });

  it('returns null fields when HTTP response is not ok', async () => {
    stubFetch({ ok: false });

    const result = await reverseGeocode(40.71, -74.0);

    expect(result).toEqual({ address: null, city: null, country: null });
  });

  it('returns null fields when features array is empty', async () => {
    stubFetch({
      ok: true,
      json: () => Promise.resolve(makeGeoResponse([])),
    });

    const result = await reverseGeocode(40.71, -74.0);

    expect(result).toEqual({ address: null, city: null, country: null });
  });

  it('returns null fields when network error is thrown', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')));

    await expect(reverseGeocode(40.71, -74.0)).rejects.toThrow('Network error');
  });

  it('returns null fields immediately when VITE_MAPBOX_TOKEN is missing', async () => {
    vi.stubEnv('VITE_MAPBOX_TOKEN', '');
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);

    const result = await reverseGeocode(40.71, -74.0);

    expect(result).toEqual({ address: null, city: null, country: null });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('returns null for city when no place context exists', async () => {
    const feature = makeFeature({
      context: [{ id: 'country.456', text: 'USA' }],
    });
    stubFetch({
      ok: true,
      json: () => Promise.resolve(makeGeoResponse([feature])),
    });

    const result = await reverseGeocode(40.71, -74.0);

    expect(result.city).toBeNull();
    expect(result.country).toBe('USA');
  });
});
