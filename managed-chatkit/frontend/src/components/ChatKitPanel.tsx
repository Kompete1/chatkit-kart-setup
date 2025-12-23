import { useEffect, useMemo, useRef } from "react";
import { ChatKit, useChatKit } from "@openai/chatkit-react";
import {
  WorkflowState,
  createClientSecretFetcher,
  workflowId,
  workflowIdError,
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
      workflowId
        ? createClientSecretFetcher(
            workflowId,
            "/api/create-session",
            stateVariables
          )
        : async () => {
            throw new Error(workflowIdError ?? "Missing workflow id");
          },
    [
      workflowId,
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
  const lastRequestToken = useRef<number | undefined>(undefined);

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

  if (workflowIdError) {
    return <ErrorBanner message={workflowIdError} />;
  }

  return (
    <div className="flex h-[90vh] w-full rounded-2xl bg-white shadow-sm transition-colors dark:bg-slate-900">
      <ChatKit control={chatkit.control} className="h-full w-full" />
    </div>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="flex h-[90vh] w-full items-center justify-center rounded-2xl bg-red-50 p-6 text-red-900 shadow-sm">
      <div className="space-y-2 text-center">
        <p className="text-lg font-semibold">Managed ChatKit is not ready</p>
        <p className="text-sm">
          {message} Restart the dev server after updating your env file.
        </p>
        <p className="text-xs text-red-800">
          Expected VITE_CHATKIT_WORKFLOW_ID in managed-chatkit/.env.local or
          managed-chatkit/frontend/.env.local.
        </p>
      </div>
    </div>
  );
}
