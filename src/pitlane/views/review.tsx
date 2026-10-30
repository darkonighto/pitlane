import { useMemo, useState } from "react";
import { AddPlanButton } from "../add-plan";
import { categories, processes } from "../processes";
import { fitsPlatform } from "../plan-text";
import { usePitlane } from "../store";
import type { CustomApp, ProcessEntry } from "../types";
import { Button, ImpactLabel, Note, PageHeader, SafetyBadge, Steps, fieldClass } from "../ui";

export function Review() {
  const rig = usePitlane((s) => s.rig);
  const marked = usePitlane((s) => s.marked);
  const sample = usePitlane((s) => s.sample);
  const skipped = usePitlane((s) => s.skipped);
  const toggleMark = usePitlane((s) => s.toggleMark);
  const loadSample = usePitlane((s) => s.loadSample);
  const clearMarks = usePitlane((s) => s.clearMarks);
  const skip = usePitlane((s) => s.skip);
  const customs = usePitlane((s) => s.customs);
  const addCustom = usePitlane((s) => s.addCustom);
  const removeCustom = usePitlane((s) => s.removeCustom);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [openId, setOpenId] = useState<string | null>(null);
  const [customName, setCustomName] = useState("");
  const [customNote, setCustomNote] = useState("");

  const visible = useMemo(() => {
    return processes.filter((item) => {
      if (!fitsPlatform(item.platforms, rig.os)) return false;
      if (category !== "All" && item.category !== category) return false;
      if (!query.trim()) return true;
      const blob = `${item.name} ${item.vendor} ${item.purpose}`.toLowerCase();
      return blob.includes(query.trim().toLowerCase());
    });
  }, [category, query, rig.os]);

  const markedSet = new Set(marked);
  const ordered = [...visible].sort((a, b) => Number(markedSet.has(b.id)) - Number(markedSet.has(a.id)));

  return (
    <div>
      <PageHeader
        kicker="Review"
        title="What is using the machine"
        lede="A browser cannot list your processes. This is a catalog of common ones. Tick what you actually run, read what it is for, then add a step only if you want to do it yourself."
      />
      <div className="flex flex-wrap gap-2">
        <Button onClick={loadSample}>Load example desk</Button>
        <Button variant="secondary" onClick={clearMarks}>
          Clear ticks
        </Button>
      </div>
      {sample ? (
        <p className="mt-4 rounded-lg border border-border bg-inset px-3 py-3 text-sm leading-relaxed text-muted">
          Example desk is loaded. These ticks are a sample Windows gaming PC, not a detection. Clear them before treating the list as yours.
        </p>
      ) : null}
      {rig.os === "unknown" ? (
        <p className="mt-3 text-sm text-subtle">Showing the Windows catalog. Set the system on Machine if that is wrong.</p>
      ) : null}

      <div className="mt-5 flex min-w-0 flex-col gap-3">
        <input
          className={fieldClass}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search the catalog"
          aria-label="Search the catalog"
        />
        <div className="flex w-full min-w-0 gap-2 overflow-x-auto pb-1">
          {["All", ...categories].map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setCategory(item)}
              className={
                category === item
                  ? "min-h-11 shrink-0 rounded-sm bg-accent px-3 text-sm font-medium text-accent-fg"
                  : "min-h-11 shrink-0 rounded-sm border border-border px-3 text-sm text-muted"
              }
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <ul className="mt-4 space-y-3">
        {ordered.map((item) => (
          <ProcessCard
            key={item.id}
            item={item}
            on={markedSet.has(item.id)}
            open={openId === item.id}
            skipped={Boolean(skipped[item.id])}
            onToggle={() => toggleMark(item.id)}
            onOpen={() => setOpenId(openId === item.id ? null : item.id)}
            onLeave={() => skip(item.id, item.name)}
          />
        ))}
      </ul>
      {ordered.length === 0 ? <p className="mt-4 text-sm text-muted">Nothing in this filter.</p> : null}

      <section className="mt-8 rounded-xl border border-border bg-surface p-4">
        <h2 className="text-base font-semibold">Add something that is not listed</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Pitlane will not pretend to recognise it. Closing an unknown program can stop fan control or a launcher, so the step is marked caution.
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <input className={fieldClass} value={customName} onChange={(e) => setCustomName(e.target.value)} placeholder="Program name" aria-label="Program name" />
          <input className={fieldClass} value={customNote} onChange={(e) => setCustomNote(e.target.value)} placeholder="What you think it does" aria-label="What you think it does" />
        </div>
        <div className="mt-3">
          <Button
            variant="secondary"
            onClick={() => {
              addCustom(customName, customNote);
              setCustomName("");
              setCustomNote("");
            }}
          >
            Add to my list
          </Button>
        </div>
        <ul className="mt-4 space-y-3">
          {customs.map((item) => (
            <CustomCard key={item.id} item={item} onRemove={() => removeCustom(item.id)} />
          ))}
        </ul>
      </section>
      <div className="mt-6">
        <Note>Ending a process in Task Manager is not the same as the steps above. If a card says leave it, leave it. Restarting Explorer, audio, or anti-cheat is not prep.</Note>
      </div>
    </div>
  );
}

