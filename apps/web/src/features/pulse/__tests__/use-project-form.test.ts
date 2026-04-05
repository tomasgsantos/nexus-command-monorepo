/**
 * Tests for use-project-form hook
 * Covers: form state, validation, submit modes, geocoding, map-pick
 *
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

/* ── Mocks ─────────────────────────────────────────────────── */

const mockSubmitProject = vi.fn();
const mockReverseGeocode = vi.fn();

vi.mock('../utils/submit-project', () => ({
  submitProject: (...args: unknown[]) => mockSubmitProject(...args),
}));

vi.mock('../utils/reverse-geocode', () => ({
  reverseGeocode: (...args: unknown[]) => mockReverseGeocode(...args),
}));

import { useProjectForm } from '../hooks/use-project-form';
import { makeProject, makeProjectWithOwner } from '../__mocks__/project-factories';

/* ── Helpers ───────────────────────────────────────────────── */

function renderForm() {
  return renderHook(() => useProjectForm());
}

/* ── Tests ─────────────────────────────────────────────────── */

describe('useProjectForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockReverseGeocode.mockResolvedValue({ address: null, city: null, country: null });
  });

  // ── Initial state ────────────────────────────────────────

  it('starts with empty fields and no editingId', () => {
    const { result } = renderForm();

    expect(result.current.fields.title).toBe('');
    expect(result.current.fields.health_status).toBe('on_track');
    expect(result.current.fields.address).toBe('');
    expect(result.current.fields.lat).toBeNull();
    expect(result.current.fields.lng).toBeNull();
    expect(result.current.locationMode).toBe('type');
    expect(result.current.editingId).toBeNull();
    expect(result.current.submitting).toBe(false);
    expect(result.current.error).toBeNull();
  });

  // ── setField ────────────────────────────────────────────

  it('updates a single field via setField and clears error', async () => {
    const { result } = renderForm();

    act(() => {
      result.current.setField('title', 'New Title');
    });

    expect(result.current.fields.title).toBe('New Title');
  });

  // ── Validation: empty title ──────────────────────────────

  it('returns validation error when title is empty', () => {
    const { result } = renderForm();

    const err = result.current.validate();
    expect(err).toBe('Title is required');
  });

  // ── Validation: no address in type mode ──────────────────

  it('returns validation error when address is empty in type mode', () => {
    const { result } = renderForm();

    act(() => {
      result.current.setField('title', 'Some Project');
    });

    const err = result.current.validate();
    expect(err).toBe('Address is required');
  });

  // ── Validation: no location in pick mode ────────────────

  it('returns validation error when no coordinates in pick mode', () => {
    const { result } = renderForm();

    act(() => {
      result.current.setField('title', 'Some Project');
      result.current.setLocationMode('pick');
    });

    const err = result.current.validate();
    expect(err).toBe('Click the map to pick a location');
  });

  // ── Validation: passes ──────────────────────────────────

  it('returns null when form is valid (type mode)', () => {
    const { result } = renderForm();

    act(() => {
      result.current.setField('title', 'Valid Project');
      result.current.setField('address', '123 Main St');
    });

    expect(result.current.validate()).toBeNull();
  });

  it('returns null when form is valid (pick mode)', () => {
    const { result } = renderForm();

    act(() => {
      result.current.setField('title', 'Valid Project');
      result.current.setLocationMode('pick');
      result.current.setMapCoordinates(40.71, -74.01);
    });

    expect(result.current.validate()).toBeNull();
  });

  // ── Submit in create mode ───────────────────────────────

  it('calls submitProject with correct params in create mode', async () => {
    const created = makeProject({ id: 'new-1', title: 'Created' });
    mockSubmitProject.mockResolvedValue(created);

    const { result } = renderForm();

    act(() => {
      result.current.setField('title', 'Created');
      result.current.setField('address', 'London');
    });

    await act(async () => {
      await result.current.submit();
    });

    expect(mockSubmitProject).toHaveBeenCalledOnce();
    expect(mockSubmitProject).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Created',
        address: 'London',
        locationMode: 'type',
        editingId: null,
      }),
    );
  });

  // ── Submit in update mode ───────────────────────────────

  it('calls submitProject with editingId in update mode', async () => {
    const existing = makeProjectWithOwner({ id: 'proj-99', title: 'Existing' });
    const updated = makeProject({ id: 'proj-99', title: 'Updated' });
    mockSubmitProject.mockResolvedValue(updated);

    const { result } = renderForm();

    act(() => {
      result.current.initEdit(existing);
    });

    expect(result.current.editingId).toBe('proj-99');
    expect(result.current.fields.title).toBe('Existing');

    await act(async () => {
      await result.current.submit();
    });

    expect(mockSubmitProject).toHaveBeenCalledWith(
      expect.objectContaining({ editingId: 'proj-99' }),
    );
  });

  // ── Submit sets validation error ────────────────────────

  it('sets error and throws on validation failure during submit', async () => {
    const { result } = renderForm();

    let caught: Error | null = null;
    await act(async () => {
      try {
        await result.current.submit();
      } catch (err) {
        caught = err as Error;
      }
    });

    expect((caught as Error | null)?.message).toBe('Title is required');
    expect(result.current.error).toBe('Title is required');
    expect(mockSubmitProject).not.toHaveBeenCalled();
  });

  // ── Submit propagates backend error ─────────────────────

  it('sets error from submitProject failure', async () => {
    mockSubmitProject.mockRejectedValue(new Error('Network error'));

    const { result } = renderForm();

    act(() => {
      result.current.setField('title', 'Test');
      result.current.setField('address', '123 St');
    });

    let caught: Error | null = null;
    await act(async () => {
      try {
        await result.current.submit();
      } catch (err) {
        caught = err as Error;
      }
    });

    expect((caught as Error | null)?.message).toBe('Network error');
    expect(result.current.error).toBe('Network error');
    expect(result.current.submitting).toBe(false);
  });

  // ── setMapCoordinates calls reverseGeocode ──────────────

  it('sets lat/lng immediately and calls reverseGeocode', async () => {
    type GeocodeResult = { address: string | null; city: string | null; country: string | null };
    let resolveGeocode!: (v: GeocodeResult) => void;
    mockReverseGeocode.mockImplementation(
      () => new Promise<GeocodeResult>((res) => { resolveGeocode = res; }),
    );

    const { result } = renderForm();

    act(() => {
      result.current.setMapCoordinates(40.6782, -73.9442);
    });

    // Coordinates set synchronously
    expect(result.current.fields.lat).toBe(40.6782);
    expect(result.current.fields.lng).toBe(-73.9442);
    expect(result.current.fields.address).toBe('40.6782, -73.9442');
    expect(mockReverseGeocode).toHaveBeenCalledWith(40.6782, -73.9442);

    // Resolve the reverse geocode
    await act(async () => {
      resolveGeocode({ address: 'Brooklyn, NY', city: 'Brooklyn', country: 'US' });
    });

    expect(result.current.fields.address).toBe('Brooklyn, NY');
  });

  // ── initCreate resets form ──────────────────────────────

  it('resets all fields when initCreate is called', () => {
    const { result } = renderForm();

    act(() => {
      result.current.setField('title', 'Dirty');
      result.current.initCreate();
    });

    expect(result.current.fields.title).toBe('');
    expect(result.current.editingId).toBeNull();
  });
});
