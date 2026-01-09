import { contextBridge, ipcRenderer } from "electron"

contextBridge.exposeInMainWorld("electronAPI", {
  getDbPath: () => ipcRenderer.invoke("get-db-path"),
  getAppDataPath: () => ipcRenderer.invoke("get-app-data-path"),
})
