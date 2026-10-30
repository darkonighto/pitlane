import { useMemo, useState } from "react";
import { AddPlanButton } from "../add-plan";
import { advice } from "../advice";
import { fitsPlatform } from "../plan-text";
import { usePitlane } from "../store";
import type { Safety } from "../types";
import { Note, PageHeader, SafetyBadge, Steps, fieldClass } from "../ui";

const filters: Array<{ id: "all" | Safety; label: string }> = [
  { id: "all", label: "All" },
  { id: "safe", label: "Safe" },
  { id: "caution", label: "Caution" },
  { id: "advanced", label: "Advanced" },
];

export function Advice() {
  const intent = usePitlane((s) => s.intent);
  const rig = usePitlane((s) => s.rig);
  const [filter, setFilter] = useState<(typeof filters)[number]["id"]>("all");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<string | null>(null);

  const items = useMemo(() => {
    return advice
      .filter((item) => fitsPlatform(item.platforms, rig.os))
      .filter((item) => (filter === "all" ? true : item.safety === filter))
      .filter((item) => {
        if (!query.trim()) return true;
        return `${item.title} ${item.summary} ${item.area}`.toLowerCase().includes(query.trim().toLowerCase());
      })
      .sort((a, b) => {
        const score = (item: (typeof advice)[number]) => {
          const intentHit = item.intents.includes(intent) ? 0 : 1;
          const safety = item.safety === "safe" ? 0 : item.safety === "caution" ? 1 : 2;
          return intentHit * 10 + safety;
        };
        return score(a) - score(b);
      });
  }, [filter, intent, query, rig.os]);

  return (
    <div>
      <PageHeader
        kicker="Advice"
        title="Changes worth considering"
        lede="Safe steps are reversible and hard to regret. Advanced steps can touch graphics scheduling or firmware profiles. Pitlane never applies either. Cards that say not to do something are here on purpose."
      />
      <input className={fieldClass} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search advice" aria-label="Search advice" />
      <div className="mt-3 flex flex-wrap gap-2">
        {filters.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setFilter(item.id)}
            className={
              filter === item.id
                ? "min-h-11 rounded-sm bg-accent px-3 text-sm font-medium text-accent-fg"
                : "min-h-11 rounded-sm border border-border px-3 text-sm text-muted"
            }
          >
            {item.label}
          </button>
        ))}
      </div>
      <ul className="mt-4 space-y-3">
        {items.map((item) => {
          const shown = open === item.id;
          return (
            <li key={item.id} className="rounded-xl border border-border bg-surface p-4">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base font-semibold">{item.title}</h2>
                <SafetyBadge safety={item.safety} />
                <span className="text-xs text-subtle">{item.area}</span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-muted">{item.summary}</p>
              <button type="button" className="mt-2 min-h-11 text-sm text-fg" onClick={() => setOpen(shown ? null : item.id)}>
                {shown ? "Hide detail" : "Why, and what it will not do"}
              </button>
              {shown ? (
                <div className="mt-2">
                  <p className="text-sm leading-relaxed text-muted">{item.detail}</p>
                  <p className="mt-2 text-sm leading-relaxed text-fg">{item.benefit}</p>
                  <Steps steps={item.steps} />
                  <p className="mt-2 text-xs leading-relaxed text-subtle">Undo: {item.undo.join(" ")}</p>
                  <div className="mt-3">
                    {item.offer ? (
                      <AddPlanButton
                        draft={{
                          key: `advice:${item.id}`,
                          title: item.title,
                          summary: item.summary,
                          steps: item.steps,
                          undo: item.undo,
                          safety: item.safety,
                          area: item.area,
                        }}
                      />
                    ) : (
                      <p className="text-sm text-muted">Not added as a task. This is a limit, not a step to perform.</p>
                    )}
                  </div>
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
      {items.length === 0 ? <p className="mt-4 text-sm text-muted">Nothing matches.</p> : null}
      <div className="mt-6">
        <Note>Sorted for the session type you picked on the bay. A match is a suggestion, not a measurement of your PC.</Note>
      </div>
    </div>
  );
}
