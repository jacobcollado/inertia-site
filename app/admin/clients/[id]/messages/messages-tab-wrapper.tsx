"use client";

import { useState } from "react";
import { MessagesTab } from "../tabs/messages-tab";
import type { Message, Case } from "../types";

export function MessagesTabWrapper({ clientId, messages: initialMessages, cases, clientName, clientAvatarUrl }: {
  clientId: string;
  messages: Message[];
  cases: Case[];
  clientName: string;
  clientAvatarUrl: string | null;
}) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  return <MessagesTab clientId={clientId} messages={messages} setMessages={setMessages} cases={cases} clientName={clientName} clientAvatarUrl={clientAvatarUrl} />;
}
