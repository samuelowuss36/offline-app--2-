
console.log(">>> ELECTRON MAIN.CJS LOADED <<<")

const { app, BrowserWindow, ipcMain } = require("electron")
const path = require("path")
const fs = require("fs")
const os = require("os")
const express = require("express")

const dbDir = path.join(os.homedir(), ".possystem111")

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true })
}

// Set the user data path to ensure IndexedDB persistence
app.setPath('userData', dbDir)
console.log('>>> User data path set to:', app.getPath('userData'))

let server = null

function createWindow() {
  // Start local server for static files
  const expressApp = express()
  const outPath = path.join(__dirname, "../out")

  expressApp.use(express.static(outPath))
  expressApp.get("*", (req, res) => {
    res.sendFile(path.join(outPath, "index.html"))
  })

  server = expressApp.listen(0, () => {
    const port = server.address().port
    console.log(`>>> Local server started on port ${port} <<<`)

    const win = new BrowserWindow({
      width: 800,
      height: 600,
      webPreferences: {
        contextIsolation: true,
        preload: path.join(__dirname, "preload.cjs"),
      },
    })

    win.loadURL(`http://localhost:${port}`)

    win.on("closed", () => {
      if (server) {
        server.close()
        server = null
      }
    })
  })
}

app.whenReady().then(createWindow)

app.on("window-all-closed", () => {
  if (server) {
    server.close()
    server = null
  }
  if (process.platform !== "darwin") {
    app.quit()
  }
})

ipcMain.handle("get-db-path", () => dbDir)
