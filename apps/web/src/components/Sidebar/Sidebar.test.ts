/**
 * Tests for Sidebar component
 * Covers: nav item rendering, collapsed state, active class, onNavigate, toggle, handleLogout, title tooltip
 *
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { createElement, type ComponentProps } from 'react';

/* ── Mocks ─────────────────────────────────────────────────── */

import { Sidebar } from './Sidebar';
import type { NavPage } from './Sidebar';

/* ── Helpers ───────────────────────────────────────────────── */

type SidebarProps = ComponentProps<typeof Sidebar>;

function makeSidebarProps(overrides?: Partial<SidebarProps>) {
  return {
    activePage: 'pulse' as NavPage,
    onNavigate: vi.fn(),
    handleLogout: vi.fn(),
    ...overrides,
  };
}

function renderSidebar(overrides?: Partial<SidebarProps>) {
  const props = makeSidebarProps(overrides);
  const result = render(createElement(Sidebar, props));
  return { ...result, props };
}

function collapseViaToggle() {
  fireEvent.click(screen.getByTitle('Collapse'));
}

/* ── Tests ─────────────────────────────────────────────────── */

describe('Sidebar', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders nav items "The Pulse" and "Map" when expanded', () => {
    renderSidebar();

    expect(screen.getByText('The Pulse')).toBeDefined();
    expect(screen.getByText('Map')).toBeDefined();
  });

  it('does not render item labels when collapsed', () => {
    renderSidebar();
    collapseViaToggle();

    expect(screen.queryByText('The Pulse')).toBeNull();
    expect(screen.queryByText('Map')).toBeNull();
  });

  it('active item gets sidebar__item--active class', () => {
    renderSidebar({ activePage: 'pulse' });

    const buttons = screen.getAllByRole('button');
    const pulseButton = buttons.find((btn) =>
      btn.classList.contains('sidebar__item') && btn.classList.contains('sidebar__item--active'),
    );

    expect(pulseButton).toBeDefined();
  });

  it('clicking a nav item calls onNavigate with the correct page id', () => {
    const onNavigate = vi.fn();
    renderSidebar({ onNavigate, activePage: 'pulse' });

    fireEvent.click(screen.getByText('Map').closest('button')!);

    expect(onNavigate).toHaveBeenCalledWith('map');
  });

  it('clicking the toggle button collapses the sidebar (title changes to Expand)', () => {
    renderSidebar();

    expect(screen.getByTitle('Collapse')).toBeDefined();
    fireEvent.click(screen.getByTitle('Collapse'));
    expect(screen.getByTitle('Expand')).toBeDefined();
  });

  it('renders the "Sign out" button and calls handleLogout when clicked', () => {
    const handleLogout = vi.fn();
    renderSidebar({ handleLogout });

    const signOutButton = screen.getByText('Sign out');
    expect(signOutButton).toBeDefined();

    fireEvent.click(signOutButton);
    expect(handleLogout).toHaveBeenCalledOnce();
  });

  it('sets title attribute on items when collapsed (for tooltip)', () => {
    renderSidebar();
    collapseViaToggle();

    const buttons = screen.getAllByRole('button');
    const navButtons = buttons.filter((btn) => btn.classList.contains('sidebar__item'));

    const titles = navButtons.map((btn) => btn.getAttribute('title'));
    expect(titles).toContain('The Pulse');
    expect(titles).toContain('Map');
  });

  it('does not set title attribute on items when expanded', () => {
    renderSidebar();

    const buttons = screen.getAllByRole('button');
    const navButtons = buttons.filter((btn) => btn.classList.contains('sidebar__item'));

    navButtons.forEach((btn) => {
      expect(btn.getAttribute('title')).toBeNull();
    });
  });
});
