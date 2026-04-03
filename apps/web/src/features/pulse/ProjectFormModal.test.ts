/**
 * Unit tests — ProjectFormModal component
 * Covers: closed state, title variants, submit flow, overlay click, error message, location modes
 *
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { createElement } from 'react';
import React from 'react';

/* ── Mocks ─────────────────────────────────────────────────── */

vi.mock('@nexus/ui', () => ({
  Button: ({ children, onClick, type, disabled, className }: any) =>
    React.createElement('button', { onClick, type, disabled, className }, children),
}));

vi.mock('./components/ProjectFormModal.css', () => ({}));

import { ProjectFormModal } from './components/ProjectFormModal';
import type { UseProjectFormReturn } from './hooks/use-project-form';

/* ── Helpers ────────────────────────────────────────────────── */

function makeForm(overrides?: Partial<UseProjectFormReturn>): UseProjectFormReturn {
  return {
    fields: {
      title: 'My Project',
      health_status: 'on_track',
      address: '123 Main St',
      lat: null,
      lng: null,
      city: null,
      country: null,
    },
    locationMode: 'type',
    submitting: false,
    error: null,
    editingId: null,
    setField: vi.fn(),
    setLocationMode: vi.fn(),
    setMapCoordinates: vi.fn(),
    initCreate: vi.fn(),
    initEdit: vi.fn(),
    submit: vi.fn().mockResolvedValue({ id: 'proj-1', title: 'My Project' }),
    validate: vi.fn().mockReturnValue(null),
    ...overrides,
  };
}

interface RenderProps {
  open?: boolean;
  form?: UseProjectFormReturn;
  onClose?: () => void;
  onSubmitSuccess?: () => void;
}

function renderModal({ open = true, form, onClose = vi.fn(), onSubmitSuccess = vi.fn() }: RenderProps = {}) {
  const resolvedForm = form ?? makeForm();
  return {
    result: render(
      createElement(ProjectFormModal, { open, form: resolvedForm, onClose, onSubmitSuccess }),
    ),
    onClose,
    onSubmitSuccess,
    form: resolvedForm,
  };
}

/* ── Tests ──────────────────────────────────────────────────── */

describe('ProjectFormModal', () => {
  afterEach(cleanup);

  it('does not render modal content when open is false', () => {
    renderModal({ open: false });
    expect(screen.queryByText('New Project')).toBeNull();
    expect(screen.queryByText('Edit Project')).toBeNull();
  });

  it('renders "New Project" title when editingId is null', () => {
    renderModal({ form: makeForm({ editingId: null }) });
    expect(screen.getByText('New Project')).toBeDefined();
  });

  it('renders "Edit Project" title when editingId is set', () => {
    renderModal({ form: makeForm({ editingId: 'proj-abc' }) });
    expect(screen.getByText('Edit Project')).toBeDefined();
  });

  it('calls form.submit() and onSubmitSuccess when form is submitted', async () => {
    const onSubmitSuccess = vi.fn();
    const submit = vi.fn().mockResolvedValue({ id: 'proj-1' });
    const form = makeForm({ submit });

    renderModal({ form, onSubmitSuccess });

    const formEl = screen.getByRole('button', { name: /create project/i }).closest('form')!;
    await fireEvent.submit(formEl);

    // Wait for the async handleSubmit to settle
    await new Promise((r) => setTimeout(r, 0));

    expect(submit).toHaveBeenCalledOnce();
    expect(onSubmitSuccess).toHaveBeenCalledOnce();
  });

  it('does NOT call onSubmitSuccess when form.submit() rejects', async () => {
    const onSubmitSuccess = vi.fn();
    const submit = vi.fn().mockRejectedValue(new Error('Validation failed'));
    const form = makeForm({ submit });

    renderModal({ form, onSubmitSuccess });

    const formEl = screen.getByRole('button', { name: /create project/i }).closest('form')!;
    await fireEvent.submit(formEl);

    await new Promise((r) => setTimeout(r, 0));

    expect(onSubmitSuccess).not.toHaveBeenCalled();
  });

  it('calls onClose when overlay div is clicked in type mode', () => {
    const onClose = vi.fn();
    const form = makeForm({ locationMode: 'type' });

    renderModal({ form, onClose });

    // The overlay is the outermost div rendered by the AnimatePresence mock
    const overlay = document.querySelector('.project-form-overlay') as HTMLElement;
    fireEvent.click(overlay);

    expect(onClose).toHaveBeenCalledOnce();
  });

  it('does NOT call onClose when overlay is clicked in pick mode', () => {
    const onClose = vi.fn();
    const form = makeForm({ locationMode: 'pick' });

    renderModal({ form, onClose });

    const overlay = document.querySelector('.project-form-overlay') as HTMLElement;
    fireEvent.click(overlay);

    expect(onClose).not.toHaveBeenCalled();
  });

  it('shows error message when form.error is set', () => {
    const form = makeForm({ error: 'Title is required' });
    renderModal({ form });

    expect(screen.getByText('Title is required')).toBeDefined();
  });

  it('does not render error paragraph when form.error is null', () => {
    const form = makeForm({ error: null });
    renderModal({ form });

    expect(screen.queryByRole('paragraph')).toBeNull();
  });

  it('shows address input when locationMode is "type"', () => {
    const form = makeForm({ locationMode: 'type' });
    renderModal({ form });

    const addressInput = screen.getByPlaceholderText('Enter address');
    expect(addressInput).toBeDefined();
  });

  it('shows pick hint text when locationMode is "pick" and no coordinates set', () => {
    const form = makeForm({
      locationMode: 'pick',
      fields: {
        title: 'Test',
        health_status: 'on_track',
        address: '',
        lat: null,
        lng: null,
        city: null,
        country: null,
      },
    });
    renderModal({ form });

    expect(screen.getByText('Click the map to set location')).toBeDefined();
  });

  it('shows formatted coordinates in pick hint when lat/lng are set', () => {
    const form = makeForm({
      locationMode: 'pick',
      fields: {
        title: 'Test',
        health_status: 'on_track',
        address: '',
        lat: 40.7128,
        lng: -74.006,
        city: null,
        country: null,
      },
    });
    renderModal({ form });

    expect(screen.getByText('40.7128, -74.0060')).toBeDefined();
  });
});
