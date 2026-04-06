/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { createElement } from 'react';

vi.mock('../components/PulseIndicator.css', () => ({}));

import { PulseIndicator } from '../components/PulseIndicator';

afterEach(cleanup);

describe('PulseIndicator', () => {
  it('renders with aria-label "Live" when active', () => {
    render(createElement(PulseIndicator, { active: true }));
    expect(screen.getByLabelText('Live')).toBeDefined();
  });

  it('renders with aria-label "Inactive" when not active', () => {
    render(createElement(PulseIndicator, { active: false }));
    expect(screen.getByLabelText('Inactive')).toBeDefined();
  });

  it('defaults to active when no prop is passed', () => {
    render(createElement(PulseIndicator, {}));
    expect(screen.getByLabelText('Live')).toBeDefined();
  });

  it('applies the active modifier class when active', () => {
    const { container } = render(createElement(PulseIndicator, { active: true }));
    const el = container.firstChild as HTMLElement;
    expect(el.classList.contains('pulse-indicator--active')).toBe(true);
  });

  it('does not apply the active modifier class when inactive', () => {
    const { container } = render(createElement(PulseIndicator, { active: false }));
    const el = container.firstChild as HTMLElement;
    expect(el.classList.contains('pulse-indicator--active')).toBe(false);
  });
});
