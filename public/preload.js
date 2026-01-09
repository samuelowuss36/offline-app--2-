import { contextBridge, ipcRenderer } from "electron"

contextBridge.exposeInMainWorld("api", {
  getDbPath: () => ipcRenderer.invoke("get-db-path"),
})
