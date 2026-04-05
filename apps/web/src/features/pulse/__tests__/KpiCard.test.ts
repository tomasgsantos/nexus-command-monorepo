/**
 * Unit tests — KpiCard component
 * Covers: renders label and value, renders secondary when provided, omits secondary when absent
 *
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { createElement } from 'react';

/* ── Mocks ─────────────────────────────────────────────────── */

vi.mock('../components/KpiCard.css', () => ({}));

import { KpiCard } from '../components/KpiCard';

/* ── Helpers ────────────────────────────────────────────────── */

interface KpiCardProps {
  label?: string;
  value?: string | number;
  secondary?: string;
  index?: number;
}

function makeKpiCardProps(overrides?: KpiCardProps) {
  return {
    label: 'Active Projects',
    value: 42,
    ...overrides,
  };
}

function renderKpiCard(overrides?: KpiCardProps) {
  const props = makeKpiCardProps(overrides);
  return render(createElement(KpiCard, props));
}

/* ── Tests ──────────────────────────────────────────────────── */

describe('KpiCard', () => {
  afterEach(cleanup);

  it('renders the label text', () => {
    renderKpiCard({ label: 'Revenue' });
    expect(screen.getByText('Revenue')).toBeDefined();
  });

  it('renders the numeric value', () => {
    renderKpiCard({ value: 99 });
    expect(screen.getByText('99')).toBeDefined();
  });

  it('renders a string value', () => {
    renderKpiCard({ value: '$1.2M' });
    expect(screen.getByText('$1.2M')).toBeDefined();
  });

  it('renders the secondary text when provided', () => {
    renderKpiCard({ secondary: '+5% this week' });
    expect(screen.getByText('+5% this week')).toBeDefined();
  });

  it('does not render secondary element when secondary is not provided', () => {
    renderKpiCard({ secondary: undefined });
    expect(screen.queryByText('+5% this week')).toBeNull();
  });

  it('renders both label and value together', () => {
    renderKpiCard({ label: 'Budget', value: '$500K' });
    expect(screen.getByText('Budget')).toBeDefined();
    expect(screen.getByText('$500K')).toBeDefined();
  });
});
