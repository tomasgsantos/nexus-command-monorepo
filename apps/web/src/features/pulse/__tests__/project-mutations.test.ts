/**
 * Tests for project-mutations (backend layer)
 * Covers: createProject, updateProject, deleteProject Supabase calls and error handling
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

import {
  mockFrom,
  mockInsert,
  mockUpdate,
  mockDeleteFn,
  mockEq,
  mockSingle,
  resetMutationChain,
} from '../__mocks__/supabase-mutations';

const { mockGetUser } = vi.hoisted(() => ({ mockGetUser: vi.fn() }));

vi.mock('../../../../../../apps/api/src/supabase-client', () => ({
  supabase: { from: mockFrom, auth: { getUser: mockGetUser } },
}));

import { createProject, updateProject, deleteProject } from '@nexus/api';
import { makeProject, makeCreateInput, makeUpdateInput } from '../__mocks__/project-factories';


describe('project-mutations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetMutationChain();
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null });
  });


  describe('createProject', () => {
    it('inserts data and returns the created project', async () => {
      const created = makeProject({ id: 'new-1' });
      mockSingle.mockReturnValue({ data: created, error: null });

      const result = await createProject(makeCreateInput());

      expect(mockFrom).toHaveBeenCalledWith('projects');
      expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({ title: 'New Project' }));
      expect(result).toEqual(created);
    });

    it('throws when supabase returns an error', async () => {
      mockSingle.mockReturnValue({
        data: null,
        error: { message: 'RLS violation' },
      });

      await expect(createProject(makeCreateInput())).rejects.toThrow('createProject failed: RLS violation');
    });
  });


  describe('updateProject', () => {
    it('updates data by id and returns the updated project', async () => {
      const updated = makeProject({ id: 'proj-5', title: 'Updated' });
      mockSingle.mockReturnValue({ data: updated, error: null });

      const result = await updateProject('proj-5', makeUpdateInput());

      expect(mockFrom).toHaveBeenCalledWith('projects');
      expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({ title: 'Updated Title' }));
      expect(mockEq).toHaveBeenCalledWith('id', 'proj-5');
      expect(result).toEqual(updated);
    });

    it('throws when supabase returns an error', async () => {
      mockSingle.mockReturnValue({
        data: null,
        error: { message: 'Not found' },
      });

      await expect(updateProject('bad-id', makeUpdateInput())).rejects.toThrow('updateProject failed: Not found');
    });
  });


  describe('deleteProject', () => {
    it('deletes by id and returns void', async () => {
      mockEq.mockReturnValue({ error: null });

      await expect(deleteProject('proj-1')).resolves.toBeUndefined();

      expect(mockFrom).toHaveBeenCalledWith('projects');
      expect(mockDeleteFn).toHaveBeenCalled();
      expect(mockEq).toHaveBeenCalledWith('id', 'proj-1');
    });

    it('throws when supabase returns an error', async () => {
      mockEq.mockReturnValue({ error: { message: 'FK constraint' } });

      await expect(deleteProject('proj-1')).rejects.toThrow('deleteProject failed: FK constraint');
    });
  });
});
