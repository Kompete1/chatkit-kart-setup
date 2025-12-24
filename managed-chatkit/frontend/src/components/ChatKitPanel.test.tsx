import React from "react";
import { render, screen, act } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { ChatKitPanel } from "./ChatKitPanel";

let lastOptions: any = null;

vi.mock("@openai/chatkit-react", () => {
  return {
    ChatKit: (props: any) => (
      <div data-testid="chatkit" className={props.className} />
    ),
    useChatKit: (options: any) => {
      lastOptions = options;
      return {
        control: {},
        sendUserMessage: vi.fn(async () => undefined),
      };
    },
  };
});

describe("ChatKitPanel", () => {
  beforeEach(() => {
    lastOptions = null;
    vi.restoreAllMocks();
  });

  it("does not fetch kart setup until onResponseEnd fires for the current requestToken", async () => {
    const fetchMock = vi.fn(async () => {
      return {
        ok: true,
        json: async () => ({
          header: "Zwartkops baseline",
          axle_ride_height: "2mm down",
          caster_camber: "Neutral",
          carburetor_main_jet: "158",
          needle_position: "Clip 2",
          tyre_pressure: "0.75 bar",
          gear_ratio: "12/77",
        }),
      } as any;
    });
    vi.stubGlobal("fetch", fetchMock);

    render(
      <ChatKitPanel
        stateVariables={{
          track: "Zwartkops",
          kart_class: "Senior Max",
          weather: "hot",
          tyre_condition: "new",
        }}
        setupPrompt="Give me a setup"
        requestToken={1}
      />
    );

    expect(fetchMock).toHaveBeenCalledTimes(0);

    await act(async () => {
      await lastOptions.onResponseEnd();
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe("/api/kart-setup");

    expect(
      await screen.findByText("Zwartkops baseline")
    ).toBeInTheDocument();
    expect(screen.getByText("2mm down")).toBeInTheDocument();
    expect(screen.getByText("12/77")).toBeInTheDocument();
  });

  it("ignores onResponseEnd from older requests and uses latest stateVariables", async () => {
    const fetchMock = vi.fn(async (_url: string, init: any) => {
      const parsed = JSON.parse(init.body);
      const track = parsed.state_variables?.track;
      return {
        ok: true,
        json: async () => ({
          header: `Setup for ${track}`,
          axle_ride_height: "A",
          caster_camber: "B",
          carburetor_main_jet: "C",
          needle_position: "D",
          tyre_pressure: "E",
          gear_ratio: "F",
        }),
      } as any;
    });
    vi.stubGlobal("fetch", fetchMock);

    const { rerender } = render(
      <ChatKitPanel
        stateVariables={{
          track: "Zwartkops",
          kart_class: "Senior Max",
          weather: "hot",
          tyre_condition: "new",
        }}
        setupPrompt="Give me a setup"
        requestToken={1}
      />
    );

    const oldOnResponseEnd = lastOptions.onResponseEnd as () => void | Promise<void>;

    // New request with different selectors.
    rerender(
      <ChatKitPanel
        stateVariables={{
          track: "Killarney",
          kart_class: "Senior Max",
          weather: "cool",
          tyre_condition: "scrubbed",
        }}
        setupPrompt="Give me a setup"
        requestToken={2}
      />
    );

    const newOnResponseEnd = lastOptions.onResponseEnd as () => void | Promise<void>;

    // Fire a stale response end for requestToken=1 (should be ignored).
    await act(async () => {
      await oldOnResponseEnd();
    });

    expect(fetchMock).toHaveBeenCalledTimes(0);

    // Fire response end for the latest request (should fetch).
    await act(async () => {
      await newOnResponseEnd();
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);

    expect(await screen.findByText("Setup for Killarney")).toBeInTheDocument();
  });
});
