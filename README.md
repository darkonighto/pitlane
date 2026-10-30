# Pitlane

Pre-session PC prep for games, as a Windows app.

Pitlane explains common background software, separates safe reversible steps from advanced or risky ones, and builds a checklist you approve yourself. The Windows app can read program names when you click **Read running programs**. It does not close programs, edit Windows, read temperatures, or promise a higher frame rate.

## What it will not do

- Close, disable, or uninstall anything
- Disable antivirus, firewall, Windows Update, or anti-cheat
- Kill Explorer, Desktop Window Manager, or audio services
- Recommend registry cleaners, driver-updater sites, or booster downloads
- Disable the page file or SysMain as a frame-rate trick
- Treat a name match as a live measurement of load or FPS

## Windows app

Requires Node.js 22 or newer.

```bash
npm install
npm run pack:win
```

The build is `release/Pitlane-win32-x64/Pitlane.exe`. It is a portable app: no installer, and it does not need administrator rights. The plan is stored for that window, on this PC, until you clear it from Limits.

`npm run desktop` builds the interface and opens it on the machine you are using, for development.

A name match only means the program's file name is one Pitlane knows. Renamed apps and anything not in the catalog stay unmatched. Protected items (Explorer, audio, Defender, anti-cheat, and similar) can show as running and still have no close action.

## Browser

`npm run dev` opens the same desk in a browser. That page cannot see the process list. Tick the catalog yourself, or load the example desk.

## Layout

- `src/pitlane` — catalog, plan, and screens
- `electron/` — the Windows window. The only system call is a read of process names.
- `src/main.tsx` — interface entry

No account. No telemetry service. No installer that changes the operating system.
