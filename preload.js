const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electron", {
    // Existing methods
    listPorts: () => ipcRenderer.invoke("list-ports"),
    openPort: (port) => ipcRenderer.invoke("open-port", port),
    sendData: (data) => ipcRenderer.invoke("send-data", data),
    onSerialData: (callback) => {
        ipcRenderer.on("serial-data", (event, data) => callback(data));
        return () => ipcRenderer.removeAllListeners("serial-data");
    },
    onPortStatus: (callback) => {
        ipcRenderer.on("port-status", (event, status) => callback(status));
        return () => ipcRenderer.removeAllListeners("port-status");
    },
    getPortInfo: () => ipcRenderer.invoke("get-port-info"),
    onPortDisconnected: (callback) => {
        ipcRenderer.on("port-disconnected", () => callback());
        return () => ipcRenderer.removeAllListeners("port-disconnected");
    },
});
