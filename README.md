# Pitlane

Pre-session PC prep for games.

Pitlane explains common background software, separates safe reversible steps from advanced or risky ones, and builds a checklist you approve yourself. It does not close programs, edit Windows, read temperatures, or promise a higher frame rate.

## What it is

A local web app. Open it, mark what is actually running, and keep a plan in the browser. Every action is a written step you perform. Removing a step from the plan does not roll back a change you already made on the PC. Those cards include their own undo.

## What it will not do

- Disable antivirus, firewall, Windows Update, or anti-cheat
- Kill Explorer, Desktop Window Manager, or audio services
- Recommend registry cleaners, driver-updater sites, or “booster” downloads
- Disable the page file or SysMain as a frame-rate trick
- Pretend a catalog tick is a live process scan

## Run

```bash
npm install
npm run dev
```

Then open the local address Vite prints. `npm run build` typechecks and writes `dist/`.

The plan is stored in `localStorage` under `pitlane-v1` on that origin. Clearing site data, or **Clear Pitlane notes** inside Limits, removes it.

## Layout

- `src/pitlane` — catalog, plan store, and screens
- `src/main.tsx` — browser entry
- Bay shows only what the browser can honestly measure, and labels the rest as not measured

No account. No telemetry service. No installer that changes the operating system.
