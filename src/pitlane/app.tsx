import { useEffect, useState } from "react";
import { ClipboardList, Cpu, Gamepad2, Gauge, ListChecks, Shield, SlidersHorizontal } from "lucide-react";
import { usePitlane } from "./store";
import type { ViewId } from "./types";
import { Button, Modal } from "./ui";
import { Advice } from "./views/advice";
import { Bay } from "./views/bay";
import { Games } from "./views/games";
import { Limits } from "./views/limits";
import { Machine } from "./views/machine";
import { Plan } from "./views/plan";
import { Review } from "./views/review";

const nav: { id: ViewId; label: string; icon: typeof Gauge }[] = [
  { id: "bay", label: "Bay", icon: Gauge },
  { id: "review", label: "Review", icon: ListChecks },
  { id: "advice", label: "Advice", icon: SlidersHorizontal },
  { id: "games", label: "Games", icon: Gamepad2 },
  { id: "plan", label: "Plan", icon: ClipboardList },
  { id: "machine", label: "Machine", icon: Cpu },
  { id: "limits", label: "Limits", icon: Shield },
];

const mobile: ViewId[] = ["bay", "review", "advice", "plan"];

export function PitlaneApp() {
  const [view, setView] = useState<ViewId>("bay");
  const [more, setMore] = useState(false);
  const hydrated = usePitlane((s) => s.hydrated);
  const onboarded = usePitlane((s) => s.onboarded);
  const setOnboarded = usePitlane((s) => s.setOnboarded);
  const notice = usePitlane((s) => s.notice);
  const dismiss = usePitlane((s) => s.dismissNotice);
  const planCount = usePitlane((s) => Object.values(s.plan).filter((item) => item.status === "planned").length);

  useEffect(() => {
    const unsub = usePitlane.persist.onFinishHydration(() => {
      usePitlane.setState({ hydrated: true });
    });
    void usePitlane.persist.rehydrate();
    const backup = window.setTimeout(() => {
      if (!usePitlane.getState().hydrated) usePitlane.setState({ hydrated: true });
    }, 500);
    return () => {
      unsub();
      window.clearTimeout(backup);
    };
  }, []);

  useEffect(() => {
    if (!notice) return;
    const id = window.setTimeout(() => dismiss(), 4200);
    return () => window.clearTimeout(id);
  }, [notice, dismiss]);

  return (
    <div className="min-h-dvh bg-bg text-fg md:grid md:grid-cols-[15rem_minmax(0,1fr)]">
      <aside className="hidden border-r border-border md:flex md:min-h-dvh md:flex-col md:px-4 md:py-6">
        <div className="flex items-center gap-3 px-2">
          <Mark />
          <div>
            <p className="text-base font-semibold tracking-tight">Pitlane</p>
            <p className="text-xs text-subtle">Session prep</p>
          </div>
        </div>
        <nav className="mt-8 flex flex-col gap-1" aria-label="Sections">
          {nav.map((item) => (
            <NavButton key={item.id} item={item} active={view === item.id} count={item.id === "plan" ? planCount : 0} onClick={() => setView(item.id)} />
          ))}
        </nav>
        <p className="mt-auto px-2 pt-6 text-xs leading-relaxed text-subtle">Nothing changes on the PC until you do it yourself.</p>
      </aside>

      <div className="min-w-0 pb-24 md:pb-10">
        <div className="flex items-center gap-3 border-b border-border px-4 py-3 md:hidden">
          <Mark />
          <div>
            <p className="text-sm font-semibold">Pitlane</p>
            <p className="text-xs text-subtle">Nothing runs until you approve it</p>
          </div>
        </div>
        <main className="mx-auto w-full max-w-5xl px-4 py-6 md:px-8 md:py-8">
          {view === "bay" ? <Bay onOpen={setView} /> : null}
          {view === "review" ? <Review /> : null}
          {view === "advice" ? <Advice /> : null}
          {view === "games" ? <Games /> : null}
          {view === "plan" ? <Plan onReview={() => setView("review")} /> : null}
          {view === "machine" ? <Machine /> : null}
          {view === "limits" ? <Limits /> : null}
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-20 flex border-t border-border bg-bg md:hidden" aria-label="Sections" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
        {mobile.map((id) => {
          const item = nav.find((entry) => entry.id === id);
          if (!item) return null;
          return <NavButton key={id} item={item} active={view === id} count={id === "plan" ? planCount : 0} onClick={() => setView(id)} compact />;
        })}
        <button type="button" onClick={() => setMore(true)} className="flex min-h-14 flex-1 flex-col items-center justify-center gap-1 text-xs text-muted">
          <Shield className="size-5" aria-hidden />
          More
        </button>
      </nav>

      {notice ? (
        <div className="fixed inset-x-4 bottom-20 z-30 rounded-lg border border-border bg-elevated px-3 py-3 text-sm text-fg shadow-none md:bottom-6 md:left-auto md:right-6 md:max-w-sm" role="status">
          {notice}
        </div>
      ) : null}

      <Modal open={more} onClose={() => setMore(false)} title="More" description="Games, the machine readout, and the limits of what Pitlane will suggest.">
        <div className="flex flex-col gap-2">
          {(["games", "machine", "limits"] as ViewId[]).map((id) => {
            const item = nav.find((entry) => entry.id === id);
            if (!item) return null;
            const Icon = item.icon;
            return (
              <button
                key={id}
                type="button"
                className="flex min-h-11 items-center gap-3 rounded-sm border border-border px-3 text-left text-sm text-fg"
                onClick={() => {
                  setView(id);
                  setMore(false);
                }}
              >
                <Icon className="size-4" aria-hidden />
                {item.label}
              </button>
            );
          })}
        </div>
      </Modal>

      <Modal
        open={hydrated && !onboarded}
        onClose={() => setOnboarded(true)}
        title="Pitlane plans. It does not touch the PC."
        description="Browsers cannot see your process list, temperatures, or a game’s frame rate. You mark what is running. Every step waits until you add it, and you can take it off the plan."
      >
        <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted">
          <li>Safe steps are reversible and low drama.</li>
          <li>Advanced steps are labeled, and some popular tweaks are refused.</li>
          <li>Marking something done only records that you say you did it.</li>
        </ul>
        <div className="mt-4">
          <Button onClick={() => setOnboarded(true)}>Start on the bay</Button>
        </div>
      </Modal>
    </div>
  );
}

function NavButton({
  item,
  active,
  onClick,
  count,
  compact,
}: {
  item: (typeof nav)[number];
  active: boolean;
  onClick: () => void;
  count: number;
  compact?: boolean;
}) {
  const Icon = item.icon;
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        compact
          ? `flex min-h-14 flex-1 flex-col items-center justify-center gap-1 text-xs ${active ? "text-fg" : "text-muted"}`
          : `flex min-h-11 items-center gap-3 rounded-sm px-3 text-left text-sm ${active ? "bg-elevated text-fg" : "text-muted hover:bg-elevated hover:text-fg"}`
      }
    >
      <Icon className="size-5 shrink-0" aria-hidden />
      <span className={compact ? "" : "flex-1"}>{item.label}</span>
      {!compact && count > 0 ? <span className="font-mono text-xs tabular-nums text-subtle">{count}</span> : null}
    </button>
  );
}

function Mark() {
  return (
    <svg viewBox="0 0 24 24" className="size-8 text-accent" aria-hidden>
      <rect x="3" y="4" width="18" height="16" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7 15h10M7 11h7M7 7h4" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
