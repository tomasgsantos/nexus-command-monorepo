/**
 * Unit tests — CentralCommand page
 * Covers: title, system status label, ProjectNodesWidget presence
 *
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { createElement } from 'react';

/* ── Mocks ──────────────────────────────────────────────────── */

vi.mock('framer-motion', () => ({
  motion: {
    header: (props: { children?: unknown }) =>
      createElement('header', {}, props.children as never),
    div: (props: { children?: unknown }) =>
      createElement('div', {}, props.children as never),
  },
}));

vi.mock('../pulse/components/PulseIndicator', () => ({
  PulseIndicator: () => createElement('span', { 'data-testid': 'pulse-indicator' }),
}));

vi.mock('../pulse/components/ProjectNodesWidget', () => ({
  ProjectNodesWidget: () => createElement('div', { 'data-testid': 'project-nodes-widget' }),
}));

vi.mock('./CentralCommand.css', () => ({}));

/* ── Component import (after mocks) ─────────────────────────── */

import CentralCommand from './CentralCommand';
import { mockUser } from '../auth/__mocks__/user';

/* ── Tests ──────────────────────────────────────────────────── */

describe('CentralCommand', () => {
  afterEach(cleanup);

  it('renders the "Central Command" title', () => {
    render(createElement(CentralCommand, { user: mockUser() }));
    expect(screen.getByText('Central Command')).toBeDefined();
  });

  it('renders the system status label', () => {
    render(createElement(CentralCommand, { user: mockUser() }));
    expect(screen.getByText('System Status: OK')).toBeDefined();
  });

  it('renders the PulseIndicator', () => {
    render(createElement(CentralCommand, { user: mockUser() }));
    expect(screen.getByTestId('pulse-indicator')).toBeDefined();
  });

  it('renders the ProjectNodesWidget', () => {
    render(createElement(CentralCommand, { user: mockUser() }));
    expect(screen.getByTestId('project-nodes-widget')).toBeDefined();
  });
});
