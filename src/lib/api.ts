// Thin client for the PHP API in public/api/. The path is relative so the site keeps
// working when installed in a subfolder (HashRouter keeps the document URL fixed).
const BASE = 'api/'

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
  }
}

export async function api<T = unknown>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(BASE + path, {
    method: body === undefined ? 'GET' : 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
      // Required by the API for every write; a cross-site form can't set it.
      'X-Requested-With': 'evocati',
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  let data: unknown = null
  try {
    data = await res.json()
  } catch {
    // Non-JSON response (e.g. PHP not running) — handled below.
  }
  if (!res.ok || data === null) {
    const msg = (data as { error?: string } | null)?.error ?? `Eroare server (${res.status})`
    throw new ApiError(res.status, msg)
  }
  return data as T
}
