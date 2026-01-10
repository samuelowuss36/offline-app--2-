const { contextBridge, ipcRenderer } = require("electron")

contextBridge.exposeInMainWorld("api", {
  getDbPath: () => ipcRenderer.invoke("get-db-path"),
})
