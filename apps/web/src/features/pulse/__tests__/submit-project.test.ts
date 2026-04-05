/**
 * Tests for submit-project utility
 * Covers: geocoding in address mode, create vs update dispatch, error propagation
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

/* ── Mocks ─────────────────────────────────────────────────── */

const mockCreateProject = vi.fn();
const mockUpdateProject = vi.fn();
const mockGeocodeAddress = vi.fn();

vi.mock('@nexus/api', () => ({
  createProject: (...args: unknown[]) => mockCreateProject(...args),
  updateProject: (...args: unknown[]) => mockUpdateProject(...args),
  geocodeAddress: (...args: unknown[]) => mockGeocodeAddress(...args),
}));

import { submitProject } from '../utils/submit-project';
import { makeProject } from '../__mocks__/project-factories';

/* ── Tests ─────────────────────────────────────────────────── */

describe('submitProject', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Address mode: geocodeAddress is called ──────────────

  it('calls geocodeAddress when locationMode is "type"', async () => {
    mockGeocodeAddress.mockResolvedValue({ lat: 51.5, lng: -0.12 });
    mockCreateProject.mockResolvedValue(makeProject());

    await submitProject({
      title: 'London Office',
      health_status: 'on_track',
      address: 'London, UK',
      lat: null,
      lng: null,
      city: null,
      country: null,
      locationMode: 'type',
      editingId: null,
    });

    expect(mockGeocodeAddress).toHaveBeenCalledWith('London, UK');
    expect(mockCreateProject).toHaveBeenCalledWith(
      expect.objectContaining({ lat: 51.5, lng: -0.12 }),
    );
  });

  // ── Pick mode: geocodeAddress is NOT called ─────────────

  it('does not call geocodeAddress when locationMode is "pick"', async () => {
    mockCreateProject.mockResolvedValue(makeProject());

    await submitProject({
      title: 'Map Project',
      health_status: 'on_track',
      address: '',
      lat: 40.71,
      lng: -74.01,
      city: null,
      country: null,
      locationMode: 'pick',
      editingId: null,
    });

    expect(mockGeocodeAddress).not.toHaveBeenCalled();
    expect(mockCreateProject).toHaveBeenCalledWith(
      expect.objectContaining({ lat: 40.71, lng: -74.01 }),
    );
  });

  // ── Create mode: calls createProject ────────────────────

  it('calls createProject when editingId is null', async () => {
    mockGeocodeAddress.mockResolvedValue({ lat: 48.85, lng: 2.35 });
    const created = makeProject({ id: 'new-id' });
    mockCreateProject.mockResolvedValue(created);

    const result = await submitProject({
      title: 'Paris Office',
      health_status: 'at_risk',
      address: 'Paris, France',
      lat: null,
      lng: null,
      city: null,
      country: null,
      locationMode: 'type',
      editingId: null,
    });

    expect(mockCreateProject).toHaveBeenCalledOnce();
    expect(mockUpdateProject).not.toHaveBeenCalled();
    expect(result).toEqual(created);
  });

  // ── Update mode: calls updateProject ────────────────────

  it('calls updateProject when editingId is provided', async () => {
    mockGeocodeAddress.mockResolvedValue({ lat: 35.68, lng: 139.69 });
    const updated = makeProject({ id: 'proj-5', title: 'Tokyo HQ' });
    mockUpdateProject.mockResolvedValue(updated);

    const result = await submitProject({
      title: 'Tokyo HQ',
      health_status: 'on_track',
      address: 'Tokyo, Japan',
      lat: null,
      lng: null,
      city: null,
      country: null,
      locationMode: 'type',
      editingId: 'proj-5',
    });

    expect(mockUpdateProject).toHaveBeenCalledWith('proj-5', expect.objectContaining({
      title: 'Tokyo HQ',
      health_status: 'on_track',
      lat: 35.68,
      lng: 139.69,
    }));
    expect(mockCreateProject).not.toHaveBeenCalled();
    expect(result).toEqual(updated);
  });

  // ── Error propagation from geocodeAddress ───────────────

  it('propagates geocodeAddress errors', async () => {
    mockGeocodeAddress.mockRejectedValue(new Error('Geocoding failed'));

    await expect(
      submitProject({
        title: 'Bad Address',
        health_status: 'failing',
        address: '???',
        lat: null,
        lng: null,
        city: null,
        country: null,
        locationMode: 'type',
        editingId: null,
      }),
    ).rejects.toThrow('Geocoding failed');

    expect(mockCreateProject).not.toHaveBeenCalled();
  });

  // ── Error propagation from createProject ────────────────

  it('propagates createProject errors', async () => {
    mockGeocodeAddress.mockResolvedValue({ lat: 0, lng: 0 });
    mockCreateProject.mockRejectedValue(new Error('RLS denied'));

    await expect(
      submitProject({
        title: 'Blocked',
        health_status: 'on_track',
        address: 'Nowhere',
        lat: null,
        lng: null,
        city: null,
        country: null,
        locationMode: 'type',
        editingId: null,
      }),
    ).rejects.toThrow('RLS denied');
  });
});
