/**
 * Factory functions for Pulse Dashboard test mocks.
 * Use optional overrides to customise individual fields.
 */

import type { Project, ProjectWithOwner, CreateProjectInput, UpdateProjectInput, HealthStatus } from '@nexus/api';

export function makeProject(overrides?: Partial<Project>): Project {
  return {
    id: 'proj-1',
    title: 'Alpha Initiative',
    health_status: 'on_track' as HealthStatus,
    lat: 40.7128,
    lng: -74.006,
    owner_id: 'user-1',
    city: 'New York',
    country: 'US',
    ...overrides,
  };
}

export function makeProjectWithOwner(overrides?: Partial<ProjectWithOwner>): ProjectWithOwner {
  return {
    ...makeProject(),
    owner_display_name: 'Alice',
    ...overrides,
  };
}

export function makeCreateInput(overrides?: Partial<CreateProjectInput>): CreateProjectInput {
  return {
    title: 'New Project',
    health_status: 'on_track',
    lat: 51.5074,
    lng: -0.1278,
    city: null,
    country: null,
    ...overrides,
  };
}

export function makeUpdateInput(overrides?: Partial<UpdateProjectInput>): UpdateProjectInput {
  return {
    title: 'Updated Title',
    health_status: 'at_risk',
    lat: 48.8566,
    lng: 2.3522,
    ...overrides,
  };
}
