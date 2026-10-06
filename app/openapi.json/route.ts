// OpenAPI 3.1 description of the site's public API, for agents and tools.
// Covers the endpoints a visitor or an Aether store calls; internal ones
// (the Stripe webhook, the cron job, the dev tools, the auth proxy) are left
// out. Update it alongside any change to these routes.
export const dynamic = "force-static";

const json = (schema: object) => ({ "application/json": { schema } });

const error = (description: string) => ({
  description,
  content: json({ $ref: "#/components/schemas/Error" }),
});

const ok = { type: "object", properties: { ok: { type: "boolean", const: true } }, required: ["ok"] };

const licenseBody = {
  required: true,
  content: json({
    type: "object",
    properties: {
      key: { type: "string", description: "The license key from the purchase email or dashboard." },
      domain: { type: "string", description: "The Shopify store's domain." },
    },
    required: ["key", "domain"],
  }),
};

const spec = {
  openapi: "3.1.0",
  info: {
    title: "Inertia API",
    version: "1.0.0",
    description:
      "The public API behind byinertia.com: the contact and project enquiry forms, Aether checkout and license checks, and the site's content index. Request bodies are JSON, and every error is JSON in the Error shape.",
    contact: { name: "Inertia", email: "hello@byinertia.com", url: "https://byinertia.com" },
  },
  servers: [{ url: "https://byinertia.com" }],
  externalDocs: { description: "llms.txt, the site as Markdown", url: "https://byinertia.com/llms.txt" },
  paths: {
    "/api/content": {
      get: {
        operationId: "getContent",
        summary: "List the blog posts and case studies",
        responses: {
          "200": {
            description: "Every post and case study.",
            content: json({
              type: "object",
              properties: {
                posts: { type: "array", items: { type: "object", additionalProperties: true } },
                work: { type: "array", items: { type: "object", additionalProperties: true } },
              },
              required: ["posts", "work"],
            }),
          },
        },
      },
    },
    "/api/contact": {
      post: {
        operationId: "sendContactMessage",
        summary: "Send a message to the studio",
        description: "Rate limited to 5 requests a minute per IP.",
        requestBody: {
          required: true,
          content: json({
            type: "object",
            properties: {
              name: { type: "string" },
              email: { type: "string", format: "email" },
              message: { type: "string", maxLength: 5000 },
              subject: { type: "string" },
              kind: { type: "string", description: "What the message is about." },
            },
            required: ["name", "email", "message"],
          }),
        },
        responses: {
          "200": { description: "Sent.", content: json(ok) },
          "400": error("A field is missing or invalid (missing_fields, invalid_email, message_too_long, invalid_json)."),
          "429": error("Too many requests from this IP (rate_limited)."),
          "502": error("The message couldn't be delivered (send_failed)."),
        },
      },
    },
    "/api/inquiry": {
      post: {
        operationId: "sendProjectInquiry",
        summary: "Start a project enquiry",
        description: "The homepage's Working on something? form. Rate limited to 5 requests a minute per IP.",
        requestBody: {
          required: true,
          content: json({
            type: "object",
            properties: {
              name: { type: "string" },
              email: { type: "string", format: "email" },
              referral_source: { type: "string", maxLength: 2000 },
              role: { type: "string", maxLength: 2000 },
              company_stage: { type: "string" },
              website: { type: "string", maxLength: 2000 },
              goals: { type: "string", maxLength: 2000 },
              readiness: { type: "string" },
              descriptor: { type: "string" },
              quiz_answers: { type: "object", additionalProperties: { type: "string" } },
            },
            required: ["name", "email"],
          }),
        },
        responses: {
          "200": { description: "Received.", content: json(ok) },
          "400": error("A field is missing or invalid (missing_fields, invalid_email, answer_too_long, invalid_json)."),
          "429": error("Too many requests from this IP (rate_limited)."),
        },
      },
    },
    "/api/create-checkout": {
      post: {
        operationId: "createCheckout",
        summary: "Start an Aether checkout",
        description: "Returns a Stripe Checkout URL to send the buyer to.",
        requestBody: {
          required: true,
          content: json({
            type: "object",
            properties: {
              tier: { type: "string", enum: ["standard", "lifetime"] },
              smsSetup: { type: "boolean", description: "Add SMS setup (lifetime tier only)." },
            },
            required: ["tier"],
          }),
        },
        responses: {
          "200": {
            description: "The checkout session was created.",
            content: json({ type: "object", properties: { url: { type: "string", format: "uri" } }, required: ["url"] }),
          },
          "400": error("The tier isn't one of the options (invalid_tier), or the body isn't JSON."),
          "500": error("Checkout couldn't start (price_not_configured, checkout_failed)."),
        },
      },
    },
    "/api/claim-purchase": {
      post: {
        operationId: "claimPurchase",
        summary: "Set up the dashboard account for a completed purchase",
        description: "Takes the Stripe Checkout session id from the success URL and emails the buyer a link to set a password.",
        requestBody: {
          required: true,
          content: json({ type: "object", properties: { session_id: { type: "string" } }, required: ["session_id"] }),
        },
        responses: {
          "200": {
            description: "The account exists, or the setup email went out.",
            content: json({
              type: "object",
              properties: {
                state: { type: "string", enum: ["invite_sent", "already_claimed"] },
                email: { type: "string", format: "email" },
              },
              required: ["state"],
            }),
          },
          "400": error("No session_id (missing_session_id)."),
          "402": {
            description: "The session isn't paid.",
            content: json({ type: "object", properties: { state: { type: "string", const: "unpaid" } }, required: ["state"] }),
          },
          "404": error("Stripe doesn't know the session (unknown_session)."),
          "409": error("The session has no email (no_email), or no license yet (a body of state: no_license)."),
          "500": error("The account or email failed (account_failed, email_failed, server_error)."),
        },
      },
    },
    "/api/validate-license": {
      post: {
        operationId: "validateLicense",
        summary: "Check an Aether license",
        description: "Called by Aether stores. Read only: it doesn't assign the domain.",
        requestBody: licenseBody,
        responses: {
          "200": {
            description: "The verdict. When valid is false, status says why (not_found, domain_mismatch, or the license's status).",
            content: json({
              type: "object",
              properties: { valid: { type: "boolean" }, status: { type: "string" } },
              required: ["valid"],
            }),
          },
          "400": error("key or domain is missing (missing_fields). Also carries valid: false."),
          "500": error("Server error (server_error). Also carries valid: false."),
        },
      },
    },
    "/api/activate-license": {
      post: {
        operationId: "activateLicense",
        summary: "Activate an Aether license on a store",
        description: "Called by Aether stores. Assigns the license to the domain on first use.",
        requestBody: licenseBody,
        responses: {
          "200": {
            description:
              "valid: true when the license is active on this domain. Otherwise valid: false with an Error (license_not_found, domain_mismatch, license_<status>).",
            content: json({
              oneOf: [
                { type: "object", properties: { valid: { type: "boolean", const: true } }, required: ["valid"] },
                {
                  allOf: [
                    { $ref: "#/components/schemas/Error" },
                    { type: "object", properties: { valid: { type: "boolean", const: false } }, required: ["valid"] },
                  ],
                },
              ],
            }),
          },
          "400": error("key or domain is missing (missing_fields). Also carries valid: false."),
          "500": error("The domain couldn't be saved (assign_failed, server_error). Also carries valid: false."),
        },
      },
    },
  },
  components: {
    schemas: {
      Error: {
        type: "object",
        description: "The shape of every API error. Unknown /api paths answer 404 with code not_found.",
        properties: {
          code: { type: "string", description: "Stable, machine-readable error code.", examples: ["invalid_email"] },
          message: { type: "string", description: "What went wrong, in plain words." },
          resolution: { type: "string", description: "What to do about it." },
          error: { type: "string", description: "Same as message, kept for older clients." },
        },
        required: ["code", "message", "resolution", "error"],
      },
    },
  },
};

export function GET() {
  return Response.json(spec, {
    headers: { "Cache-Control": "public, max-age=0, s-maxage=86400, stale-while-revalidate=86400" },
  });
}
