import { useEffect, useMemo, useRef } from "react";
import { ChatKit, useChatKit } from "@openai/chatkit-react";
import {
  WorkflowState,
  createClientSecretFetcher,
  workflowId,
} from "../lib/chatkitSession";

type ChatKitPanelProps = {
  stateVariables?: WorkflowState;
  setupPrompt?: string;
  requestToken?: number;
};

export function ChatKitPanel({
  stateVariables,
  setupPrompt,
  requestToken,
}: ChatKitPanelProps) {
  const getClientSecret = useMemo(
    () =>
      createClientSecretFetcher(
        workflowId,
        "/api/create-session",
        stateVariables
      ),
    [
      stateVariables?.kart_class,
      stateVariables?.track,
      stateVariables?.tyre_condition,
      stateVariables?.weather,
    ]
  );

  const chatkit = useChatKit({
    api: { getClientSecret },
  });

  // Send the setup prompt when requestToken changes
  const lastRequestToken = useRef<number | undefined>();

  useEffect(() => {
    if (
      requestToken === undefined ||
      requestToken === null ||
      !setupPrompt ||
      !chatkit.sendUserMessage
    )
      return;

    if (lastRequestToken.current === requestToken) return;
    lastRequestToken.current = requestToken;

    chatkit
      .sendUserMessage({ text: setupPrompt })
      .catch(() => {
        // swallow errors; user can retry manually
      });
  }, [chatkit, requestToken, setupPrompt]);

  return (
    <div className="flex h-[90vh] w-full rounded-2xl bg-white shadow-sm transition-colors dark:bg-slate-900">
      <ChatKit control={chatkit.control} className="h-full w-full" />
    </div>
  );
}
