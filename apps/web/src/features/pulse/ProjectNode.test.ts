/**
 * Unit tests — ProjectNode component
 * Covers: renders project title, calls onClick with the project when clicked
 *
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { createElement } from 'react';

/* ── Mocks ─────────────────────────────────────────────────── */

vi.mock('./components/PulseIndicator', () => ({
  PulseIndicator: () => createElement('span', { 'data-testid': 'pulse-indicator' }),
}));

vi.mock('./components/ProjectNode.css', () => ({}));

import { ProjectNode } from './components/ProjectNode';
import type { Project } from '@nexus/api';

/* ── Helpers ────────────────────────────────────────────────── */

function makeProject(overrides?: Partial<Project>): Project {
  return {
    id: 'proj-1',
    title: 'Alpha Initiative',
    health_status: 'on_track',
    lat: 40.71,
    lng: -74.0,
    owner_id: 'user-1',
    city: 'New York',
    country: 'United States',
    ...overrides,
  };
}

function renderProjectNode(overrides?: Partial<Project>, onClick = vi.fn()) {
  const project = makeProject(overrides);
  const result = render(createElement(ProjectNode, { project, onClick }));
  return { ...result, project, onClick };
}

/* ── Tests ──────────────────────────────────────────────────── */

describe('ProjectNode', () => {
  afterEach(cleanup);

  it('renders the project title', () => {
    renderProjectNode({ title: 'Alpha Initiative' });
    expect(screen.getByText('Alpha Initiative')).toBeDefined();
  });

  it('calls onClick with the full project object when the button is clicked', () => {
    const onClick = vi.fn();
    const { project } = renderProjectNode({}, onClick);

    fireEvent.click(screen.getByRole('button'));

    expect(onClick).toHaveBeenCalledOnce();
    expect(onClick).toHaveBeenCalledWith(project);
  });

  it('applies health-status class to the button', () => {
    renderProjectNode({ health_status: 'at_risk' });

    const button = screen.getByRole('button');
    expect(button.classList.contains('project-node--at_risk')).toBe(true);
  });

  it('does not call onClick when not clicked', () => {
    const onClick = vi.fn();
    renderProjectNode({}, onClick);

    expect(onClick).not.toHaveBeenCalled();
  });
});
