'use strict'

import { app, protocol, BrowserWindow, Menu, shell, dialog } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'
const isDevelopment = process.env.NODE_ENV !== 'production'

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
])

async function createWindow() {
  // Create the browser window.
  // 创建浏览器窗口
  const win = new BrowserWindow({
    title:"MrDoc桌面客户端",
    width: 1000,
    height: 800,
    minWidth: 1000,
    minHeight: 800,
    icon: 'resources/icon/logo.png',
    webPreferences: {
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
      // nodeIntegration: true,
      contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION,
      // contextIsolation:false,
      enableRemoteModule: true,
    },
  })

  // 创建菜单
  const MenuItem = [
    {
      label:"选项",
      submenu:[
        {
          label:"配置",
          click(){
            win.webContents.send('href','Options')
          }
        },
        {
          label:"退出",
          click(){
            win.close();
          }
        }
      ]
    },
    {
      label:"帮助",
      submenu:[
        {
          label:"官网",
          click(){
            shell.openExternal("https://mrdoc.pro")
          }
        },
        {
          label:"检查更新",
          click(){
            
          }
        },
        {
          label:"问题反馈",
          click(){
            shell.openExternal("http://shang.qq.com/wpa/qunwpa?idkey=143c23a4ffbd0ba9137d2bce3ee86c83532c05259a0542a69527e36615e64dba")
          }
        },
        {
          label:"关于",
          click(){

          },
        }
      ]
    }
  ];
  
  Menu.setApplicationMenu(Menu.buildFromTemplate(MenuItem))

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    if (!process.env.IS_TEST) win.webContents.openDevTools()
  } else {
    createProtocol('app')
    // Load the index.html when not in development
    win.loadURL('app://./index.html')
  }

  // 侦听关闭事件，弹出确认框
  win.on('close',(e)=>{
    console.log("关闭事件")
    e.preventDefault();
    dialog.showMessageBox({
      type:'info',
      title:"提示",
      defaultId:0,
      message:"确定要退出MrDoc桌面客户端？",
      buttons:['取消','退出'],
    })
    .then((index)=>{
      console.log(index)
      if(index.response === 1){
        // win = null;
        app.exit();
      }
    })
  })
}

// Quit when all windows are closed.
// 当所有窗口关闭时退出
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
// Electron 启动完成后做的事情
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS_DEVTOOLS)
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString())
    }
  }
  createWindow()
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}
