/**
 * Typed wrappers over the five public RPCs.
 *
 * Every one returns a discriminated `state` rather than throwing, because the
 * interesting outcomes here are not errors — "you're too far away", "already
 * clocked in", "PIN locked" are all normal things that happen to people
 * standing outside a workshop at 7am, and each needs its own screen.
 */
import { supabase } from './supabase'

export type MarkAction = 'clock_in' | 'clock_out'

/** Every state the server can hand back. Kept exhaustive so the UI can't miss one. */
export type MarkState =
  | 'success'
  | 'already_marked'
  | 'not_clocked_in'
  | 'invalid_credentials'
  | 'invalid_link'
  | 'pin_not_set'
  | 'pin_locked'
  | 'self_mark_disabled'
  | 'window_closed'
  | 'location_required'
  | 'location_accuracy_low'
  | 'outside_radius'
  | 'unexpected_error'

export interface LinkState {
  state: 'ok' | 'invalid_link'
  organization_name?: string
  employee_name?: string
  work_date?: string
  next_action?: MarkAction | 'done'
  proximity_required?: boolean
  self_marking_enabled?: boolean
  expected_start_at?: string | null
  clock_in_at?: string | null
  clock_out_at?: string | null
}

export interface MarkResult {
  state: MarkState
  action?: MarkAction
  marked_at?: string
  employee_name?: string
  location_name?: string | null
  clock_in_at?: string
  clock_out_at?: string
}

export interface OrgLookup {
  state: 'ok' | 'not_found'
  organization_id?: string
  organization_name?: string
  self_marking_enabled?: boolean
}

export interface SelfServiceDay {
  work_date: string
  clock_in_at: string | null
  clock_out_at: string | null
  status: 'on_time' | 'late' | null
  minutes_late: number | null
  worked_minutes: number | null
  location: string | null
}

export interface SelfService {
  state: 'ok' | 'invalid_link' | 'invalid_credentials' | 'pin_not_set' | 'pin_locked'
  employee?: {
    full_name: string
    position: string | null
    employee_code: string | null
    phone: string | null
    branch_name: string | null
    department_name: string | null
  }
  month?: {
    from: string
    to: string
    expected_days: number
    present_days: number
    late_days: number
    absent_days: number
    worked_minutes: number
  }
  days?: SelfServiceDay[]
}

/**
 * A network failure must not be indistinguishable from "wrong PIN". The RPCs
 * only error on transport problems — every business outcome comes back 200
 * with a state — so anything thrown here is genuinely a connection issue.
 */
function asUnexpected(label: string, error: unknown): never {
  console.error(`${label} failed`, error)
  throw new Error('We could not reach the server. Check your connection and try again.')
}

export async function getLinkState(token: string): Promise<LinkState> {
  const { data, error } = await supabase.rpc('get_attendance_link_state', { p_token: token })
  if (error) asUnexpected('get_attendance_link_state', error)
  return data as LinkState
}

export async function markAttendance(args: {
  action: MarkAction
  token?: string | null
  phone?: string | null
  orgId?: string | null
  pin: string
  lat?: number | null
  lng?: number | null
  accuracy?: number | null
}): Promise<MarkResult> {
  const { data, error } = await supabase.rpc('mark_attendance', {
    p_action: args.action,
    p_token: args.token ?? null,
    p_phone: args.phone ?? null,
    p_org_id: args.orgId ?? null,
    p_pin: args.pin,
    p_lat: args.lat ?? null,
    p_lng: args.lng ?? null,
    p_accuracy: args.accuracy ?? null,
    p_user_agent: navigator.userAgent,
  })
  if (error) asUnexpected('mark_attendance', error)
  return data as MarkResult
}

export async function setPin(token: string, pin: string): Promise<{ state: string }> {
  const { data, error } = await supabase.rpc('set_employee_pin', { p_token: token, p_pin: pin })
  if (error) asUnexpected('set_employee_pin', error)
  return data as { state: string }
}

export async function getOrgByCode(code: string): Promise<OrgLookup> {
  const { data, error } = await supabase.rpc('get_org_by_public_code', { p_code: code })
  if (error) asUnexpected('get_org_by_public_code', error)
  return data as OrgLookup
}

export async function getSelfService(args: {
  token?: string | null
  phone?: string | null
  orgId?: string | null
  pin: string
}): Promise<SelfService> {
  const { data, error } = await supabase.rpc('get_employee_self_service', {
    p_token: args.token ?? null,
    p_phone: args.phone ?? null,
    p_org_id: args.orgId ?? null,
    p_pin: args.pin,
  })
  if (error) asUnexpected('get_employee_self_service', error)
  return data as SelfService
}

// ---------------------------------------------------------------- geolocation

export interface Fix {
  lat: number
  lng: number
  accuracy: number
}

export type LocationFailure = 'denied' | 'unavailable' | 'timeout' | 'unsupported'

/**
 * The device's position. Rejected with a reason rather than a raw
 * GeolocationPositionError, because "you blocked it" and "GPS can't see the sky"
 * need different advice and only one of them is fixable by tapping again.
 */
export function getPosition(): Promise<Fix> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject('unsupported' as LocationFailure)
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        }),
      (err) => {
        if (err.code === err.PERMISSION_DENIED) reject('denied' as LocationFailure)
        else if (err.code === err.TIMEOUT) reject('timeout' as LocationFailure)
        else reject('unavailable' as LocationFailure)
      },
      { enableHighAccuracy: true, timeout: 25000, maximumAge: 0 }
    )
  })
}

/** What to tell somebody when their phone won't say where it is. */
export const LOCATION_MESSAGE: Record<LocationFailure, string> = {
  denied:
    'Location is blocked for this site. Tap the padlock in your browser address bar, allow Location, then try again.',
  unavailable: 'Your phone could not find your location. Step outside or near a window and try again.',
  timeout: 'Finding your location took too long. Make sure GPS is on, then try again.',
  unsupported: 'This phone cannot report its location, so you will need to be marked by hand.',
}
