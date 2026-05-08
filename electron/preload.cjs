const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('jobdone', {
  read: () => ipcRenderer.invoke('store:read'),
  write: (data) => ipcRenderer.invoke('store:write', data),
  hide: () => ipcRenderer.invoke('window:close'),
  minimize: () => ipcRenderer.invoke('window:minimize'),
  setAlwaysOnTop: (flag) => ipcRenderer.invoke('window:set-always-on-top', flag),
});
