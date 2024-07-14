const { app, BrowserWindow, ipcMain } = require("electron");
const { SerialPort } = require("serialport");

let mainWindow;
let activePort = null;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });

    //   mainWindow.loadURL("https://kmlesh.vercel.app/");
    mainWindow.loadURL("http://localhost:3000");

    mainWindow.webContents.openDevTools();

    mainWindow.on("closed", function () {
        mainWindow = null;
    });
}

app.on("ready", createWindow);
app.on("window-all-closed", function () {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on("activate", function () {
    if (mainWindow === null) {
        createWindow();
    }
});

// Get list of COM ports
ipcMain.handle("list-ports", async () => {
    try {
        const ports = await SerialPort.list();
        console.log("ports ==> ", ports);
        return ports;
    } catch (error) {
        console.error("Error listing ports:", error);
        throw error;
    }
});

// Manage serial port connections
ipcMain.handle("open-port", async (event, portPath) => {
    console.log("Opening port:", portPath);

    if (!portPath) {
        throw new Error("No port path provided");
    }

    if (activePort) {
        if (activePort.path === portPath) {
            return "Port already opened";
        }
        activePort.close((err) => {
            if (err) console.error("Error closing previous port:", err);
        });
        activePort = null;
    }

    activePort = new SerialPort({
        path: portPath,
        baudRate: 9600,
    });

    activePort.on("data", (data) => {
        console.log("Data received:", data.toString());
        mainWindow.webContents.send("serial-data", data.toString());
    });

    activePort.on("error", (err) => {
        console.error("Serial port error:", err);
    });

    return "Port opened successfully";
});

ipcMain.handle("send-data", async (event, portPath, data) => {
    if (!activePort || activePort.path !== portPath) {
        throw new Error("Port is not opened");
    }

    return new Promise((resolve, reject) => {
        activePort.write(data, (err) => {
            if (err) {
                console.error("Error sending data:", err);
                return reject(err);
            }
            console.log("Data sent:", data);
            resolve("Data sent successfully");
        });
    });
});

ipcMain.handle("close-port", async (event) => {
    if (activePort) {
        return new Promise((resolve, reject) => {
            activePort.close((err) => {
                if (err) {
                    console.error("Error closing port:", err);
                    return reject(err);
                }
                activePort = null;
                resolve("Port closed successfully");
            });
        });
    } else {
        return "No active port to close";
    }
});
