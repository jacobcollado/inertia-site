import { apiError } from "@/lib/api-error";

// Any /api path without a route of its own: a JSON 404 in the API's error
// shape instead of the HTML not-found page, pointing at the spec.
function notFound(req: Request) {
  const { pathname } = new URL(req.url);
  return apiError(
    404,
    "not_found",
    `No API endpoint at ${pathname}`,
    "See https://byinertia.com/openapi.json for the endpoints this API has.",
  );
}

export const GET = notFound;
export const POST = notFound;
export const PUT = notFound;
export const PATCH = notFound;
export const DELETE = notFound;
