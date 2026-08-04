import { MessagesTabWrapper } from "./messages-tab-wrapper";
import { getClientMessagesData } from "../data";

export const revalidate = 30;

export default async function ClientMessagesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { messages, cases, clientName, clientAvatarUrl } = await getClientMessagesData(id);

  return (
    <MessagesTabWrapper
      clientId={id}
      messages={messages}
      cases={cases}
      clientName={clientName}
      clientAvatarUrl={clientAvatarUrl}
    />
  );
}
