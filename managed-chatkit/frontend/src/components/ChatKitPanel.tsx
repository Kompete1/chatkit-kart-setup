import { useMemo } from "react";
import { ChatKit, useChatKit } from "@openai/chatkit-react";
import {
  createClientSecretFetcher,
  workflowId,
  workflowIdError,
} from "../lib/chatkitSession";

export function ChatKitPanel() {
  if (!workflowId || workflowIdError) {
    return (
      <ErrorBanner message={workflowIdError ?? "Missing workflow id"} />
    );
  }

  const getClientSecret = useMemo(
    () => createClientSecretFetcher(workflowId),
    [workflowId]
  );

  const chatkit = useChatKit({
    api: { getClientSecret },
  });

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
