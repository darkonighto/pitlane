import { useSnapshot } from "../telemetry";
import { usePitlane } from "../store";
import type { Rig } from "../types";
import { Note, PageHeader, fieldClass } from "../ui";

export function Machine() {
  const rig = usePitlane((s) => s.rig);
  const update = usePitlane((s) => s.updateRig);
  const temps = usePitlane((s) => s.temps);
  const setTemps = usePitlane((s) => s.setTemps);
  const snap = useSnapshot();

  return (
    <div>
      <PageHeader
        kicker="Machine"
        title="What this browser can see"
        lede="These readings come from the page you have open. They are not Task Manager, and they are not a sensor. The form underneath is your description of the PC, saved only in this browser."
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <Fact label="Platform" value={snap?.platform ?? "…"} />
        <Fact label="Logical processors" value={snap ? String(snap.cores || "—") : "…"} />
        <Fact label="Device memory hint" value={snap?.deviceMemory ? `About ${snap.deviceMemory} GB` : "Not shared"} />
        <Fact label="Screen" value={snap ? `${snap.screen} · ${snap.dpr}x` : "…"} />
        <Fact label="GPU renderer" value={snap?.gpu ?? "Blocked or unavailable"} />
        <Fact label="Network hint" value={snap?.network ?? "Not shared"} />
        <Fact label="Battery" value={snap?.battery ?? "No battery API"} />
        <Fact label="Storage quota" value={snap?.storage ?? "Not available yet"} />
      </div>
      <p className="mt-3 text-xs leading-relaxed text-subtle">
        Tab frame time is on the bay. Refresh rate is not exposed reliably, so it is a field you set below. Browser storage quota is not your free disk space.
      </p>

      <section className="mt-8">
        <h2 className="text-base font-semibold">Your description</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Select label="System" value={rig.os} onChange={(os) => update({ os: os as Rig["os"] })} options={[["unknown", "Not set"], ["windows", "Windows"], ["linux", "Linux"], ["mac", "Mac"], ["deck", "Steam Deck"]]} />
          <Select label="Shape" value={rig.form} onChange={(form) => update({ form: form as Rig["form"] })} options={[["desktop", "Desktop"], ["laptop", "Laptop"]]} />
          <Text label="CPU, if you want it named" value={rig.cpu} onChange={(cpu) => update({ cpu })} placeholder="Optional" />
          <Text label="GPU you game on" value={rig.gpu} onChange={(gpu) => update({ gpu })} placeholder="Optional" />
          <Select label="RAM" value={rig.ram} onChange={(ram) => update({ ram: ram as Rig["ram"] })} options={[["unknown", "Not set"], ["8", "8 GB"], ["16", "16 GB"], ["32", "32 GB"], ["64", "64 GB"]]} />
          <Select label="Game drive" value={rig.storage} onChange={(storage) => update({ storage: storage as Rig["storage"] })} options={[["unknown", "Not set"], ["ssd", "SSD"], ["hdd", "Hard drive"], ["mixed", "Both"]]} />
          <Select label="Monitor refresh" value={rig.refresh} onChange={(refresh) => update({ refresh: refresh as Rig["refresh"] })} options={[["unknown", "Not set"], ["60", "60 Hz"], ["120", "120 Hz"], ["144", "144 Hz"], ["165", "165 Hz"], ["240", "240 Hz"], ["360", "360 Hz"]]} />
          <label className="flex min-h-11 items-center gap-2 self-end text-sm text-fg">
            <input type="checkbox" checked={rig.streams} onChange={(e) => update({ streams: e.target.checked })} className="size-4" />
            I stream from this PC
          </label>
        </div>
        {snap?.gpu ? (
          <div className="mt-3">
            <button type="button" className="min-h-11 text-sm text-fg underline-offset-2 hover:underline" onClick={() => update({ gpu: snap.gpu ?? "" })}>
              Copy the browser GPU string into the form
            </button>
          </div>
        ) : null}
        {rig.form === "laptop" ? (
          <div className="mt-4">
            <Note>On a laptop, play plugged in if you care about a steady frame time. Battery mode will cut clocks no matter which startup apps you close.</Note>
          </div>
        ) : null}
        {rig.ram === "8" ? (
          <div className="mt-4">
            <Note>At 8 GB, a browser left open is more likely to matter than an overlay. Closing extra windows is the practical step. Do not turn the page file off to “get RAM back”.</Note>
          </div>
        ) : null}
        {rig.storage === "hdd" ? (
          <div className="mt-4">
            <Note>A game on a hard drive will hitch when the disk is busy. Moving that game to an SSD, if you have one, beats any startup tweak.</Note>
          </div>
        ) : null}
      </section>

      <section className="mt-8">
        <h2 className="text-base font-semibold">Temperature note</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
          Type a number only if you read it in a hardware monitor. Pitlane did not measure it. Include whether it was idle or in a game in your own head. This page cannot.
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Text label="CPU °C, your note" value={temps.cpu} onChange={(cpu) => setTemps({ cpu: cpu.replace(/[^\d.]/g, "") })} placeholder="Not measured" />
          <Text label="GPU °C, your note" value={temps.gpu} onChange={(gpu) => setTemps({ gpu: gpu.replace(/[^\d.]/g, "") })} placeholder="Not measured" />
        </div>
      </section>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <p className="text-xs font-medium text-subtle">{label}</p>
      <p className="mt-2 break-words font-mono text-sm text-fg">{value}</p>
    </div>
  );
}

function Text({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block text-xs font-medium text-subtle">{label}</span>
      <input className={fieldClass} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[][] }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block text-xs font-medium text-subtle">{label}</span>
      <select className={fieldClass} value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map(([id, name]) => (
          <option key={id} value={id}>
            {name}
          </option>
        ))}
      </select>
    </label>
  );
}
