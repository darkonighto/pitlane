import { useState } from "react";
import { usePitlane } from "../store";
import { Button, Modal, PageHeader } from "../ui";

const can = [
  "Read a few facts the browser is allowed to share: processor count, a rough memory bucket, the GPU string, this tab’s frame pacing, and sometimes battery or network hints.",
  "Explain common background programs in plain language, including ones you should not close.",
  "Separate safe reversible steps from advanced or harmful ones.",
  "Remember the plan, your ticks, and your machine notes in this browser until you clear them.",
];

const cannot = [
  "See your process list, temperatures, clocks, VRAM use, or the frame rate of a game.",
  "Close an app, edit the registry, change a power plan, install a driver, or touch BIOS.",
  "Promise a higher frame rate. Some steps change nothing measurable. That is a normal result.",
  "Replace Task Manager, the GPU vendor app, or antivirus.",
];

const refuses = [
  "Disabling antivirus, the firewall, Windows Update, or memory integrity.",
  "Registry cleaners, driver-updater websites, and ‘game booster’ downloads.",
  "Ending Explorer, Desktop Window Manager, audio services, or anti-cheat.",
  "Disabling the page file, SysMain, or HPET, and timer-resolution utilities.",
  "BIOS walks for people who cannot reset a board that fails to boot.",
];

export function Limits() {
  const reset = usePitlane((s) => s.resetAll);
  const [open, setOpen] = useState(false);
  return (
    <div>
      <PageHeader
        kicker="Limits"
        title="What Pitlane will and will not do"
        lede="The useful version of this tool is honest about the boundary. A website that claims it boosted your PC is describing a feeling, not a measurement."
      />
      <section>
        <h2 className="text-base font-semibold">It can</h2>
        <ul className="mt-3 space-y-2">
          {can.map((item) => (
            <li key={item} className="rounded-lg border border-border bg-surface px-3 py-3 text-sm leading-relaxed text-muted">
              {item}
            </li>
          ))}
        </ul>
      </section>
      <section className="mt-6">
        <h2 className="text-base font-semibold">It cannot</h2>
        <ul className="mt-3 space-y-2">
          {cannot.map((item) => (
            <li key={item} className="rounded-lg border border-border bg-surface px-3 py-3 text-sm leading-relaxed text-muted">
              {item}
            </li>
          ))}
        </ul>
      </section>
      <section className="mt-6">
        <h2 className="text-base font-semibold">It will not recommend</h2>
        <ul className="mt-3 space-y-2">
          {refuses.map((item) => (
            <li key={item} className="rounded-lg border border-border bg-risk-bg px-3 py-3 text-sm leading-relaxed text-risk">
              {item}
            </li>
          ))}
        </ul>
      </section>
      <section className="mt-8 rounded-xl border border-border bg-surface p-4">
        <h2 className="text-base font-semibold">Clear this browser’s copy</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          This deletes the plan, ticks, game picks, and machine notes stored by Pitlane in this browser. It does not undo a setting you already changed on the PC.
        </p>
        <div className="mt-3">
          <Button variant="secondary" onClick={() => setOpen(true)}>
            Clear Pitlane notes
          </Button>
        </div>
      </section>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Clear notes stored in this browser?"
        description="The PC stays as it is. You would lose the checklist and have to rebuild it."
      >
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => {
              reset();
              setOpen(false);
            }}
          >
            Clear notes
          </Button>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Keep them
          </Button>
        </div>
      </Modal>
    </div>
  );
}
