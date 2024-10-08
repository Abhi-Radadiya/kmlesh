const { app, BrowserWindow, ipcMain, screen } = require("electron");

const path = require("path");
const { SerialPort } = require("serialport");

let mainWindow;
let activePort = null;

async function createWindow() {
    const primaryDisplay = screen.getPrimaryDisplay();
    let screenDimention = primaryDisplay.workAreaSize;

    mainWindow = new BrowserWindow({
        width: screenDimention.width,
        height: screenDimention.height,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            contextIsolation: true,
            enableRemoteModule: false,
        },
    });

    mainWindow.loadURL("http://localhost:3000");

    // mainWindow.loadURL("https://kmlesh.vercel.app/");

    mainWindow.webContents.openDevTools();

    mainWindow.on("closed", function () {
        mainWindow = null;
    });
}

app.on("ready", createWindow);

app.on("activate", function () {
    if (mainWindow === null) {
        createWindow();
    }
});

app.on("window-all-closed", function () {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

ipcMain.handle("list-ports", async () => {
    try {
        const ports = await SerialPort.list();
        return ports;
    } catch (error) {
        console.error("Error listing ports:", error);
        throw error;
    }
});

ipcMain.handle("get-port-info", async () => {
    try {
        const ports = await SerialPort.list();
        const selectedPort = activePort ? activePort.path : null;
        return { ports, selectedPort };
    } catch (error) {
        console.error("Error fetching port info:", error);
        throw error;
    }
});

ipcMain.handle("open-port", async (event, portPath) => {
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

    activePort.on("close", () => {
        console.log("Port closed", activePort);
        mainWindow.webContents.send("port-disconnected");
        activePort = null;
    });

    activePort.on("error", (err) => {
        console.error("Serial port error:", err);
    });

    return "Port opened successfully";
});

ipcMain.handle("send-data", async (event, data) => {
    if (!activePort) {
        throw new Error("Port is not opened");
    }

    return new Promise((resolve, reject) => {
        activePort.write(`${data}\n`, (err) => {
            if (err) {
                console.error("Error sending data:", err);
                return reject(err);
            }
            console.log("Data sent:", data);
            resolve("Data sent successfully");
        });
    });
});
