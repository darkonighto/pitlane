const { app, BrowserWindow, Menu, dialog, ipcMain, shell } = require("electron");
const path = require("path");
const { execFile } = require("child_process");

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) app.quit();

app.setAppUserModelId("com.pitlane.desk");

function createWindow() {
  const win = new BrowserWindow({
    width: 1180,
    height: 800,
    minWidth: 880,
    minHeight: 620,
    backgroundColor: "#0c0d10",
    title: "Pitlane",
    show: false,
    autoHideMenuBar: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  win.once("ready-to-show", () => win.show());

  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("https://") || url.startsWith("http://")) shell.openExternal(url);
    return { action: "deny" };
  });

  win.webContents.on("will-navigate", (event, url) => {
    const dev = process.env.PITLANE_DEV_URL;
    if (dev && url.startsWith(dev)) return;
    if (url.startsWith("file:")) return;
    event.preventDefault();
  });

  const dev = process.env.PITLANE_DEV_URL;
  if (dev) void win.loadURL(dev);
  else void win.loadFile(path.join(__dirname, "../dist/index.html"));

  return win;
}

function parseCsvNames(csv) {
  const processes = [];
  for (const line of csv.split(/\r?\n/)) {
    const match = line.trim().match(/^"([^"]+)","(\d+)"/);
    if (!match || match[1] === "ProcessName") continue;
    processes.push({ name: match[1], pid: Number(match[2]) });
  }
  return processes;
}

function readProcesses() {
  return new Promise((resolve, reject) => {
    if (process.platform === "win32") {
      execFile(
        "powershell.exe",
        [
          "-NoProfile",
          "-NonInteractive",
          "-Command",
          "Get-Process | Select-Object ProcessName,Id | ConvertTo-Csv -NoTypeInformation",
        ],
        { windowsHide: true, timeout: 20000, maxBuffer: 8 * 1024 * 1024 },
        (err, stdout) => {
          if (!err && stdout) {
            const processes = parseCsvNames(String(stdout));
            if (processes.length > 0) {
              resolve({ at: Date.now(), platform: "win32", processes });
              return;
            }
          }
          execFile(
            "tasklist",
            ["/FO", "CSV", "/NH"],
            { windowsHide: true, timeout: 15000, maxBuffer: 8 * 1024 * 1024 },
            (taskErr, taskOut) => {
              if (taskErr) {
                reject(new Error("Could not read program names."));
                return;
              }
              resolve({ at: Date.now(), platform: "win32", processes: parseCsvNames(String(taskOut)) });
            },
          );
        },
      );
      return;
    }

    execFile("ps", ["-ax", "-o", "pid=,comm="], { timeout: 8000, maxBuffer: 4 * 1024 * 1024 }, (err, stdout) => {
      if (err) {
        reject(new Error("ps failed"));
        return;
      }
      const processes = [];
      for (const line of String(stdout).split("\n")) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        const space = trimmed.indexOf(" ");
        if (space < 1) continue;
        const pid = Number(trimmed.slice(0, space));
        let name = trimmed.slice(space).trim();
        if (name.includes("/")) name = name.slice(name.lastIndexOf("/") + 1);
        if (!name || !Number.isFinite(pid)) continue;
        processes.push({ name, pid });
      }
      resolve({ at: Date.now(), platform: process.platform, processes });
    });
  });
}

ipcMain.handle("pitlane:read-processes", () => readProcesses());

function installMenu() {
  const menu = Menu.buildFromTemplate([
    {
      label: "File",
      submenu: [{ role: "quit" }],
    },
    {
      label: "View",
      submenu: [
        { role: "reload" },
        { role: "togglefullscreen" },
        { type: "separator" },
        { role: "resetzoom" },
        { role: "zoomin" },
        { role: "zoomout" },
      ],
    },
    {
      label: "Help",
      submenu: [
        {
          label: "About Pitlane",
          click: () => {
            dialog.showMessageBox({
              type: "info",
              title: "Pitlane",
              message: "Pitlane",
              detail:
                "Session prep for games. Pitlane can read program names when you ask on Review. It does not close programs, edit Windows, or promise a higher frame rate.",
            });
          },
        },
      ],
    },
  ]);
  Menu.setApplicationMenu(menu);
}

app.whenReady().then(() => {
  installMenu();
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("second-instance", () => {
  const win = BrowserWindow.getAllWindows()[0];
  if (!win) return;
  if (win.isMinimized()) win.restore();
  win.focus();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
