/**
 * Tests for Sidebar component
 * Covers: nav item rendering, collapsed state, active class, navigation, toggle, handleLogout, title tooltip
 *
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { createElement, type ComponentProps } from 'react';

/* ── Router mocks ──────────────────────────────────────────── */

const routerState = vi.hoisted(() => ({
  navigate: vi.fn(),
  pathname: '/pulse',
}));

vi.mock('react-router-dom', () => ({
  useNavigate: () => routerState.navigate,
  useLocation: () => ({ pathname: routerState.pathname }),
}));

/* ── Component import (after mocks) ────────────────────────── */

import { Sidebar } from './Sidebar';
import { AppRoute } from '../../constants/routes';

/* ── Helpers ───────────────────────────────────────────────── */

type SidebarProps = ComponentProps<typeof Sidebar>;

function makeSidebarProps(overrides?: Partial<SidebarProps>) {
  return {
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
    routerState.navigate.mockReset();
    routerState.pathname = AppRoute.Pulse;
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

  it('active item gets sidebar__item--active class when pathname matches', () => {
    routerState.pathname = AppRoute.Pulse;
    renderSidebar();

    const buttons = screen.getAllByRole('button');
    const activeButton = buttons.find((btn) =>
      btn.classList.contains('sidebar__item') && btn.classList.contains('sidebar__item--active'),
    );

    expect(activeButton).toBeDefined();
  });

  it('clicking a nav item calls navigate with the correct route path', () => {
    renderSidebar();

    fireEvent.click(screen.getByText('Map').closest('button')!);

    expect(routerState.navigate).toHaveBeenCalledWith(AppRoute.Map);
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
