import { useState } from "react";
import { usePitlane } from "./store";
import type { PlanItem } from "./types";
import { Button, Modal } from "./ui";

export function AddPlanButton({ draft }: { draft: Omit<PlanItem, "status" | "addedAt" | "doneAt"> }) {
  const existing = usePitlane((s) => s.plan[draft.key]);
  const add = usePitlane((s) => s.addToPlan);
  const [open, setOpen] = useState(false);
  if (existing) {
    return <span className="inline-flex min-h-11 items-center text-sm text-subtle">On the plan</span>;
  }
  const cautious = draft.safety !== "safe";
  return (
    <>
      <Button variant="secondary" onClick={() => (cautious ? setOpen(true) : add(draft))}>
        Add to plan
      </Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={draft.safety === "advanced" ? "Add an advanced step?" : "Add a cautious step?"}
        description="Pitlane will not change this setting. You would do it yourself. Read the risk. If you are unsure, cancel. You can remove it from the plan later."
      >
        <p className="text-sm leading-relaxed text-muted">{draft.summary}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            onClick={() => {
              add(draft);
              setOpen(false);
            }}
          >
            Add the steps
          </Button>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
        </div>
      </Modal>
    </>
  );
}
