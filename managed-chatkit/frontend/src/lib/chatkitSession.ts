const readEnvString = (value: unknown): string | undefined =>
  typeof value === "string" && value.trim() ? value.trim() : undefined;

const rawWorkflowId = import.meta.env.VITE_CHATKIT_WORKFLOW_ID;
export const workflowId = readEnvString(rawWorkflowId);
export const workflowIdError =
  !workflowId || workflowId.startsWith("wf_replace")
    ? "Set VITE_CHATKIT_WORKFLOW_ID in your .env file (repo root or frontend/.env.local)."
    : null;

if (workflowId) {
  // Helpful debug log to confirm Vite is reading env vars.
  console.info("[chatkit] Using workflow id from env:", workflowId);
} else {
  console.warn("[chatkit] Missing workflow id. Raw env value:", rawWorkflowId);
}

export type WorkflowState = {
  track?: string;
  kart_class?: string;
  weather?: string;
  tyre_condition?: string;
};

export function createClientSecretFetcher(
  workflow: string,
  endpoint = "/api/create-session",
  stateVariables?: WorkflowState
) {
  return async (currentSecret: string | null) => {
    if (currentSecret) return currentSecret;

    const state =
      stateVariables && typeof stateVariables === "object"
        ? {
            track: stateVariables.track,
            kart_class: stateVariables.kart_class,
            weather: stateVariables.weather,
            tyre_condition: stateVariables.tyre_condition,
          }
        : undefined;

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        workflow: { id: workflow },
        state_variables: state,
      }),
    });

    const payload = (await response.json().catch(() => ({}))) as {
      client_secret?: string;
      error?: string;
    };

    if (!response.ok) {
      throw new Error(payload.error ?? "Failed to create session");
    }

    if (!payload.client_secret) {
      throw new Error("Missing client secret in response");
    }

    return payload.client_secret;
  };
}
