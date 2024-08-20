// 导入模块
const { app, BrowserWindow } = require('electron')
const path = require('path')
// 创建主窗口
const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true, //开启true这一步很重要,目的是为了vue文件中可以引入node和electron相关的API
      contextIsolation: false, // 可以使用require方法
      enableRemoteModule: true, // 可以使用remote方法

    }
  })
 
  // 和自己本地vue项目启动的地址保持一致 
//   mainWindow.loadURL('http://10.202.32.85:3001')
//   mainWindow.loadURL('http://localhost:3001/')
  let env = 'pub';
  // 配置热更新
  if (env == 'pro') {
    // const elePath = path.join(__dirname, '../node_modules/electron')
    // require('electron-reload')('./', {
    //   electron: require(elePath),
    // })
    // 热更新监听窗口，这里是vue启动时的地址
    mainWindow.loadURL('http://localhost:3001')
    // 打开开发工具
    // mainWindow.webContents.openDevTools()
  } else {
    // 生产环境中要加载文件 index.html
    mainWindow.loadFile(path.resolve(__dirname, '../dist/index.html'))
  }
}
 
// 应用准备就绪，加载窗口
app.whenReady().then(() => {
  createWindow()
 
  // mac 上默认保留一个窗口
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})
 
// 关闭所有窗口 ： 程序退出 ： windows & linux
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})