const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electron", {
    listPorts: () => ipcRenderer.invoke("list-ports"),
    openPort: (port) => ipcRenderer.invoke("open-port", port),
    sendData: (data) => ipcRenderer.invoke("send-data", data),
    closePort: () => ipcRenderer.invoke("close-port"),
    // onSerialData: (callback) => ipcRenderer.on("serial-data", callback),
    onSerialData: (callback) => {
        ipcRenderer.on("serial-data", (event, data) => callback(data));
        return () => ipcRenderer.removeAllListeners("serial-data");
    },
    logAction: (action, details, color) => ipcRenderer.invoke("log-action", { action, details, color }),
});
