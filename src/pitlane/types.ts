export type Intent = "competitive" | "balanced" | "quality" | "streaming";
export type OsId = "unknown" | "windows" | "linux" | "mac" | "deck";
export type Impact = "low" | "medium" | "high";
export type Safety = "safe" | "caution" | "advanced";
export type Platform = "windows" | "linux" | "mac" | "deck";

export type StepAction = {
  id: string;
  title: string;
  safety: Safety;
  summary: string;
  steps: string[];
  undo: string[];
};

export type ProcessEntry = {
  id: string;
  name: string;
  vendor: string;
  category: string;
  purpose: string;
  gameEffect: string;
  typicalImpact: Impact;
  impactNote: string;
  protected?: boolean;
  protectedReason?: string;
  actions: StepAction[];
  platforms: Platform[];
};

export type AdviceEntry = {
  id: string;
  title: string;
  area: string;
  safety: Safety;
  summary: string;
  detail: string;
  benefit: string;
  steps: string[];
  undo: string[];
  intents: Intent[];
  platforms: Array<Platform | "any">;
  offer: boolean;
};

export type GameSetting = {
  id: string;
  name: string;
  suggestion: string;
  why: string;
  safety: Safety;
  steps: string[];
  undo: string[];
};

export type GameGuide = {
  id: string;
  title: string;
  genre: string;
  blurb: string;
  settings: GameSetting[];
};

export type Rig = {
  os: OsId;
  form: "desktop" | "laptop";
  cpu: string;
  gpu: string;
  ram: "unknown" | "8" | "16" | "32" | "64";
  storage: "unknown" | "ssd" | "hdd" | "mixed";
  refresh: "unknown" | "60" | "120" | "144" | "165" | "240" | "360";
  streams: boolean;
};

export type PlanItem = {
  key: string;
  title: string;
  summary: string;
  steps: string[];
  undo: string[];
  safety: Safety;
  area: string;
  status: "planned" | "done";
  addedAt: number;
  doneAt?: number;
};

export type CustomApp = {
  id: string;
  name: string;
  note: string;
};

export type LogEntry = {
  id: string;
  at: number;
  text: string;
};

export type ViewId = "bay" | "review" | "advice" | "games" | "plan" | "machine" | "limits";
