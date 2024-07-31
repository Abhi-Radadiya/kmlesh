const { app, BrowserWindow, ipcMain, screen } = require("electron");

const path = require("path");
const ExcelJS = require("exceljs");
const fs = require("fs");
const { SerialPort } = require("serialport");

const logFilePath = path.join(__dirname, "action_log.xlsx");

let workbook;
let worksheet;

if (fs.existsSync(logFilePath)) {
    workbook = new ExcelJS.Workbook();
    workbook.xlsx.readFile(logFilePath).then(() => {
        worksheet = workbook.getWorksheet(1);
    });
} else {
    workbook = new ExcelJS.Workbook();
    worksheet = workbook.addWorksheet("Action Log");
    worksheet.columns = [
        { header: "Timestamp", key: "timestamp", width: 30 },
        { header: "Action", key: "action", width: 30 },
        { header: "Details", key: "details", width: 50 },
    ];
}

const logAction = async (action, details, color) => {
    const timestamp = new Date().toISOString();

    worksheet.addRow({
        timestamp,
        action,
        details,
    });

    const row = worksheet.lastRow;
    row.getCell(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFFF00" } };
    row.getCell(2).fill = { type: "pattern", pattern: "solid", fgColor: { argb: color } };
    row.getCell(3).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFFF00" } };

    await workbook.xlsx.writeFile(logFilePath);
};

ipcMain.handle("log-action", async (event, { action, details, color }) => {
    await logAction(action, details, color);
});

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

// Manage serial port connections
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
