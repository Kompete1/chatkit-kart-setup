import { useMemo, useState } from "react";
import { ChatKitPanel } from "./components/ChatKitPanel";

const trackOptions = ["Zwartkops", "Killarney"] as const;
const kartClasses = ["Mini Max", "Junior Max", "Senior Max"] as const;
const weatherOptions = ["hot", "cool", "wet", "windy"] as const;
const tyreConditions = ["new", "scrubbed", "old"] as const;

export function KartSetupPage() {
  const [track, setTrack] = useState<(typeof trackOptions)[number]>("Zwartkops");
  const [kartClass, setKartClass] =
    useState<(typeof kartClasses)[number]>("Senior Max");
  const [weather, setWeather] =
    useState<(typeof weatherOptions)[number]>("hot");
  const [tyreCondition, setTyreCondition] =
    useState<(typeof tyreConditions)[number]>("new");

  const trackImage =
    track === "Killarney" ? "/tracks/killarney.jpg" : "/tracks/zwartkops.jpg";

  const stateVariables = useMemo(
    () => ({
      track,
      kart_class: kartClass,
      weather,
      tyre_condition: tyreCondition,
    }),
    [kartClass, track, tyreCondition, weather]
  );

  const [requestToken, setRequestToken] = useState(0);
  const setupPrompt = useMemo(
    () =>
      `Give me the kart setup recommendation for ${track} in ${weather} conditions for ${kartClass} with ${tyreCondition} tyres. Reply only using the Kart Setup Card widget.`,
    [kartClass, track, tyreCondition, weather]
  );

  const triggerSetup = () => {
    setRequestToken((n) => n + 1);
  };

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 text-slate-900 dark:bg-slate-950 dark:text-slate-100 sm:py-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <header className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Kart Setup
          </p>
          <h1 className="text-3xl font-bold">Kart Setup Advisor</h1>
          <p className="max-w-3xl text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            Pick your track, kart class, and conditions. The advisor will use
            these to tailor gearing, tyre pressure, and handling tips. You can
            still ask free-form questions in the chat.
          </p>
        </header>

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(420px,1fr)] lg:gap-8">
          <div className="space-y-5">
            <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100 transition-colors dark:bg-slate-900 dark:ring-slate-800 sm:p-6">
              <div className="mb-4 space-y-1">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                  Session context
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Inputs used for the setup recommendation.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Track
                  <select
                    className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm transition hover:border-slate-300 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:hover:border-slate-600 dark:focus:border-sky-400 dark:focus:ring-sky-800"
                    value={track}
                    onChange={(e) =>
                      setTrack(e.target.value as (typeof trackOptions)[number])
                    }
                  >
                    {trackOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Kart class
                  <select
                    className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm transition hover:border-slate-300 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:hover:border-slate-600 dark:focus:border-sky-400 dark:focus:ring-sky-800"
                    value={kartClass}
                    onChange={(e) =>
                      setKartClass(e.target.value as (typeof kartClasses)[number])
                    }
                  >
                    {kartClasses.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Weather
                  <select
                    className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm transition hover:border-slate-300 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:hover:border-slate-600 dark:focus:border-sky-400 dark:focus:ring-sky-800"
                    value={weather}
                    onChange={(e) =>
                      setWeather(
                        e.target.value as (typeof weatherOptions)[number]
                      )
                    }
                  >
                    {weatherOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Tyre condition
                  <select
                    className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm transition hover:border-slate-300 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:hover:border-slate-600 dark:focus:border-sky-400 dark:focus:ring-sky-800"
                    value={tyreCondition}
                    onChange={(e) =>
                      setTyreCondition(
                        e.target.value as (typeof tyreConditions)[number]
                      )
                    }
                  >
                    {tyreConditions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </section>

            <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100 transition-colors dark:bg-slate-900 dark:ring-slate-800">
              <div className="flex items-start justify-between px-5 pb-3 pt-5 sm:px-6 sm:pb-4 sm:pt-6">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Track preview
                  </p>
                  <p className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                    {track}
                  </p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Kart class: {kartClass} | Weather: {weather} | Tyre: {tyreCondition}
                  </p>
                </div>
              </div>
              <div className="flex aspect-[4/3] w-full items-center justify-center bg-slate-100 dark:bg-slate-950/70 sm:aspect-[16/9]">
                <img
                  src={trackImage}
                  alt={`${track} track`}
                  className="h-full w-full object-contain object-center"
                  loading="lazy"
                />
              </div>
            </section>
          </div>

          <div className="flex flex-col gap-4 lg:gap-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm leading-relaxed text-slate-600 dark:text-slate-300 sm:max-w-md">
                Generate a setup card with the current selections.
              </div>
              <button
                type="button"
                onClick={triggerSetup}
                className="inline-flex items-center justify-center rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 focus:ring-offset-slate-100 dark:focus:ring-offset-slate-900"
              >
                Get kart setup
              </button>
            </div>
            <ChatKitPanel
              stateVariables={stateVariables}
              setupPrompt={setupPrompt}
              requestToken={requestToken}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
