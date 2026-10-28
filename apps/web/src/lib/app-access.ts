/**
 * Remembers in this browser that the visitor started a trial (or got free
 * access) for an app, so the app page keeps showing their downloads and
 * trial end date after a refresh. Only a convenience: the real access lives
 * on the server and in the app.
 */

export interface RememberedAccess {
  mode: "trial" | "free"
  email: string
  trialEndsAt?: string
}

const key = (appId: string) => `fmt-access:${appId}`

export function readAccess(appId: string): RememberedAccess | null {
  try {
    const raw = localStorage.getItem(key(appId))
    if (!raw) return null
    const access = JSON.parse(raw) as RememberedAccess
    // An ended trial isn't worth showing as access any more.
    if (access.trialEndsAt && new Date(access.trialEndsAt) < new Date()) return null
    return access
  } catch {
    return null
  }
}

export function rememberAccess(appId: string, access: RememberedAccess) {
  try {
    localStorage.setItem(key(appId), JSON.stringify(access))
  } catch {
    /* private mode: it just won't survive a refresh */
  }
}
