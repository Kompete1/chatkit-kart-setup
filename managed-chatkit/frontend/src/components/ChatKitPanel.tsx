import { useEffect, useMemo, useRef, useState } from "react";
import { ChatKit, useChatKit } from "@openai/chatkit-react";
import {
  WorkflowState,
  createClientSecretFetcher,
  workflowId,
  workflowIdError,
} from "../lib/chatkitSession";

type KartSetup = {
  header: string;
  axle_ride_height: string;
  caster_camber: string;
  carburetor_main_jet: string;
  needle_position: string;
  tyre_pressure: string;
  gear_ratio: string;
};

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

  const [kartSetup, setKartSetup] = useState<KartSetup | null>(null);
  const [kartSetupLoading, setKartSetupLoading] = useState(false);
  const [kartSetupError, setKartSetupError] = useState<string | null>(null);

  const pendingRequestToken = useRef<number | null>(null);
  const requestStateVariables = useRef<WorkflowState | undefined>(undefined);

  const fetchKartSetup = async (variables?: WorkflowState) => {
    setKartSetupLoading(true);
    setKartSetupError(null);
    try {
      const response = await fetch("/api/kart-setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ state_variables: variables ?? {} }),
      });

      const payload = (await response.json().catch(() => ({}))) as
        | KartSetup
        | { error?: string; detail?: string };

      if (!response.ok) {
        const message =
          "error" in payload && typeof payload.error === "string"
            ? payload.error
            : "detail" in payload && typeof payload.detail === "string"
              ? payload.detail
            : "Failed to fetch kart setup";
        throw new Error(message);
      }

      if (
        !payload ||
        typeof payload !== "object" ||
        !("header" in payload) ||
        typeof (payload as KartSetup).header !== "string"
      ) {
        throw new Error("Unexpected response from kart setup endpoint");
      }

      setKartSetup(payload as KartSetup);
    } catch (error) {
      setKartSetupError(error instanceof Error ? error.message : String(error));
    } finally {
      setKartSetupLoading(false);
    }
  };

  const chatkit = useChatKit({
    api: { getClientSecret },
    onResponseEnd: () => {
      const token = pendingRequestToken.current;
      if (token === null) return;
      if (requestToken === undefined || requestToken === null) return;
      if (token !== requestToken) return;
      pendingRequestToken.current = null;
      void fetchKartSetup(requestStateVariables.current);
    },
  });

  const { sendUserMessage } = chatkit;

  // Send the setup prompt when requestToken changes
  const lastRequestToken = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (
      requestToken === undefined ||
      requestToken === null ||
      !setupPrompt ||
      !sendUserMessage
    )
      return;

    if (lastRequestToken.current === requestToken) return;
    lastRequestToken.current = requestToken;
    pendingRequestToken.current = requestToken;
    requestStateVariables.current = stateVariables;

    sendUserMessage({ text: setupPrompt })
      .catch(() => {
        // swallow errors; user can retry manually
      });
  }, [requestToken, sendUserMessage, setupPrompt, stateVariables]);

  if (workflowIdError) {
    return <ErrorBanner message={workflowIdError} />;
  }

  return (
    <div className="flex min-h-[560px] w-full flex-col gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100 transition-colors dark:bg-slate-900 dark:ring-slate-800 sm:p-5 lg:h-[calc(100vh-12rem)] lg:min-h-[640px]">
      <div className="rounded-2xl bg-slate-50/80 p-4 ring-1 ring-slate-200/70 dark:bg-slate-950/70 dark:ring-slate-800 sm:p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Kart Setup Card
            </p>
            <p className="mt-1 text-base font-semibold leading-snug text-slate-900 dark:text-slate-50 sm:text-lg">
              {kartSetup?.header ?? "Request a setup to see recommendations"}
            </p>
            {kartSetupLoading ? (
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">
                Fetching setup details...
              </p>
            ) : kartSetupError ? (
              <p className="mt-1 text-sm text-red-700 dark:text-red-400">
                {kartSetupError}
              </p>
            ) : (
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">
                Updated when the assistant finishes responding.
              </p>
            )}
          </div>
          {kartSetup ? (
            <button
              type="button"
              onClick={() => void fetchKartSetup(stateVariables)}
              className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 focus:ring-offset-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:border-slate-600 dark:hover:bg-slate-800 dark:focus:ring-sky-400 dark:focus:ring-offset-slate-950"
              disabled={kartSetupLoading}
            >
              Refresh
            </button>
          ) : null}
        </div>

        {kartSetup ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-2 sm:gap-4">
            <Field label="Axle & ride height" value={kartSetup.axle_ride_height} />
            <Field label="Caster / camber" value={kartSetup.caster_camber} />
            <Field
              label="Carburetor main jet"
              value={kartSetup.carburetor_main_jet}
            />
            <Field label="Needle position" value={kartSetup.needle_position} />
            <Field label="Tyre pressure" value={kartSetup.tyre_pressure} />
            <Field label="Gear ratio" value={kartSetup.gear_ratio} />
          </div>
        ) : null}
      </div>

      <div className="min-h-0 flex-1 overflow-hidden rounded-2xl bg-slate-100 p-3 ring-1 ring-slate-200/80 dark:bg-slate-950/70 dark:ring-slate-800">
        <ChatKit
          control={chatkit.control}
          className="h-full w-full rounded-xl bg-white shadow-sm ring-1 ring-slate-200/70 dark:bg-slate-900 dark:ring-slate-800"
        />
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white p-3 shadow-sm ring-1 ring-slate-200/70 dark:bg-slate-900 dark:ring-slate-800 sm:p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium text-slate-900 dark:text-slate-50">
        {value}
      </p>
    </div>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="flex min-h-[560px] w-full items-center justify-center rounded-2xl bg-red-50 p-6 text-red-900 shadow-sm lg:h-[calc(100vh-12rem)] lg:min-h-[640px]">
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
