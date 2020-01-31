import { app, BrowserWindow, screen, ipcMain } from 'electron'
import * as path from 'path';
import * as url from 'url';

let dbPath = process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + "/.local/share")

let db = require('diskdb')
let database = db.connect(dbPath + '/hornet/db', ['mousedata'])

let win, serve
const args = process.argv.slice(1)
serve = args.some(val => val === '--serve')

function createWindow () {

  win = new BrowserWindow({
    width: 300,
    height: 400,
    minWidth: 300,
    minHeight: 400,
    maxWidth: 300,
    maxHeight: 400,
    webPreferences: {
      nodeIntegration: true,
    },
    frame: false,
    center: true
  })
  if (serve) {
    require('electron-reload')(__dirname, {
      electron: require(`${__dirname}/node_modules/electron`)
    })
    win.loadURL('http://localhost:4200')
  } else {
    win.loadURL(url.format({
      pathname: path.join(__dirname, 'dist/index.html'),
      protocol: 'file:',
      slashes: true
    }));
  }

  win.show()

  win.on('closed', () => {
    win = null
  })

}

try {
  app.on('ready', createWindow)

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit()
    }
  })

  app.on('activate', () => {
    if (win === null) {
      createWindow()
    }
  })

} catch (e) {
  console.error(e)
}

ipcMain.on('mouseData', async (event, arg) => {
  database.mousedata.count() > 200 ? database.mousedata.remove() && db.connect(dbPath + '/hornet/db', ['mousedata']) : database.mousedata.save({ timestamp: Date.now(), data: arg })
})