function ProcessCard({
  item,
  on,
  open,
  skipped,
  onToggle,
  onOpen,
  onLeave,
}: {
  item: ProcessEntry;
  on: boolean;
  open: boolean;
  skipped: boolean;
  onToggle: () => void;
  onOpen: () => void;
  onLeave: () => void;
}) {
  return (
    <li className="rounded-xl border border-border bg-surface p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-semibold">{item.name}</h2>
            {item.protected ? <SafetyBadge safety="protected" /> : <ImpactLabel impact={item.typicalImpact} />}
          </div>
          <p className="mt-1 text-xs text-subtle">
            {item.vendor} · {item.category}
          </p>
        </div>
        <label className="inline-flex min-h-11 items-center gap-2 text-sm text-fg">
          <input type="checkbox" checked={on} onChange={onToggle} className="size-4" />
          On this PC
        </label>
      </div>
      <button type="button" onClick={onOpen} className="mt-2 text-left text-sm text-muted hover:text-fg">
        {open ? "Hide detail" : item.purpose}
      </button>
      {open ? (
        <div className="mt-3 border-t border-border pt-3">
          <p className="text-sm leading-relaxed text-muted">{item.purpose}</p>
          <p className="mt-2 text-sm leading-relaxed text-fg">{item.gameEffect}</p>
          <p className="mt-2 text-xs leading-relaxed text-subtle">{item.impactNote}</p>
          {item.protectedReason ? <p className="mt-3 text-sm leading-relaxed text-risk">{item.protectedReason}</p> : null}
          {item.actions.map((action) => (
            <div key={action.id} className="mt-4">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-semibold">{action.title}</h3>
                <SafetyBadge safety={action.safety} />
              </div>
              <p className="mt-1 text-sm text-muted">{action.summary}</p>
              <Steps steps={action.steps} />
              <p className="mt-2 text-xs text-subtle">Undo: {action.undo.join(" ")}</p>
              <div className="mt-3">
                <AddPlanButton
                  draft={{
                    key: `proc:${item.id}:${action.id}`,
                    title: `${item.name}: ${action.title}`,
                    summary: action.summary,
                    steps: action.steps,
                    undo: action.undo,
                    safety: action.safety,
                    area: item.category,
                  }}
                />
              </div>
            </div>
          ))}
          <div className="mt-3">
            <Button variant="ghost" onClick={onLeave}>
              {skipped ? "Left as-is" : "Leave it running"}
            </Button>
          </div>
        </div>
      ) : null}
    </li>
  );
}

function CustomCard({ item, onRemove }: { item: CustomApp; onRemove: () => void }) {
  return (
    <li className="rounded-lg border border-border p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold">{item.name}</h3>
        <SafetyBadge safety="caution" />
      </div>
      <p className="mt-1 text-sm text-muted">{item.note || "No description yet."}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <AddPlanButton
          draft={{
            key: `proc:${item.id}:close`,
            title: `Close ${item.name} before you play`,
            summary: "Unknown program. Quit it from its own menu if you are sure you do not need it this session.",
            steps: [
              `Quit ${item.name} from its tray or dock menu, not by ending a random process with a similar name.`,
              "If fans, lighting that controls fans, or the game launcher stop, reopen it.",
            ],
            undo: [`Open ${item.name} again.`],
            safety: "caution",
            area: "Custom",
          }}
        />
        <Button variant="ghost" onClick={onRemove}>
          Remove
        </Button>
      </div>
    </li>
  );
}
