/**
 * Unit tests — ProjectNodesWidget component
 * Covers: header/badge rendering, markers per geo project, skips non-geo projects,
 *         map hidden while loading, "View Full Map" navigation
 *
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { createElement } from 'react';

/* ── Hoisted state ──────────────────────────────────────────── */

const mockNavigate = vi.hoisted(() => vi.fn());

const feedState = vi.hoisted(() => ({
  projects: [] as import('@nexus/api').ProjectWithOwner[],
  loading: false,
}));

/* ── Mocks ──────────────────────────────────────────────────── */

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock('../hooks/use-realtime-feed', () => ({
  useRealtimeFeed: () => ({
    projects: feedState.projects,
    loading: feedState.loading,
    error: null,
    refresh: vi.fn(),
    notification: null,
    clearNotification: vi.fn(),
  }),
}));

vi.mock('../hooks/use-pulse-map', () => ({
  MAPBOX_TOKEN: 'test-token',
  MAP_STYLE: 'test-style',
  usePulseMap: () => ({
    viewState: { longitude: 0, latitude: 0, zoom: 2 },
    onMove: vi.fn(),
  }),
}));

vi.mock('react-map-gl', () => ({
  default: (props: { children?: unknown }) =>
    createElement('div', { 'data-testid': 'mapbox-map' }, props.children as never),
  Marker: (props: { children?: unknown }) =>
    createElement('div', { 'data-testid': 'map-marker' }, props.children as never),
}));

vi.mock('mapbox-gl/dist/mapbox-gl.css', () => ({}));
vi.mock('./ProjectNodesWidget.css', () => ({}));

/* ── Component import (after mocks) ─────────────────────────── */

import { ProjectNodesWidget } from './ProjectNodesWidget';
import { makeProjectWithOwner } from '../__mocks__/project-factories';
import { AppRoute } from '../../../constants/routes';

/* ── Tests ──────────────────────────────────────────────────── */

describe('ProjectNodesWidget', () => {
  afterEach(() => {
    cleanup();
    mockNavigate.mockReset();
    feedState.projects = [];
    feedState.loading = false;
  });

  it('renders the "Active Project Nodes" title', () => {
    render(createElement(ProjectNodesWidget, null));
    expect(screen.getByText('Active Project Nodes')).toBeDefined();
  });

  it('renders the "Live Data" badge', () => {
    render(createElement(ProjectNodesWidget, null));
    expect(screen.getByText('Live Data')).toBeDefined();
  });

  it('renders a marker for each project with geo coordinates', () => {
    feedState.projects = [
      makeProjectWithOwner({ id: 'p1', lat: 40.71, lng: -74.0 }),
      makeProjectWithOwner({ id: 'p2', lat: 51.5, lng: -0.12 }),
    ];
    render(createElement(ProjectNodesWidget, null));
    expect(screen.getAllByTestId('map-marker')).toHaveLength(2);
  });

  it('does not render a marker for projects missing lat/lng', () => {
    feedState.projects = [
      makeProjectWithOwner({ id: 'p1', lat: null, lng: null }),
      makeProjectWithOwner({ id: 'p2', lat: 40.71, lng: -74.0 }),
    ];
    render(createElement(ProjectNodesWidget, null));
    expect(screen.getAllByTestId('map-marker')).toHaveLength(1);
  });

  it('renders zero markers when all projects lack coordinates', () => {
    feedState.projects = [
      makeProjectWithOwner({ id: 'p1', lat: null, lng: null }),
    ];
    render(createElement(ProjectNodesWidget, null));
    expect(screen.queryAllByTestId('map-marker')).toHaveLength(0);
  });

  it('does not render the map while loading', () => {
    feedState.loading = true;
    render(createElement(ProjectNodesWidget, null));
    expect(screen.queryByTestId('mapbox-map')).toBeNull();
  });

  it('renders the map when not loading', () => {
    feedState.loading = false;
    render(createElement(ProjectNodesWidget, null));
    expect(screen.getByTestId('mapbox-map')).toBeDefined();
  });

  it('clicking "View Full Map →" calls navigate with AppRoute.Map', () => {
    render(createElement(ProjectNodesWidget, null));
    fireEvent.click(screen.getByText('View Full Map →'));
    expect(mockNavigate).toHaveBeenCalledWith(AppRoute.Map);
  });

  it('does not call navigate on initial render', () => {
    render(createElement(ProjectNodesWidget, null));
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
