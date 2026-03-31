/**
 * Tests for Sidebar component
 * Covers: nav item rendering, collapsed state, active class, onNavigate, onToggle, handleLogout, title tooltip
 *
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { createElement } from 'react';
import React from 'react';

/* ── Mocks ─────────────────────────────────────────────────── */

vi.mock('framer-motion', () => ({
  motion: {
    nav: ({ children, ...props }: React.ComponentPropsWithoutRef<'nav'>) =>
      React.createElement('nav', props, children),
    span: ({ children, ...props }: React.ComponentPropsWithoutRef<'span'>) =>
      React.createElement('span', props, children),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
}));

import { Sidebar } from './Sidebar';
import type { NavPage } from './Sidebar';

/* ── Helpers ───────────────────────────────────────────────── */

interface SidebarProps {
  activePage?: NavPage;
  onNavigate?: (page: NavPage) => void;
  collapsed?: boolean;
  onToggle?: () => void;
  handleLogout?: () => void;
}

function makeSidebarProps(overrides?: SidebarProps) {
  return {
    activePage: 'pulse' as NavPage,
    onNavigate: vi.fn(),
    collapsed: false,
    onToggle: vi.fn(),
    handleLogout: vi.fn(),
    ...overrides,
  };
}

function renderSidebar(overrides?: SidebarProps) {
  const props = makeSidebarProps(overrides);
  const result = render(createElement(Sidebar, props));
  return { ...result, props };
}

/* ── Tests ─────────────────────────────────────────────────── */

describe('Sidebar', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders nav items "The Pulse" and "Map" when expanded', () => {
    renderSidebar({ collapsed: false });

    expect(screen.getByText('The Pulse')).toBeDefined();
    expect(screen.getByText('Map')).toBeDefined();
  });

  it('does not render item labels when collapsed is true', () => {
    renderSidebar({ collapsed: true });

    expect(screen.queryByText('The Pulse')).toBeNull();
    expect(screen.queryByText('Map')).toBeNull();
  });

  it('active item gets sidebar__item--active class', () => {
    renderSidebar({ activePage: 'pulse', collapsed: false });

    const buttons = screen.getAllByRole('button');
    const pulseButton = buttons.find((btn) =>
      btn.classList.contains('sidebar__item') && btn.classList.contains('sidebar__item--active'),
    );

    expect(pulseButton).toBeDefined();
  });

  it('clicking a nav item calls onNavigate with the correct page id', () => {
    const onNavigate = vi.fn();
    renderSidebar({ collapsed: false, onNavigate, activePage: 'pulse' });

    // Click the "Map" item button (contains Map icon, no label text in collapsed mode, but expanded here)
    fireEvent.click(screen.getByText('Map').closest('button')!);

    expect(onNavigate).toHaveBeenCalledWith('map');
  });

  it('clicking the toggle button calls onToggle', () => {
    const onToggle = vi.fn();
    renderSidebar({ onToggle });

    const toggleButton = screen.getByTitle('Collapse');
    fireEvent.click(toggleButton);

    expect(onToggle).toHaveBeenCalledOnce();
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
    renderSidebar({ collapsed: true });

    const buttons = screen.getAllByRole('button');
    const navButtons = buttons.filter((btn) => btn.classList.contains('sidebar__item'));

    const titles = navButtons.map((btn) => btn.getAttribute('title'));
    expect(titles).toContain('The Pulse');
    expect(titles).toContain('Map');
  });

  it('does not set title attribute on items when expanded', () => {
    renderSidebar({ collapsed: false });

    const buttons = screen.getAllByRole('button');
    const navButtons = buttons.filter((btn) => btn.classList.contains('sidebar__item'));

    navButtons.forEach((btn) => {
      expect(btn.getAttribute('title')).toBeNull();
    });
  });
});
