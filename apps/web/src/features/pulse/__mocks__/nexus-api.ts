/**
 * Mock factory for @nexus/api — Pulse Dashboard tests
 *
 * Usage:
 *   import { setupNexusApiMock, mockFetchProjects, mockSubscribeToProjects } from './__mocks__/nexus-api';
 *   setupNexusApiMock();
 */

import { vi } from 'vitest';

export const mockFetchProjects = vi.fn();
export const mockFetchProject = vi.fn();
export const mockSubscribeToProjects = vi.fn();

export function setupNexusApiMock(): void {
  vi.mock('@nexus/api', () => ({
    fetchProjects: mockFetchProjects,
    fetchProject: mockFetchProject,
    subscribeToProjects: mockSubscribeToProjects,
  }));
}
