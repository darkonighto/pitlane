export type HostProcess = { name: string; pid: number };

export type HostSnapshot = {
  at: number;
  platform: string;
  processes: HostProcess[];
};

export type HostMatch = {
  id: string;
  names: string[];
  count: number;
};

export type HostReport = {
  at: number;
  platform: string;
  matches: HostMatch[];
  others: { name: string; count: number }[];
  otherCount: number;
  systemCount: number;
};

/** Image names we know belong to a catalog card. Matching is by name only. */
const EXECUTABLES: Record<string, string[]> = {
  discord: ["Discord.exe", "Discord"],
  chrome: ["chrome.exe", "msedge.exe", "firefox.exe", "brave.exe", "opera.exe", "Chrome", "msedge", "firefox", "brave", "opera"],
  spotify: ["Spotify.exe", "spotify"],
  steam: ["steam.exe", "steamwebhelper.exe", "steam"],
  epic: ["EpicGamesLauncher.exe", "EpicWebHelper.exe"],
  ea: ["EADesktop.exe", "EABackgroundService.exe", "Origin.exe"],
  ubisoft: ["upc.exe", "UplayWebCore.exe"],
  battle: ["Battle.net.exe"],
  "nvidia-app": ["NVIDIA Overlay.exe", "NVIDIA Share.exe", "NVIDIA App.exe", "GeForceExperience.exe", "nvcontainer.exe"],
  amd: ["RadeonSoftware.exe", "AMDRSSrcExt.exe", "amdow.exe"],
  "game-bar": ["GameBar.exe", "GameBarFTServer.exe"],
  "wallpaper-engine": ["wallpaper32.exe", "wallpaper64.exe"],
  overwolf: ["Overwolf.exe", "OverwolfBrowser.exe"],
  obs: ["obs64.exe", "obs32.exe", "obs"],
  icue: ["iCUE.exe", "RazerAppEngine.exe", "ArmouryCrate.UserSessionHelper.exe"],
  afterburner: ["MSIAfterburner.exe", "RTSS.exe"],
  onedrive: ["OneDrive.exe", "Dropbox.exe", "GoogleDriveFS.exe"],
  teams: ["Teams.exe", "ms-teams.exe", "slack.exe", "Zoom.exe"],
  adobe: ["Creative Cloud.exe", "Adobe Desktop Service.exe", "CCXProcess.exe"],
  phone: ["PhoneExperienceHost.exe"],
  search: ["SearchIndexer.exe"],
  explorer: ["explorer.exe"],
  dwm: ["dwm.exe"],
  audio: ["audiodg.exe"],
  defender: ["MsMpEng.exe", "SecurityHealthService.exe", "SecurityHealthSystray.exe"],
  anticheat: ["vgc.exe", "vgtray.exe", "EasyAntiCheat.exe", "EasyAntiCheat_EOS.exe", "BEService.exe"],
  core: ["csrss.exe", "wininit.exe", "lsass.exe", "services.exe", "smss.exe"],
};

const SYSTEM = new Set([
  "svchost",
  "registry",
  "fontdrvhost",
  "sihost",
  "ctfmon",
  "taskhostw",
  "runtimebroker",
  "dllhost",
  "conhost",
  "wmiprvse",
  "searchhost",
  "startmenuexperiencehost",
  "system",
  "system idle process",
  "idle",
  "secure system",
  "memory compression",
  "winlogon",
  "lsaiso",
  "spoolsv",
  "dashost",
  "unsecapp",
  "applicationframehost",
  "textinputhost",
  "widgetservice",
  "widgets",
  "shellexperiencehost",
  "lockapp",
  "aggregatorhost",
  "backgroundtaskhost",
  "comppkgsrv",
  "mousocoreworker",
]);

function normalize(name: string) {
  return name.trim().toLowerCase().replace(/\.exe$/, "");
}

const BY_NAME = new Map<string, string>();
for (const [id, names] of Object.entries(EXECUTABLES)) {
  for (const name of names) BY_NAME.set(normalize(name), id);
}

export function getDesktop() {
  if (typeof window === "undefined") return null;
  return window.pitlaneDesktop ?? null;
}

export function matchHost(snap: HostSnapshot): HostReport {
  const grouped = new Map<string, HostMatch>();
  const other = new Map<string, number>();
  let systemCount = 0;

  for (const proc of snap.processes) {
    const key = normalize(proc.name);
    if (!key) continue;
    const id = BY_NAME.get(key);
    if (id) {
      const row = grouped.get(id) ?? { id, names: [], count: 0 };
      if (!row.names.includes(proc.name)) row.names.push(proc.name);
      row.count += 1;
      grouped.set(id, row);
      continue;
    }
    if (SYSTEM.has(key)) {
      systemCount += 1;
      continue;
    }
    other.set(proc.name, (other.get(proc.name) ?? 0) + 1);
  }

  const others = [...other.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 8)
    .map(([name, count]) => ({ name, count }));

  return {
    at: snap.at,
    platform: snap.platform,
    matches: [...grouped.values()].sort((a, b) => a.id.localeCompare(b.id)),
    others,
    otherCount: other.size,
    systemCount,
  };
}
