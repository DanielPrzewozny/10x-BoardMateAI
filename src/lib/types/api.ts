import type { SupabaseClient } from '@supabase/supabase-js';

export interface User {
  id: string;
  email: string;
  role: 'user' | 'admin';
}

export interface Locals {
  user: User | null;
  supabase: SupabaseClient;
}

export interface APIContext {
  locals: Locals;
  params: Record<string, string>;
} 