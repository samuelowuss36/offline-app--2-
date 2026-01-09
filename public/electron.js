import { app, BrowserWindow, Menu, ipcMain } from "electron"
import path from "path"
import isDev from "electron-is-dev"
import fs from "fs"
import os from "os"
import { fileURLToPath } from "url"
const electron = await import('electron')

async function start() {
  const { app, BrowserWindow } = await import('electron')
}
start()


const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

let mainWindow
const isProduction = !isDev
const dbDir = path.join(os.homedir(), ".possystem111")

// Ensure database directory exists
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true })
}

// Create the browser window
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
    icon: path.join(__dirname, "icon.ico"),
  })

  const startUrl = isProduction ? `file://${path.join(__dirname, "../.next/server/app.html")}` : "http://localhost:3000"

  mainWindow.loadURL(startUrl)

  if (!isProduction) {
    mainWindow.webContents.openDevTools()
  }

  mainWindow.on("closed", () => {
    mainWindow = null
  })
}

// App event listeners
app.on("ready", createWindow)

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit()
  }
})

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow()
  }
})

// Menu
const createMenu = () => {
  const template = [
    {
      label: "File",
      submenu: [
        {
          label: "Exit",
          accelerator: "CmdOrCtrl+Q",
          click: () => {
            app.quit()
          },
        },
      ],
    },
    {
      label: "Edit",
      submenu: [
        { role: "undo" },
        { role: "redo" },
        { type: "separator" },
        { role: "cut" },
        { role: "copy" },
        { role: "paste" },
      ],
    },
    {
      label: "Help",
      submenu: [
        {
          label: "About",
          click: () => {
            // About dialog
          },
        },
      ],
    },
  ]

  Menu.setApplicationMenu(Menu.buildFromTemplate(template))
}

app.on("ready", createMenu)

// IPC handlers for database operations
ipcMain.handle("get-db-path", () => {
  return dbDir
})

ipcMain.handle("get-app-data-path", () => {
  return path.join(os.homedir(), ".possystem111")
})
