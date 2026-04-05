/**
 * Tests for ProjectPanel component
 * Covers: admin role gating, delete confirmation flow, deleteProject invocation
 *
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { createElement } from 'react';

/* ── Mocks ─────────────────────────────────────────────────── */

const mockDeleteProject = vi.fn();

vi.mock('@nexus/api', () => ({
  deleteProject: (...args: unknown[]) => mockDeleteProject(...args),
}));

import { ProjectPanel } from '../components/ProjectPanel';
import { makeProjectWithOwner } from '../__mocks__/project-factories';
import type { UserRole } from '@nexus/api';

/* ── Helpers ───────────────────────────────────────────────── */

function renderPanel(role: UserRole | null = 'admin') {
  const project = makeProjectWithOwner();
  const onClose = vi.fn();
  const onEdit = vi.fn();
  const onDeleted = vi.fn();

  const result = render(
    createElement(ProjectPanel, {
      project,
      userRole: role,
      onClose,
      onEdit,
      onDeleted,
    }),
  );

  return { ...result, project, onClose, onEdit, onDeleted };
}

/* ── Tests ─────────────────────────────────────────────────── */

describe('ProjectPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDeleteProject.mockResolvedValue(undefined);
  });

  afterEach(() => {
    cleanup();
  });

  // ── Admin sees Edit and Delete buttons ──────────────────

  it('renders Edit and Delete buttons for admin role', () => {
    renderPanel('admin');

    expect(screen.getByText('Edit')).toBeDefined();
    expect(screen.getByText('Delete')).toBeDefined();
  });

  // ── Non-admin roles do NOT see Edit/Delete ──────────────

  it.each<UserRole>(['consultant', 'viewer', 'demo'])(
    'does not render Edit/Delete for %s role',
    (role) => {
      renderPanel(role);

      expect(screen.queryByText('Edit')).toBeNull();
      expect(screen.queryByText('Delete')).toBeNull();
    },
  );

  it('does not render Edit/Delete when userRole is null', () => {
    renderPanel(null);

    expect(screen.queryByText('Edit')).toBeNull();
    expect(screen.queryByText('Delete')).toBeNull();
  });

  // ── Edit button triggers onEdit callback ────────────────

  it('calls onEdit with the project when Edit is clicked', () => {
    const { project, onEdit } = renderPanel('admin');

    fireEvent.click(screen.getByText('Edit'));

    expect(onEdit).toHaveBeenCalledWith(project);
  });

  // ── Delete requires confirmation step ───────────────────

  it('shows "Confirm Delete" on first click, does not call deleteProject', () => {
    renderPanel('admin');

    fireEvent.click(screen.getByText('Delete'));

    expect(screen.getByText('Confirm Delete')).toBeDefined();
    expect(mockDeleteProject).not.toHaveBeenCalled();
  });

  // ── Second click actually deletes ───────────────────────

  it('calls deleteProject and onDeleted on confirmation click', async () => {
    const { onDeleted } = renderPanel('admin');

    // First click — enters confirmation
    fireEvent.click(screen.getByText('Delete'));
    // Second click — confirms
    fireEvent.click(screen.getByText('Confirm Delete'));

    await waitFor(() => {
      expect(mockDeleteProject).toHaveBeenCalledWith('proj-1');
      expect(onDeleted).toHaveBeenCalledOnce();
    });
  });

  // ── Renders project details ─────────────────────────────

  it('displays the project title and owner name', () => {
    renderPanel('admin');

    expect(screen.getByText('Alpha Initiative')).toBeDefined();
    expect(screen.getByText('Alice')).toBeDefined();
  });

  // ── Close button calls onClose ──────────────────────────

  it('calls onClose when the close button is clicked', () => {
    const { onClose } = renderPanel('admin');

    // &times; renders as the multiplication sign ×
    fireEvent.click(screen.getByText('\u00D7'));

    expect(onClose).toHaveBeenCalledOnce();
  });
});
