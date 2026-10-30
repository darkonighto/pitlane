/// <reference types="vite/client" />

interface PitlaneDesktopApi {
  readProcesses: () => Promise<{
    at: number;
    platform: string;
    processes: { name: string; pid: number }[];
  }>;
}

interface Window {
  pitlaneDesktop?: PitlaneDesktopApi;
}
