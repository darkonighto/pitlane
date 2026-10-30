import { useEffect, useState } from "react";

export type Snapshot = {
  cores: number;
  deviceMemory: number | null;
  platform: string;
  screen: string;
  dpr: number;
  gpu: string | null;
  network: string | null;
  battery: string | null;
  storage: string | null;
  fps: number | null;
  frameMs: number | null;
  samples: number[];
};

type NavigatorExtras = Navigator & {
  deviceMemory?: number;
  connection?: { effectiveType?: string; downlink?: number; rtt?: number };
  userAgentData?: { platform?: string };
  getBattery?: () => Promise<{ level: number; charging: boolean }>;
};

function gpuString(): string | null {
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl");
    if (!gl) return null;
    const ext = gl.getExtension("WEBGL_debug_renderer_info");
    if (!ext) return null;
    const value = gl.getParameter(ext.UNMASKED_RENDERER_WEBGL);
    return typeof value === "string" && value.trim() ? value.trim() : null;
  } catch {
    return null;
  }
}

export function useSnapshot(): Snapshot | null {
  const [snap, setSnap] = useState<Snapshot | null>(null);

  useEffect(() => {
    const nav = navigator as NavigatorExtras;
    const base: Snapshot = {
      cores: nav.hardwareConcurrency || 0,
      deviceMemory: typeof nav.deviceMemory === "number" ? nav.deviceMemory : null,
      platform: nav.userAgentData?.platform || nav.platform || "Unknown",
      screen: `${window.screen.width}×${window.screen.height}`,
      dpr: window.devicePixelRatio || 1,
      gpu: gpuString(),
      network: null,
      battery: null,
      storage: null,
      fps: null,
      frameMs: null,
      samples: [],
    };
    if (nav.connection) {
      const parts = [nav.connection.effectiveType, nav.connection.downlink ? `${nav.connection.downlink} Mb/s` : null, nav.connection.rtt ? `${nav.connection.rtt} ms rtt` : null].filter(Boolean);
      base.network = parts.join(" · ") || null;
    }
    setSnap(base);

    let stopped = false;
    void nav.getBattery?.().then((b) => {
      if (stopped) return;
      setSnap((s) => (s ? { ...s, battery: `${Math.round(b.level * 100)}% · ${b.charging ? "charging" : "on battery"}` } : s));
    });
    void navigator.storage?.estimate().then((est) => {
      if (stopped || !est.quota) return;
      const used = est.usage ?? 0;
      const gb = (n: number) => `${(n / 1024 / 1024 / 1024).toFixed(1)} GB`;
      setSnap((s) => (s ? { ...s, storage: `${gb(used)} of ${gb(est.quota ?? 0)} browser quota` } : s));
    });
    let frames = 0;
    let last = performance.now();
    let acc = 0;
    const samples: number[] = [];
    let raf = 0;
    const loop = (t: number) => {
      if (stopped) return;
      const dt = t - last;
      last = t;
      if (dt > 0 && dt < 250) {
        frames += 1;
        acc += dt;
        samples.push(Math.min(dt, 50));
        if (samples.length > 48) samples.shift();
      }
      if (acc >= 500) {
        const fps = Math.round((frames * 1000) / acc);
        const frameMs = acc / frames;
        setSnap((s) => (s ? { ...s, fps, frameMs, samples: samples.slice() } : s));
        frames = 0;
        acc = 0;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      stopped = true;
      cancelAnimationFrame(raf);
    };
  }, []);

  return snap;
}
