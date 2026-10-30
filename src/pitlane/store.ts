import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { SAMPLE_MARKS } from "./processes";
import type { CustomApp, Intent, LogEntry, PlanItem, Rig } from "./types";

export const defaultRig: Rig = {
  os: "unknown",
  form: "desktop",
  cpu: "",
  gpu: "",
  ram: "unknown",
  storage: "unknown",
  refresh: "unknown",
  streams: false,
};

type PitlaneState = {
  hydrated: boolean;
  onboarded: boolean;
  intent: Intent;
  rig: Rig;
  marked: string[];
  sample: boolean;
  plan: Record<string, PlanItem>;
  skipped: Record<string, number>;
  games: string[];
  temps: { cpu: string; gpu: string };
  customs: CustomApp[];
  log: LogEntry[];
  notice: string | null;
  setOnboarded: (v: boolean) => void;
  setIntent: (intent: Intent) => void;
  updateRig: (patch: Partial<Rig>) => void;
  setTemps: (patch: Partial<{ cpu: string; gpu: string }>) => void;
  toggleMark: (id: string) => void;
  loadSample: () => void;
  clearMarks: () => void;
  addCustom: (name: string, note: string) => void;
  removeCustom: (id: string) => void;
  addToPlan: (item: Omit<PlanItem, "status" | "addedAt" | "doneAt">) => void;
  markDone: (key: string) => void;
  undoDone: (key: string) => void;
  removeFromPlan: (key: string) => void;
  skip: (id: string, label: string) => void;
  unskip: (id: string) => void;
  toggleGame: (id: string) => void;
  resetAll: () => void;
  dismissNotice: () => void;
};

function pushLog(log: LogEntry[], text: string): LogEntry[] {
  return [{ id: Math.random().toString(36).slice(2, 10), at: Date.now(), text }, ...log].slice(0, 30);
}

const memoryStorage = {
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
};

export const usePitlane = create<PitlaneState>()(
  persist(
    (set, get) => ({
      hydrated: false,
      onboarded: false,
      intent: "balanced",
      rig: defaultRig,
      marked: [],
      sample: false,
      plan: {},
      skipped: {},
      games: [],
      temps: { cpu: "", gpu: "" },
      customs: [],
      log: [],
      notice: null,
      setOnboarded: (onboarded) => set({ onboarded }),
      setIntent: (intent) => set({ intent }),
      updateRig: (patch) => set({ rig: { ...get().rig, ...patch } }),
      setTemps: (patch) => set({ temps: { ...get().temps, ...patch } }),
      toggleMark: (id) => {
        const marked = get().marked.includes(id) ? get().marked.filter((x) => x !== id) : [...get().marked, id];
        set({ marked, sample: false });
      },
      loadSample: () =>
        set({
          marked: [...SAMPLE_MARKS],
          sample: true,
          notice: "Example desk loaded. These ticks are a sample, not a scan of this computer.",
        }),
      clearMarks: () => set({ marked: [], sample: false, notice: "Cleared what you had marked. The plan is still there." }),
      addCustom: (name, note) => {
        const id = `custom-${Math.random().toString(36).slice(2, 8)}`;
        const trimmed = name.trim();
        if (!trimmed) return;
        set({
          customs: [...get().customs, { id, name: trimmed, note: note.trim() }],
          marked: [...get().marked, id],
          notice: `Added ${trimmed}. Pitlane does not know what it does, so any step stays cautious.`,
        });
      },
      removeCustom: (id) =>
        set({
          customs: get().customs.filter((c) => c.id !== id),
          marked: get().marked.filter((m) => m !== id),
        }),
      addToPlan: (item) => {
        if (get().plan[item.key]) {
          set({ notice: "Already on the plan." });
          return;
        }
        const next: PlanItem = { ...item, status: "planned", addedAt: Date.now() };
        set({
          plan: { ...get().plan, [item.key]: next },
          log: pushLog(get().log, `Added “${item.title}”. Nothing on the PC changed.`),
          notice: "Added to the plan. Nothing on this computer changed.",
        });
      },
      markDone: (key) => {
        const item = get().plan[key];
        if (!item) return;
        set({
          plan: { ...get().plan, [key]: { ...item, status: "done", doneAt: Date.now() } },
          log: pushLog(get().log, `Marked “${item.title}” done on your PC.`),
          notice: "Marked done. Pitlane only recorded your word.",
        });
      },
      undoDone: (key) => {
        const item = get().plan[key];
        if (!item) return;
        set({
          plan: { ...get().plan, [key]: { ...item, status: "planned", doneAt: undefined } },
          log: pushLog(get().log, `Moved “${item.title}” back to not done.`),
          notice: "Back on the to-do list. Windows settings you already changed stay changed until you undo them there.",
        });
      },
      removeFromPlan: (key) => {
        const item = get().plan[key];
        if (!item) return;
        const plan = { ...get().plan };
        delete plan[key];
        set({
          plan,
          log: pushLog(get().log, `Removed “${item.title}” from the plan.`),
          notice: "Removed from the plan. If you already changed the PC, use the undo steps you saw on the card.",
        });
      },
      skip: (id, label) =>
        set({
          skipped: { ...get().skipped, [id]: Date.now() },
          log: pushLog(get().log, `Left ${label} as it is.`),
          notice: `${label} stays as it is.`,
        }),
      unskip: (id) => {
        const skipped = { ...get().skipped };
        delete skipped[id];
        set({ skipped });
      },
      toggleGame: (id) => {
        const games = get().games.includes(id) ? get().games.filter((g) => g !== id) : [...get().games, id];
        set({ games });
      },
      resetAll: () =>
        set({
          onboarded: true,
          intent: "balanced",
          rig: defaultRig,
          marked: [],
          sample: false,
          plan: {},
          skipped: {},
          games: [],
          temps: { cpu: "", gpu: "" },
          customs: [],
          log: pushLog([], "Cleared the Pitlane plan stored in this browser."),
          notice: "Pitlane’s notes in this browser were cleared. The PC was not changed.",
        }),
      dismissNotice: () => set({ notice: null }),
    }),
    {
      name: "pitlane-v1",
      skipHydration: true,
      storage: createJSONStorage(() => (typeof window === "undefined" ? memoryStorage : localStorage)),
      partialize: (state) => ({
        onboarded: state.onboarded,
        intent: state.intent,
        rig: state.rig,
        marked: state.marked,
        sample: state.sample,
        plan: state.plan,
        skipped: state.skipped,
        games: state.games,
        temps: state.temps,
        customs: state.customs,
        log: state.log,
      }),
      onRehydrateStorage: () => () => {
        usePitlane.setState({ hydrated: true });
      },
    },
  ),
);

export function useHydratePitlane() {
  return usePitlane.persist;
}
