const { app, BrowserWindow, Menu, ipcMain } = require('electron')
const path = require('path')
const fs = require('fs')
const os = require('os')

let mainWindow
const dbDir = path.join(os.homedir(), '.possystem111')

// Ensure database directory exists
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true })
}

// Initialize app after resolving ESM-only dependencies
;(async () => {
  let isDev = false

  try {
    const mod = await import('electron-is-dev')
    isDev = mod && (mod.default ?? mod)
  } catch (err) {
    console.warn('[v0] Could not load `electron-is-dev` via dynamic import, falling back to env check:', err)
    isDev = process.env.NODE_ENV === 'development' || process.argv.includes('--dev')
  }

  const isProduction = !isDev

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
        preload: path.join(__dirname, 'preload.js'),
      },
      icon: path.join(__dirname, 'icon.ico'),
    })

    const startUrl = isProduction
      ? `file://${path.join(__dirname, "../.next/server/app.html")}`
      : 'http://localhost:3000'

    mainWindow.loadURL(startUrl)

    if (!isProduction) {
      mainWindow.webContents.openDevTools()
    }

    mainWindow.on('closed', () => {
      mainWindow = null
    })
  }

  // App lifecycle
  app.whenReady().then(() => {
    createWindow()
    createMenu()
  })

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
  })

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })

  // Menu
  function createMenu() {
    const template = [
      {
        label: 'File',
        submenu: [
          {
            label: 'Exit',
            accelerator: 'CmdOrCtrl+Q',
            click: () => app.quit(),
          },
        ],
      },
      {
        label: 'Edit',
        submenu: [
          { role: 'undo' },
          { role: 'redo' },
          { type: 'separator' },
          { role: 'cut' },
          { role: 'copy' },
          { role: 'paste' },
        ],
      },
      {
        label: 'Help',
        submenu: [
          {
            label: 'About',
            click: () => {},
          },
        ],
      },
    ]

    Menu.setApplicationMenu(Menu.buildFromTemplate(template))
  }

  // IPC
  ipcMain.handle('get-db-path', () => dbDir)
  ipcMain.handle('get-app-data-path', () => dbDir)
})().catch(err => {
  console.error('[v0] Error during Electron main init:', err)
})
