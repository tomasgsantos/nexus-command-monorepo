/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { createElement } from 'react';

vi.mock('../MobileNav.css', () => ({}));
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...rest }: React.HTMLAttributes<HTMLDivElement> & { children?: React.ReactNode }) =>
      createElement('div', rest, children),
  },
  AnimatePresence: ({ children }: { children?: React.ReactNode }) => children,
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useLocation: () => ({ pathname: '/pulse' }),
}));

const sidebarState = vi.hoisted(() => ({ collapsed: true, toggle: vi.fn() }));
vi.mock('../use-sidebar', () => ({ useSidebar: () => sidebarState }));

vi.mock('../../../assets/icons/map.svg?react', () => ({ default: () => createElement('span', {}, 'MapIcon') }));
vi.mock('../../../assets/icons/pulse.svg?react', () => ({ default: () => createElement('span', {}, 'PulseIcon') }));
vi.mock('../../../assets/icons/arrow.svg?react', () => ({ default: () => createElement('span', {}, 'ArrowIcon') }));
vi.mock('../../../assets/icons/calendar.svg?react', () => ({ default: () => createElement('span', {}, 'CalendarIcon') }));
vi.mock('../../../assets/icons/logout.svg?react', () => ({ default: () => createElement('span', {}, 'LogoutIcon') }));

import { MobileNav } from '../MobileNav';

function makeProps(overrides?: Partial<Parameters<typeof MobileNav>[0]>) {
  return { handleLogout: vi.fn(), ...overrides };
}

beforeEach(() => {
  vi.clearAllMocks();
  sidebarState.collapsed = true;
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockReturnValue({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }),
  });
});

afterEach(cleanup);

describe('MobileNav', () => {
  it('renders the Nexus logo mark', () => {
    render(createElement(MobileNav, makeProps()));
    expect(screen.getAllByText('N').length).toBeGreaterThan(0);
  });

  it('renders nav icon buttons for Pulse, Map, and Scheduler', () => {
    render(createElement(MobileNav, makeProps()));
    expect(screen.getByTitle('The Pulse')).toBeDefined();
    expect(screen.getByTitle('Map')).toBeDefined();
    expect(screen.getByTitle('Scheduler')).toBeDefined();
  });

  it('clicking a nav button calls navigate with the correct route', () => {
    render(createElement(MobileNav, makeProps()));
    fireEvent.click(screen.getByTitle('Map'));
    expect(mockNavigate).toHaveBeenCalledWith('/map');
  });

  it('clicking the menu toggle button calls sidebar toggle', () => {
    render(createElement(MobileNav, makeProps()));
    fireEvent.click(screen.getByTitle('Open menu'));
    expect(sidebarState.toggle).toHaveBeenCalledOnce();
  });

  it('does not render the overlay when sidebar is collapsed', () => {
    sidebarState.collapsed = true;
    render(createElement(MobileNav, makeProps()));
    expect(screen.queryByText('Sign out')).toBeNull();
  });

  it('renders the overlay with sign out button when sidebar is not collapsed', () => {
    sidebarState.collapsed = false;
    render(createElement(MobileNav, makeProps()));
    expect(screen.getByText('Sign out')).toBeDefined();
  });

  it('calls handleLogout when sign out is clicked in the overlay', () => {
    sidebarState.collapsed = false;
    const handleLogout = vi.fn();
    render(createElement(MobileNav, makeProps({ handleLogout })));
    fireEvent.click(screen.getByText('Sign out'));
    expect(handleLogout).toHaveBeenCalledOnce();
  });

  it('clicking a nav button collapses the overlay when sidebar is open', () => {
    sidebarState.collapsed = false;
    render(createElement(MobileNav, makeProps()));
    fireEvent.click(screen.getByTitle('Map'));
    expect(sidebarState.toggle).toHaveBeenCalledOnce();
  });

  it('does not call toggle when navigating and sidebar is already collapsed', () => {
    sidebarState.collapsed = true;
    render(createElement(MobileNav, makeProps()));
    fireEvent.click(screen.getByTitle('Map'));
    expect(sidebarState.toggle).not.toHaveBeenCalled();
  });
});
