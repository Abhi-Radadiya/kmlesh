import React, { useEffect, useState } from "react";
import { uploadData } from "../function/googleSheetConfig";

function ButtonComponent(props) {
    const {
        handleClickRun,
        selectedPort,
        setSelectedPort,
        thresholdValue,
        setThresholdValue,
        errors,
        setErrors,
        currentExeCmd,
        handleSave,
        handlePause,
        handleStop,
        inputCmd,
        setCurrentCmdIndex,
        activeButton,
        handleRepeat,
        setShowSelectedLinePopup,
        lastCmdIndexRef,
        setShowUploadSpecificFileToRepeat,
    } = props;

    const [isPortReady, setIsPortReady] = useState(false);

    const [ports, setPorts] = useState([]);

    useEffect(() => {
        const fetchPortInfo = async () => {
            const { ports, selectedPort } = await window.electron.getPortInfo();
            setPorts(ports);
            // setSelectedPort(selectedPort ? `Currently selected port: ${selectedPort}` : "No port selected");
        };

        console.clear();

        fetchPortInfo();
    }, []);

    const repeatMethods = [
        { label: "Repeat entire file", value: "entire_file" },
        { label: "Repeat specific file", value: "specific_file" },
        { label: "Repeat specific section", value: "selected_line" },
    ];

    const onSelectPort = async (port) => {
        setErrors((prevState) => {
            const { port, ...rest } = prevState;
            return { ...rest };
        });
        setSelectedPort(port);
        openPort(port);
    };

    const openPort = async (port) => {
        try {
            const response = await window.electron.openPort(port);
            uploadData({ action: `Open Port ${port}`, success: "Success" });
            setIsPortReady(response === "Port opened successfully" || response === "Port already opened");
        } catch (error) {
            uploadData({ action: `Open Port ${port}`, success: "Error", error: error });
            console.log("Failed to open port:", error);
        }
    };

    const handleFileUpload = (event) => {
        const file = event.target.files[0];

        if (file) {
            uploadData({ action: `Upload file ${file.name}`, success: "Success" });
            props.handleFileUpload(event);
        }
    };

    const handleEnterThreshold = (threshold) => {
        setThresholdValue(threshold);
        setErrors((prevState) => {
            const { threshold, ...rest } = prevState;
            return { ...rest };
        });
        uploadData({ action: `Enter Threshold : ${threshold}`, success: "Success" });
    };

    const [selectedCommand, setSelectedCommand] = useState("");

    const commands = inputCmd.split("\n").filter((cmd) => cmd.trim() !== "");

    const handleCommandChange = async (command, index) => {
        uploadData({ action: `Command Selection ${command}`, success: "Success" });
        setSelectedCommand(command);
        setCurrentCmdIndex(index);
        setIsOpen(false);
    };

    const [isOpen, setIsOpen] = useState(false);

    const [selectedRepeatMethod, setSelectedRepeatMethod] = useState("");

    const onSelectRepeatType = (value) => {
        setSelectedRepeatMethod(value);

        if (value === repeatMethods[0].value) {
            handleRepeat();
        } else if (value === "selected_line") {
            setShowSelectedLinePopup(true);
        } else if (value === "specific_file") {
            setShowUploadSpecificFileToRepeat(true);
        }

        lastCmdIndexRef.current = inputCmd.split("\n").length - 1; // Update the ref

        setSelectedRepeatMethod("");
    };

    return (
        <div className="w-full flex justify-center items-center">
            <div className="bg-white w-full">
                <div className="border-b border-neutral-300 pb-4 mb-4 relative">
                    <h3 className="text-lg font-bold">Port section</h3>

                    <div className="flex flex-row items-center">
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

                        {isPortReady ? <div className="rounded-full w-3 h-3 bg-green-500" /> : <div className="rounded-full w-3 h-3 bg-red-500" />}
                    </div>

                    {errors?.port && <span className="text-xs text-red-400 absolute bottom-0 left-0"> * {errors?.port}</span>}
                </div>

                <div className="flex flex-col justify-between">
                    <div className="flex items-center gap-4 mb-4">
                        {/* <input disabled={!selectedPort} type="file" accept=".txt" onChange={handleFileUpload} className="hidden" id="file-upload" />
                        <label
                            aria-disabled={!selectedPort}
                            htmlFor="file-upload"
                            className="border border-neutral-300 hover:bg-neutral-100 px-4 py-2 rounded-md cursor-pointer disabled:bg-neutral-100"
                        >
                            Upload
                        </label> */}
                        <button
                            disabled={!selectedPort}
                            className={`border border-neutral-300 px-4 py-2 rounded-md disabled:bg-neutral-100 ${activeButton === "save" ? "bg-blue-300" : "hover:bg-neutral-100"}`}
                            onClick={handleSave}
                        >
                            &#128190; Save
                        </button>
                        <button
                            // disabled={!selectedPort}
                            className={`border border-neutral-300 px-4 py-2 rounded-md disabled:bg-neutral-100 ${activeButton === "run" ? "bg-blue-300" : "hover:bg-neutral-100"}`}
                            onClick={handleClickRun}
                        >
                            &#x23E9; Run
                        </button>
                        <button
                            disabled={!selectedPort}
                            className={`border border-neutral-300 px-4 py-2 rounded-md disabled:bg-neutral-100 ${
                                activeButton === "pause" ? "bg-blue-300" : "hover:bg-neutral-100"
                            }`}
                            onClick={handlePause}
                        >
                            ⏸ Pause
                        </button>
                        <button
                            disabled={!selectedPort}
                            className={`border border-neutral-300 px-4 py-2 rounded-md disabled:bg-neutral-100 ${activeButton === "stop" ? "bg-blue-300" : "hover:bg-neutral-100"}`}
                            onClick={handleStop}
                        >
                            &#4; Stop
                        </button>

                        <select
                            disabled={!inputCmd.length}
                            className={`border rounded-md p-2 mr-2 border-neutral-300 disabled:bg-neutral-100 disabled:cursor-not-allowed`}
                            value={selectedRepeatMethod}
                            onChange={(e) => onSelectRepeatType(e.target.value)}
                        >
                            <option value="">Select a repeat method</option>
                            {repeatMethods.map((port) => (
                                <option key={port.value} value={port.value}>
                                    {port.label}
                                </option>
                            ))}
                        </select>

                        <div className="relative inline-block text-left">
                            <div>
                                <button
                                    disabled={!inputCmd.length}
                                    type="button"
                                    className={`border rounded-md p-2 disabled:bg-neutral-100 disabled:cursor-not-allowed ${
                                        errors?.port ? "border-red-400" : "border-neutral-300"
                                    }`}
                                    onClick={() => setIsOpen(!isOpen)}
                                >
                                    {selectedCommand || "Select a command"} <span className="ml-2">&#9662;</span>
                                </button>
                            </div>

                            {isOpen && (
                                <div className="origin-top-right absolute right-0 mt-2 z-10 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                                    <ul className="max-h-72 overflow-y-auto">
                                        {commands.map((cmd, index) => (
                                            <li
                                                key={index}
                                                className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-gray-200"
                                                onClick={() => handleCommandChange(cmd, index)}
                                            >
                                                {cmd}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
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
                                    // disabled={!selectedPort}
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
