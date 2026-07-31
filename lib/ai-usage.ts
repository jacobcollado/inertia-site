import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

// Per-million-token pricing (USD), input/output. Update here if Anthropic's
// published rates change — https://www.anthropic.com/pricing.
const MODEL_PRICING: Record<string, { input: number; output: number }> = {
  "claude-sonnet-5": { input: 2, output: 10 },
  "claude-haiku-4-5-20251001": { input: 1, output: 5 },
};

/* Logs one Claude API call's token usage and computed cost to ai_usage, for
   the admin cost dashboard. Never throws — a logging failure shouldn't take
   down the feature that made the actual API call, so errors are swallowed
   after a console.error. `feature` identifies which part of the app made
   the call (e.g. "client-auto-reply", "admin-quick-reply") so the dashboard
   can break cost down by feature, not just by model. */
export async function logAiUsage(params: {
  model: string;
  feature: string;
  inputTokens: number;
  outputTokens: number;
  clientId?: string | null;
}) {
  try {
    const pricing = MODEL_PRICING[params.model];
    const costCents = pricing
      ? ((params.inputTokens / 1_000_000) * pricing.input + (params.outputTokens / 1_000_000) * pricing.output) * 100
      : 0;

    const admin = createAdminClient();
    await admin.from("ai_usage").insert({
      model: params.model,
      feature: params.feature,
      input_tokens: params.inputTokens,
      output_tokens: params.outputTokens,
      cost_cents: costCents,
      client_id: params.clientId ?? null,
    });
  } catch (err) {
    console.error("logAiUsage failed:", err instanceof Error ? err.message : err);
  }
}
