import { toast } from 'sonner';
import { supabase } from './supabase';

export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function parseError(response: Response): Promise<string> {
  try {
    const body = await response.json();
    const message = body?.message ?? body?.error;
    return Array.isArray(message) ? message.join(', ') : (message || response.statusText);
  } catch {
    return response.statusText;
  }
}

/**
 * Calls the NestJS backend with the current Supabase access token attached.
 * A 401 means the session is gone or no longer valid — sign out and bounce to
 * the login page rather than leaving the UI in a half-authenticated state.
 */
export async function apiFetch<T>(url: string, init: RequestInit = {}): Promise<T> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;

  const headers = new Headers(init.headers);
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(url, { ...init, headers });

  if (response.status === 401) {
    await supabase.auth.signOut();
    window.location.assign('/login');
    throw new ApiError('Session expired. Please sign in again.', 401);
  }

  if (response.status === 403) {
    toast.error('This account does not have admin access.');
    throw new ApiError('Not an admin account', 403);
  }

  if (!response.ok) {
    throw new ApiError(await parseError(response), response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

/** Unauthenticated call, for pre-login endpoints such as the OTP request. */
export async function publicApiFetch<T>(url: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set('Content-Type', 'application/json');

  const response = await fetch(url, { ...init, headers });

  if (!response.ok) {
    throw new ApiError(await parseError(response), response.status);
  }

  return response.json() as Promise<T>;
}
