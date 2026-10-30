import { lazy, Suspense } from "react";
import { advice } from "../advice";
import { processes } from "../processes";
import { fitsPlatform } from "../plan-text";
import { usePitlane } from "../store";
import { useSnapshot } from "../telemetry";
import type { Intent, ViewId } from "../types";
import { Button, Note } from "../ui";

const FrameChart = lazy(() => import("../frame-chart").then((m) => ({ default: m.FrameChart })));

const intents: { id: Intent; label: string; line: string }[] = [
  { id: "competitive", label: "Competitive", line: "Fewer overlays, a frame cap, and the network left alone." },
  { id: "balanced", label: "Balanced", line: "The short list that is actually worth doing on most PCs." },
  { id: "quality", label: "Quality", line: "Keep the picture. Spend effort on the drive, the driver, and heat." },
  { id: "streaming", label: "Streaming", line: "Keep the encoder. Make room around it instead of closing OBS." },
];

export function Bay({ onOpen }: { onOpen: (view: ViewId) => void }) {
  const intent = usePitlane((s) => s.intent);
  const setIntent = usePitlane((s) => s.setIntent);
  const marked = usePitlane((s) => s.marked);
  const skipped = usePitlane((s) => s.skipped);
  const plan = usePitlane((s) => s.plan);
  const rig = usePitlane((s) => s.rig);
  const temps = usePitlane((s) => s.temps);
  const snap = useSnapshot();
  const current = intents.find((i) => i.id === intent) ?? intents[1];
  const reviewed = marked.filter((id) => skipped[id] || Object.keys(plan).some((key) => key.startsWith(`proc:${id}:`))).length;
  const planned = Object.values(plan);
  const openCount = planned.filter((item) => item.status === "planned").length;

  const nextAdvice = advice
    .filter((item) => item.offer && fitsPlatform(item.platforms, rig.os) && !plan[`advice:${item.id}`])
    .filter((item) => item.intents.length === 0 || item.intents.includes(intent))
    .slice(0, 3);

  const hot = Number(temps.cpu) >= 95 || Number(temps.gpu) >= 85;

  return (
    <div>
      <p className="text-xs font-medium tracking-wide text-subtle uppercase">Session</p>
      <h1 className="mt-1 text-2xl font-semibold tracking-tight text-fg">{current.line}</h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
        Pitlane prepares a plan you approve. It cannot see your process list, your temperatures, or a game\u2019s frame rate, and it will not change Windows for you.
      </p>

      <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4" role="group" aria-label="Session intent">
        {intents.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setIntent(item.id)}
            className={
              item.id === intent
                ? "min-h-11 rounded-sm bg-accent px-3 text-sm font-medium text-accent-fg"
                : "min-h-11 rounded-sm border border-border bg-surface px-3 text-sm text-muted hover:text-fg"
            }
          >
            {item.label}
          </button>
        ))}
      </div>

      <section className="mt-6 grid gap-3 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-xl border border-border bg-surface p-4">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="text-base font-semibold">Review progress</h2>
            <span className="font-mono text-sm tabular-nums text-muted">
              {marked.length === 0 ? "Not started" : `${reviewed}/${marked.length}`}
            </span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-sm bg-inset">
            <div
              className="h-full bg-accent"
              style={{ width: marked.length === 0 ? "0%" : `${Math.round((reviewed / marked.length) * 100)}%` }}
            />
          </div>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            {marked.length === 0
              ? "Nothing is marked yet. Pitlane does not scan the PC. You tick what is actually running, or load an example desk to learn the flow."
              : openCount > 0
                ? `${openCount} plan ${openCount === 1 ? "step is" : "steps are"} waiting. Mark them done only after you do them yourself.`
                : "Marked apps have a decision. You can still add system steps from Advice."}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button onClick={() => onOpen("review")}>{marked.length === 0 ? "Review software" : "Continue review"}</Button>
            <Button variant="secondary" onClick={() => onOpen("plan")}>
              Open plan
            </Button>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-surface p-4">
          <h2 className="text-base font-semibold">This browser tab</h2>
          <p className="mt-1 text-xs text-subtle">Frame pacing of Pitlane itself. Not your game.</p>
          <p className="mt-3 font-mono text-2xl font-medium tabular-nums text-fg">
            {snap?.fps ?? "\u2014"}
            <span className="ml-2 text-sm text-muted">fps</span>
          </p>
          <p className="font-mono text-xs tabular-nums text-subtle">
            {snap?.frameMs ? `${snap.frameMs.toFixed(1)} ms frame` : "Measuring\u2026"}
          </p>
          {snap && snap.samples.length > 2 ? (
            <Suspense fallback={<div className="h-24" />}>
              <FrameChart samples={snap.samples} />
            </Suspense>
          ) : (
            <div className="h-24" />
          )}
        </div>
      </section>

      <section className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Signal label="CPU threads" value={snap ? String(snap.cores || "\u2014") : "\u2026"} detail="Reported by the browser. Not a model name, not a load." />
        <Signal label="Memory hint" value={snap?.deviceMemory ? `${snap.deviceMemory} GB` : "Hidden"} detail="Some browsers refuse this. It is a bucket, not a reading from Task Manager." />
        <Signal label="GPU string" value={snap?.gpu ?? "Hidden"} detail="The graphics device this tab is using. Laptops may show the integrated chip." />
        <Signal label="Display" value={snap ? snap.screen : "\u2026"} detail={snap ? `Pixel ratio ${snap.dpr}` : "Screen size, not refresh rate."} />
      </section>

      <section className="mt-6">
        <h2 className="text-base font-semibold">Not measured</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <Note>GPU load, clocks, and game FPS are invisible to a website. Use the game\u2019s counter or the vendor overlay if you want those.</Note>
          <Note>Temperatures are not available. If you read one in a hardware monitor, you can jot it on Machine. Pitlane will label it as your note.</Note>
          <Note>Process lists stay on the PC. The Review desk is a catalog you confirm, so nothing is \u201cdetected\u201d by accident.</Note>
        </div>
      </section>

      {hot ? (
        <p className="mt-4 rounded-lg border border-border bg-caution-bg px-3 py-3 text-sm leading-relaxed text-caution">
          The temperature you typed is high if it was taken under load. Fix airflow and the fan curve before closing chat apps. Pitlane cannot tell idle from in-game.
        </p>
      ) : null}

      <section className="mt-6">
        <h2 className="text-base font-semibold">Worth doing next</h2>
        <ul className="mt-3 divide-y divide-border rounded-xl border border-border bg-surface">
          {marked.length === 0 ? (
            <li className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium">Mark what is actually running</p>
                <p className="text-sm text-muted">Or load the example desk and click through a decision.</p>
              </div>
              <Button variant="secondary" onClick={() => onOpen("review")}>
                Open review
              </Button>
            </li>
          ) : null}
          {!rig.gpu ? (
            <li className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium">Name the machine</p>
                <p className="text-sm text-muted">Advice about RAM, refresh, and laptop power stays generic until you do.</p>
              </div>
              <Button variant="secondary" onClick={() => onOpen("machine")}>
                Machine
              </Button>
            </li>
          ) : null}
          {nextAdvice.map((item) => (
            <li key={item.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium">{item.title}</p>
                <p className="text-sm text-muted">{item.benefit}</p>
              </div>
              <Button variant="secondary" onClick={() => onOpen("advice")}>
                Read it
              </Button>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-subtle">
          {processes.length} common programs are in the catalog, including ones Pitlane will refuse to close.
        </p>
      </section>
    </div>
  );
}

function Signal({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <p className="text-xs font-medium text-subtle">{label}</p>
      <p className="mt-2 break-words font-mono text-sm leading-snug text-fg">{value}</p>
      <p className="mt-2 text-xs leading-relaxed text-muted">{detail}</p>
    </div>
  );
}
