import React, { useEffect, useState } from "react";

function ButtonComponent(props) {
    const { handleClickRun, selectedPort, setSelectedPort, thresholdValue, setThresholdValue, errors, setErrors, currentExeCmd, handleSave, handlePause, handleStop } = props;

    const [ports, setPorts] = useState([]);

    useEffect(() => {
        const fetchPorts = async () => {
            const availablePorts = await window.electron.listPorts();
            setPorts(availablePorts);
        };

        fetchPorts();
    }, []);

    const onSelectPort = async (port) => {
        setErrors((prevState) => {
            const { port, ...rest } = prevState;
            return { ...rest };
        });
        setSelectedPort(port);
        window.electron.logAction("Port Selection", `Port: ${port}`, "FFFFFF");
        handleClosePort();
        openPort(port);
    };

    const openPort = async (port) => {
        try {
            const response = await window.electron.openPort(port);
            console.log(response, port);
            window.electron.logAction("Open Port", `Port: ${port}`, "FF00FF00");
        } catch (error) {
            // action, details, color
            window.electron.logAction("Error : Open Port", `${port}`, "ff0000");
            console.log("Failed to open port:", error);
        }
    };

    const handleClosePort = async () => {
        try {
            const response = await window.electron.closePort();
            console.log(response);
            window.electron.logAction("Close Port", "Port closed", "FFFFFF");
        } catch (error) {
            window.electron.logAction("Error : Close Port", `${error}`, "ff0000");
            console.log("Failed to close port:", error);
        }
    };

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            window.electron.logAction("Upload", `File: ${file.name}`, "FFFFFF");
            props.handleFileUpload(event);
        }
    };

    const handleEnterThreshold = (threshold) => {
        setThresholdValue(threshold);
        setErrors((prevState) => {
            const { threshold, ...rest } = prevState;
            return { ...rest };
        });
        window.electron.logAction("Enter Threshold", `Threshold: ${threshold}`, "FFFFFF");
    };

    return (
        <div className="w-full flex justify-center items-center">
            <div className="bg-white w-full">
                <div className="border-b border-neutral-300 pb-4 mb-4 relative">
                    <h3 className="text-lg font-bold">Port section</h3>

                    <select
                        className={`border rounded-md p-2 mr-2 ${errors?.port ? "border-red-400" : "border-neutral-300"}`}
                        onChange={(e) => onSelectPort(e.target.value)}
                        value={selectedPort}
                    >
                        <option value="" disabled>
                            Select a port
                        </option>
                        {ports.map((port) => (
                            <option key={port.path} value={port.path}>
                                {port.path}
                            </option>
                        ))}
                    </select>
                    {errors?.port && <span className="text-xs text-red-400 absolute bottom-0 left-0"> * {errors?.port}</span>}
                </div>

                <div className="flex flex-row justify-between">
                    <div className="flex items-center gap-4 mb-4">
                        <input disabled={!selectedPort} type="file" accept=".txt" onChange={handleFileUpload} className="hidden" id="file-upload" />
                        <label
                            aria-disabled={!selectedPort}
                            htmlFor="file-upload"
                            className="border border-neutral-300 hover:bg-neutral-100 px-4 py-2 rounded-md cursor-pointer disabled:bg-neutral-100"
                        >
                            Upload
                        </label>
                        <button
                            disabled={!selectedPort}
                            className="border border-neutral-300 px-4 py-2 rounded-md hover:bg-neutral-100 disabled:bg-neutral-100"
                            onClick={handleSave}
                        >
                            &#128190; Save
                        </button>
                        <button
                            disabled={!selectedPort}
                            className="border border-neutral-300 px-4 py-2 rounded-md hover:bg-neutral-100 disabled:bg-neutral-100"
                            onClick={handleClickRun}
                        >
                            &#x23E9; Run
                        </button>
                        <button
                            disabled={!selectedPort}
                            className="border border-neutral-300 px-4 py-2 rounded-md hover:bg-neutral-100 disabled:bg-neutral-100"
                            onClick={handlePause}
                        >
                            ⏸ Pause
                        </button>
                        <button
                            disabled={!selectedPort}
                            className="border border-neutral-300 px-4 py-2 rounded-md hover:bg-neutral-100 disabled:bg-neutral-100"
                            onClick={handleStop}
                        >
                            &#4; Stop
                        </button>
                    </div>

                    <div className="flex flex-row items-center h-fit gap-4">
                        <div className="flex flex-row items-center">
                            <span className="mr-2">Currently Executing</span>
                            <div className={`px-4 py-2 h-10 border-neutral-300 w-[200px] rounded-md border ${!currentExeCmd && "bg-neutral-100"}`}>
                                {currentExeCmd ? currentExeCmd : "No command"}
                            </div>
                        </div>

                        <div className="flex flex-row items-center h-fit">
                            <label htmlFor="threshold" className="mr-2">
                                Threshold
                            </label>

                            <div className="relative">
                                <input
                                    disabled={!selectedPort}
                                    type="number"
                                    value={thresholdValue ?? ""}
                                    onChange={(e) => handleEnterThreshold(e.target.value)}
                                    name="threshold"
                                    className={`px-4 py-2 border rounded-lg ${errors?.threshold ? "border-red-400" : "border-neutral-300"}`}
                                    placeholder="Add threshold"
                                />
                                {errors?.threshold && <span className="text-xs text-red-400 -bottom-4 absolute left-0"> * {errors?.threshold}</span>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ButtonComponent;
