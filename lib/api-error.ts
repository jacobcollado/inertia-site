// One shape for every error the API returns, so a person or an agent can tell
// what went wrong and what to do about it without reading the code:
//
//   { "error": "Invalid email", "code": "invalid_email",
//     "message": "Invalid email", "resolution": "Send a valid email address." }
//
// `error` repeats `message` for the site's own forms, which already read it.
// Documented as the Error schema in /openapi.json.

export type ApiErrorBody = {
  error: string;
  code: string;
  message: string;
  resolution: string;
};

export function apiErrorBody(code: string, message: string, resolution: string): ApiErrorBody {
  return { error: message, code, message, resolution };
}

/** A JSON error response. `extra` adds fields a route already returned, such
 * as `valid: false` on the license endpoints. */
export function apiError(
  status: number,
  code: string,
  message: string,
  resolution: string,
  init: { headers?: HeadersInit; extra?: Record<string, unknown> } = {},
): Response {
  return Response.json({ ...init.extra, ...apiErrorBody(code, message, resolution) }, { status, headers: init.headers });
}

// The errors more than one route shares.
export const TOO_MANY_REQUESTS = ["rate_limited", "Too many requests", "Wait a minute, then try again."] as const;
export const INVALID_JSON = ["invalid_json", "Bad request", "Send a JSON body with Content-Type: application/json."] as const;
export const SERVER_ERROR = ["server_error", "Server error", "Try again shortly. If it keeps failing, email hello@byinertia.com."] as const;
