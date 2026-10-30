import { planToText } from "../plan-text";
import { usePitlane } from "../store";
import type { PlanItem } from "../types";
import { Button, PageHeader, SafetyBadge, Steps } from "../ui";

export function Plan({ onReview }: { onReview: () => void }) {
  const plan = usePitlane((s) => s.plan);
  const log = usePitlane((s) => s.log);
  const markDone = usePitlane((s) => s.markDone);
  const undoDone = usePitlane((s) => s.undoDone);
  const remove = usePitlane((s) => s.removeFromPlan);
  const notify = usePitlane.setState;
  const items = Object.values(plan).sort((a, b) => b.addedAt - a.addedAt);
  const pending = items.filter((item) => item.status === "planned");
  const done = items.filter((item) => item.status === "done");

  async function copy() {
    const text = planToText(items);
    try {
      await navigator.clipboard.writeText(text);
      notify({ notice: "Plan copied. It is text, not a script." });
    } catch {
      notify({ notice: "Could not copy from this preview. The steps are still on this page." });
    }
  }

  return (
    <div>
      <PageHeader
        kicker="Plan"
        title="Steps you agreed to"
        lede="Nothing here has been applied to a computer. Mark a step done only after you do it. Remove it if you change your mind. Undo inside Pitlane updates this list. It does not roll Windows back."
      />
      {items.length === 0 ? (
        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="text-sm leading-relaxed text-muted">The plan is empty. Review software or read advice, then add a step.</p>
          <div className="mt-3">
            <Button onClick={onReview}>Go to review</Button>
          </div>
        </div>
      ) : (
        <>
          <Button variant="secondary" onClick={() => void copy()}>
            Copy plan as text
          </Button>
          <Group title="Still to do" items={pending} empty="Nothing waiting." markDone={markDone} undoDone={undoDone} remove={remove} />
          <Group title="You marked done" items={done} empty="None yet." markDone={markDone} undoDone={undoDone} remove={remove} />
        </>
      )}
      <section className="mt-8">
        <h2 className="text-base font-semibold">What Pitlane recorded</h2>
        {log.length === 0 ? (
          <p className="mt-2 text-sm text-muted">No decisions yet.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {log.map((entry) => (
              <li key={entry.id} className="text-sm text-muted">
                <span className="font-mono text-xs tabular-nums text-subtle">{new Date(entry.at).toLocaleString()}</span>
                <span className="mx-2 text-subtle">·</span>
                {entry.text}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Group({
  title,
  items,
  empty,
  markDone,
  undoDone,
  remove,
}: {
  title: string;
  items: PlanItem[];
  empty: string;
  markDone: (key: string) => void;
  undoDone: (key: string) => void;
  remove: (key: string) => void;
}) {
  return (
    <section className="mt-6">
      <h2 className="text-base font-semibold">{title}</h2>
      {items.length === 0 ? <p className="mt-2 text-sm text-muted">{empty}</p> : null}
      <ul className="mt-3 space-y-3">
        {items.map((item) => (
          <li key={item.key} className="rounded-xl border border-border bg-surface p-4">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-semibold">{item.title}</h3>
              <SafetyBadge safety={item.safety} />
              <span className="text-xs text-subtle">{item.area}</span>
            </div>
            <p className="mt-2 text-sm text-muted">{item.summary}</p>
            <Steps steps={item.steps} />
            <p className="mt-2 text-xs leading-relaxed text-subtle">Undo on the PC: {item.undo.join(" ")}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {item.status === "planned" ? (
                <Button onClick={() => markDone(item.key)}>I did this</Button>
              ) : (
                <Button variant="secondary" onClick={() => undoDone(item.key)}>
                  Mark not done
                </Button>
              )}
              <Button variant="ghost" onClick={() => remove(item.key)}>
                Remove
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
