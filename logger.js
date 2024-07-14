// logger.js
const ExcelJS = require("exceljs");
const fs = require("fs");
const path = require("path");

const logFilePath = path.join(__dirname, "action_log.xlsx");

// Create a new workbook and worksheet if it doesn't exist
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

const logPortSelection = (port) => logAction("Port Selection", `Port: ${port}`, "FFFF0000");
const logOpenPort = (port) => logAction("Open Port", `Port: ${port}`, "FF00FF00");
const logClosePort = () => logAction("Close Port", "Port closed", "FFFFA500");
const logUpload = (fileName) => logAction("Upload", `File: ${fileName}`, "FF0000FF");
const logSave = () => logAction("Save", "File saved", "FF00FFFF");
const logRun = () => logAction("Run", "Execution started", "FF008000");
const logPause = () => logAction("Pause", "Execution paused", "FF800080");
const logStop = () => logAction("Stop", "Execution stopped", "FFFF00FF");
const logThreshold = (threshold) => logAction("Enter Threshold", `Threshold: ${threshold}`, "FFFFE135");

module.exports = {
    logPortSelection,
    logOpenPort,
    logClosePort,
    logUpload,
    logSave,
    logRun,
    logPause,
    logStop,
    logThreshold,
};
