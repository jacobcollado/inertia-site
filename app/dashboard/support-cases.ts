import type { Case, Message } from "./types";

/** Last sender per case — pass messages ordered by created_at ascending. */
export function getLastSenderByCase(messages: Pick<Message, "case_id" | "sender">[]) {
  const map = new Map<string, Message["sender"]>();
  for (const m of messages) {
    if (m.case_id) map.set(m.case_id, m.sender);
  }
  return map;
}

export function caseNeedsClientResponse(
  caseRow: Pick<Case, "status">,
  lastSenderByCase: Map<string, Message["sender"]>,
  caseId: string,
) {
  return caseRow.status !== "closed" && lastSenderByCase.get(caseId) === "admin";
}

export function countCasesNeedingResponse(
  cases: Pick<Case, "id" | "status">[],
  messages: Pick<Message, "case_id" | "sender" | "created_at">[],
) {
  const lastSenderByCase = getLastSenderByCase(messages);
  return cases.filter(c => caseNeedsClientResponse(c, lastSenderByCase, c.id)).length;
}
