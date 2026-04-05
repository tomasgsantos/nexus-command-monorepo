import { supabase } from '../supabase-client';
import type { AuthUser } from '../types/User';
import { DEMO_EMAIL, DEMO_PASSWORD } from './demo-config';

export async function signIn(email: string, password: string): Promise<AuthUser> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  if (!data.user) throw new Error('No user returned from auth');

  return fetchAuthUser(data.user.id, data.user.email ?? '');
}

export async function signInDemo(): Promise<AuthUser> {
  return signIn(DEMO_EMAIL, DEMO_PASSWORD);
}

export async function seedDemoEvents(): Promise<void> {
  const { error } = await supabase.rpc('seed_demo_events');
  if (error) throw new Error(`seedDemoEvents failed: ${error.message}`);
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getSession(): Promise<AuthUser | null> {
  const { data } = await supabase.auth.getSession();
  if (!data.session?.user) return null;
  return fetchAuthUser(data.session.user.id, data.session.user.email ?? '');
}

async function fetchAuthUser(userId: string, email: string): Promise<AuthUser> {
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;
  if (!profile) throw new Error('Profile not found');

  return { id: userId, email, profile };
}
