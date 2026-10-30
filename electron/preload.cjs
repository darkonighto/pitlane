const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("pitlaneDesktop", {
  readProcesses: () => ipcRenderer.invoke("pitlane:read-processes"),
});
