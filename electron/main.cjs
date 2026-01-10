
console.log(">>> ELECTRON MAIN.CJS LOADED <<<")

const { app, BrowserWindow, ipcMain } = require("electron")
const path = require("path")
const fs = require("fs")
const os = require("os")

const dbDir = path.join(os.homedir(), ".possystem111")

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true })
}

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      contextIsolation: true,
      preload: path.join(__dirname, "preload.cjs"),
    },
  })

win.loadFile(
  path.join(__dirname, "../out/index.html")
);


}

app.whenReady().then(createWindow)

ipcMain.handle("get-db-path", () => dbDir)
