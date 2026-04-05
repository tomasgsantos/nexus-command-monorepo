/**
 * Unit tests — fetchProjects, fetchProject
 * Covers: successful queries, error propagation, null handling
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

import {
  mockFrom,
  mockSelect,
  mockOrder,
  mockEq,
  mockMaybeSingle,
  resetChain,
} from '../__mocks__/supabase-client';

// Mock the supabase client used by project-queries
vi.mock('../../../../../../apps/api/src/supabase-client', () => ({
  supabase: { from: mockFrom },
}));

import { fetchProjects, fetchProject } from '@nexus/api';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------
// Raw DB rows returned by the mock (profiles joined as nested object)
const rawA = {
  id: 'p-1',
  title: 'Alpha',
  health_status: 'on_track' as const,
  lat: 40.71,
  lng: -74.0,
  owner_id: 'u-1',
  profiles: { display_name: 'Sarah Chen' },
};

const rawB = {
  id: 'p-2',
  title: 'Beta',
  health_status: 'at_risk' as const,
  lat: null,
  lng: null,
  owner_id: 'u-2',
  profiles: { display_name: 'Marcus Okafor' },
};

// Shaped results after transformation in project-queries
const projectA = { id: 'p-1', title: 'Alpha', health_status: 'on_track' as const, lat: 40.71, lng: -74.0, owner_id: 'u-1', owner_display_name: 'Sarah Chen' };
const projectB = { id: 'p-2', title: 'Beta',  health_status: 'at_risk'  as const, lat: null,  lng: null,  owner_id: 'u-2', owner_display_name: 'Marcus Okafor' };

// ---------------------------------------------------------------------------
// fetchProjects
// ---------------------------------------------------------------------------
describe('fetchProjects', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetChain();
  });

  it('queries the projects table ordered by title', async () => {
    mockOrder.mockReturnValue({ data: [rawA, rawB], error: null });

    const result = await fetchProjects();

    expect(mockFrom).toHaveBeenCalledWith('projects');
    expect(mockSelect).toHaveBeenCalledWith('*, profiles!owner_id(display_name)');
    expect(mockOrder).toHaveBeenCalledWith('title');
    expect(result).toEqual([projectA, projectB]);
  });

  it('returns an empty array when no projects exist', async () => {
    mockOrder.mockReturnValue({ data: [], error: null });

    const result = await fetchProjects();

    expect(result).toEqual([]);
  });

  it('throws an error with the supabase error message on failure', async () => {
    mockOrder.mockReturnValue({
      data: null,
      error: { message: 'permission denied' },
    });

    await expect(fetchProjects()).rejects.toThrow('fetchProjects failed: permission denied');
  });
});

// ---------------------------------------------------------------------------
// fetchProject
// ---------------------------------------------------------------------------
describe('fetchProject', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetChain();
  });

  it('queries by id using eq and maybeSingle', async () => {
    mockMaybeSingle.mockReturnValue({ data: rawA, error: null });

    const result = await fetchProject('p-1');

    expect(mockFrom).toHaveBeenCalledWith('projects');
    expect(mockSelect).toHaveBeenCalledWith('*, profiles!owner_id(display_name)');
    expect(mockEq).toHaveBeenCalledWith('id', 'p-1');
    expect(result).toEqual(projectA);
  });

  it('returns null when the project is not found', async () => {
    mockMaybeSingle.mockReturnValue({ data: null, error: null });

    const result = await fetchProject('nonexistent');

    expect(result).toBeNull();
  });

  it('throws an error with the supabase error message on failure', async () => {
    mockMaybeSingle.mockReturnValue({
      data: null,
      error: { message: 'relation does not exist' },
    });

    await expect(fetchProject('p-1')).rejects.toThrow(
      'fetchProject failed: relation does not exist',
    );
  });
});
