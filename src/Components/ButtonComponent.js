import React, { useEffect, useState } from "react";
const { ipcRenderer } = window.require("electron");

function ButtonComponent(props) {
    const { handleClickRun, handleFileUpload, selectedPort, setSelectedPort, thresholdValue, setThresholdValue, errors, setErrors, currentExeCmd } = props;

    const [ports, setPorts] = useState([]);

    useEffect(() => {
        const fetchPorts = async () => {
            const availablePorts = await ipcRenderer.invoke("list-ports");
            setPorts(availablePorts);
        };

        fetchPorts();
    }, []);

    const onSelectPort = async (port) => {
        setSelectedPort(port);
    };

    const openPort = async (port) => {
        try {
            const response = await ipcRenderer.invoke("open-port", port);
            console.log(response, port);
        } catch (error) {
            console.log("Failed to open port:", error);
        }
    };

    const handleClosePort = async () => {
        try {
            const response = await ipcRenderer.invoke("close-port");
            console.log(response);
        } catch (error) {
            console.log("Failed to close port:", error);
        }
    };

    const handleEnterThreshold = (threshold) => {
        setThresholdValue(threshold);
        setErrors((prevState) => {
            const { threshold, ...rest } = prevState;
            return { ...rest };
        });
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

                    <button className="border border-neutral-300 px-4 py-2 rounded-md hover:bg-neutral-100" onClick={openPort}>
                        Open port
                    </button>
                    <button className="border border-neutral-300 px-4 py-2 mx-2 rounded-md hover:bg-neutral-100" onClick={handleClosePort}>
                        Close port
                    </button>
                </div>

                <div className="flex flex-row justify-between">
                    <div className="flex items-center gap-4 mb-4">
                        <input type="file" accept=".txt" onChange={handleFileUpload} className="hidden" id="file-upload" />
                        <label htmlFor="file-upload" className="border border-neutral-300 hover:bg-neutral-100 px-4 py-2 rounded-md cursor-pointer">
                            Upload
                        </label>

                        <button className="border border-neutral-300 px-4 py-2 rounded-md hover:bg-neutral-100">Save</button>
                        <button className="border border-neutral-300 px-4 py-2 rounded-md hover:bg-neutral-100" onClick={handleClickRun}>
                            Run
                        </button>
                        <button className="border border-neutral-300 px-4 py-2 rounded-md hover:bg-neutral-100">Stop</button>
                        <button className="border border-neutral-300 px-4 py-2 rounded-md hover:bg-neutral-100">Pause</button>
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
                                    type="number"
                                    value={thresholdValue}
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
