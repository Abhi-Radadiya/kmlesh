import React, { useEffect, useRef, useState } from "react";
import ButtonComponent from "./Components/ButtonComponent";
import SelectLineModel from "./Components/SelectLineModel";

function App() {
    const [selectedPort, setSelectedPort] = useState("");
    const [receivedMessages, setReceivedMessages] = useState([]);
    const [inputCmd, setInputCmd] = useState("");
    const [thresholdValue, setThresholdValue] = useState(null);
    const [errors, setErrors] = useState({});
    const [currentCmdIndex, setCurrentCmdIndex] = useState(0);
    const [counter, setCounter] = useState(0);
    const timeoutRef = useRef(null);
    const pausedRef = useRef(false);

    const [sensorMode, setSensorMode] = useState(1);

    const [errorMessage, setErrorMessage] = useState("");
    const [showErrorModal, setShowErrorModal] = useState(false);

    const [activeButton, setActiveButton] = useState();

    useEffect(() => {
        const unsubscribe = window.electron.onSerialData((data) => {
            setReceivedMessages((prevMessages) => [...prevMessages, data]);

            if (data.indexOf("F") >= 0) {
                setErrorMessage(sensorMode === 1 ? "No Liquid Detected.....!" : "Liquid Detected.....!");
                setShowErrorModal(true);
                pausedRef.current = true;
                setCurrentCmdIndex(0);
            }
        });

        return () => {
            unsubscribe();
        };
    }, [sensorMode]);

    const executeNextCommand = async (index) => {
        if (pausedRef.current || index >= inputCmd.split("\n").length || lastCmdIndexRef.current < index) {
            setCurrentCmdIndex(0);

            setActiveButton(null);

            return;
        }

        let command = inputCmd.split("\n")[index].toUpperCase();
        window.electron.logAction("Execute Command", command, "FF0000FF");

        try {
            if (command.includes("V ON")) {
                await handleVOnCommand(command);
            } else if (command.includes("V OFF")) {
                await handleVOffCommand(command);
            } else if (command.includes("HOLD")) {
                await handleHoldCommand(command);
            } else if (command.includes("REP")) {
                await handleRepCommand(command, index);
            } else if (command.includes("S")) {
                await handleSCommand(command);
            } else if (command.includes("Z")) {
                await handleZCommand(command);
            } else if (command.includes("PUMP")) {
                await handlePumpCommand(command);
            }
        } catch (error) {
            console.error("Error executing command:", error);
            window.electron.logAction("Error", `Error executing command: ${error.message}`, "FFFF0000");
        }

        if (!pausedRef.current) {
            executeNextCommand(index + 1);
            setCurrentCmdIndex(index + 1);
        }
    };

    const handleClickRun = () => {
        let error = false;

        setActiveButton("run");

        if (!thresholdValue) {
            setErrors((prevState) => ({ ...prevState, threshold: "Please add threshold value" }));
            error = true;
            window.electron.logAction("Error", "Threshold value is missing", "FFFF0000");
        }

        if (!inputCmd?.length) {
            setErrors((prevState) => ({ ...prevState, inputCmd: "Please enter commands" }));
            error = true;
            window.electron.logAction("Error", "Commands are missing", "FFFF0000");
        }

        if (error) {
            return;
        }

        pausedRef.current = false;

        if (currentCmdIndex === inputCmd.split("\n").length) {
            setCurrentCmdIndex(0);
        }

        executeNextCommand(currentCmdIndex === inputCmd.split("\n").length ? 0 : currentCmdIndex);
    };

    const handleFileUpload = (event) => {
        const fileInput = event.target;
        const file = fileInput.files[0];

        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setInputCmd((prevState) => {
                    const totalCmd = prevState + e.target.result;

                    lastCmdIndexRef.current = totalCmd.split("\n").length - 1; // Update the ref

                    return prevState + e.target.result;
                });

                window.electron.logAction("File Upload", `File content loaded: ${file.name}`, "FF0000FF");
            };

            reader.readAsText(file);
            setThresholdValue(1);
        }

        // Reset the input value to allow the same file to be selected again
        fileInput.value = "";
    };

    const handleSave = () => {
        setActiveButton("save");

        const blob = new Blob([inputCmd], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "commands.txt";
        a.click();
        URL.revokeObjectURL(url);
        window.electron.logAction("Save File", "File saved as commands.txt", "FF00FFFF");
    };

    const handleInputCmd = (inputCmd) => {
        setErrors((prevState) => {
            const { inputCmd, ...rest } = prevState;
            return { ...rest };
        });

        lastCmdIndexRef.current = inputCmd.split("\n").length - 1; // Update the ref

        setInputCmd(inputCmd);
    };

    const sendPinCommand = async (pin) => {
        try {
            const response = await window.electron.sendData(pin);
            // console.log(response);
            await new Promise((resolve) => setTimeout(resolve, 50)); // Ensuring a delay between commands
        } catch (error) {
            console.error("Failed to send pin command:", error);
        }
    };

    const handleVOnCommand = async (command) => {
        const Reactor = command.substring(0, 2); // Reactor number

        const pinsPart = command.substring(command.indexOf("V ON") + 5).trim();
        const pinList = pinsPart.split(",");

        for (let pin of pinList) {
            let fullPinCommand = `${Reactor}V${pin.trim()}-1`;
            await sendPinCommand(fullPinCommand);
        }
    };

    const handleVOffCommand = async (command) => {
        const Reactor = command.substring(0, 2); // Reactor number

        const pinsPart = command.substring(command.indexOf("V OFF") + 5).trim();
        const pinList = pinsPart.split(",");

        for (let pin of pinList) {
            let fullPinCommand = `${Reactor}V${pin.trim()}-0`;
            await sendPinCommand(fullPinCommand);
        }
    };

    const handleHoldCommand = async (command) => {
        let spa = command.indexOf(" ");
        let s = parseInt(command.substring(spa + 1));
        await new Promise((resolve) => setTimeout(resolve, s * 1000));
    };

    const handleRepCommand = async (command, index) => {
        let sep = command.indexOf(",");
        let spa = command.indexOf(" ");

        if (counter === 0) {
            setCounter(parseInt(command.substring(spa + 1, sep - spa - 1)) - 1);
        } else if (counter === 1) {
            setCounter(0);
        } else {
            setCounter(counter - 1);
            setCounter(parseInt(command.substring(spa + 1, sep - spa - 1)) - 1);
        }
    };

    const handleSCommand = async (command) => {
        setSensorMode(1);
        const Reactor = command.substring(0, 2);
        const sep = command.indexOf(",", 3);
        const spa = command.indexOf(" ");

        let pin = `${Reactor}S${command.substring(spa + 1, sep - spa - 1)}-${command.substring(sep + 1)}`;

        const thresholdString = thresholdValue.toString();

        if (thresholdString.includes(".")) {
            pin = `${pin}-${thresholdString}`;
        } else {
            pin = `${pin}-${thresholdString}.00`;
        }

        try {
            await window.electron.sendData(pin);
            console.log("Data sent:", pin);
        } catch (error) {
            console.error("Failed to send data:", error);
        }
    };

    const handleZCommand = async (command) => {
        setSensorMode(2);
        const Reactor = command.substring(0, 2);
        const sep = command.indexOf(",", 3);
        const spa = command.indexOf(" ");

        let pin = `${Reactor}Z${command.substring(spa + 1, sep - spa - 1)}-${command.substring(sep + 1)}`;

        const thresholdString = thresholdValue.toString();

        if (thresholdString.includes(".")) {
            pin = `${pin}-${thresholdString}`;
        } else {
            pin = `${pin}-${thresholdString}.00`;
        }

        try {
            await window.electron.sendData(pin);
            console.log("Data sent:", pin);
        } catch (error) {
            console.error("Failed to send data:", error);
        }
    };

    const handlePumpCommand = async (command) => {
        const Reactor = command.substring(0, 2);
        let sep = command.indexOf("-");
        let pin = `${Reactor}P${command.substring(sep)}`;
        window.electron.sendData(pin);
    };

    const handlePause = () => {
        setActiveButton("pause");

        pausedRef.current = true;
        window.electron.logAction("Pause", "Execution paused", "FF00FFFF");
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
    };

    const handleStop = () => {
        setActiveButton("stop");

        pausedRef.current = true;
        setCurrentCmdIndex(0);
        setCounter(0);
        window.electron.logAction("Stop", "Execution stopped", "FF00FFFF");
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
    };

    const handleRepeat = () => {
        lastCmdIndexRef.current = inputCmd.split("\n").length - 1; // Update the ref

        setCurrentCmdIndex(0);
        executeNextCommand(0);
    };

    const [showSelectedLinePopup, setShowSelectedLinePopup] = useState(false);

    const lastCmdIndexRef = useRef(0); // Using a ref instead of state

    return (
        <div className="p-4">
            <ButtonComponent
                handleClickRun={handleClickRun}
                selectedPort={selectedPort}
                setSelectedPort={setSelectedPort}
                handleFileUpload={handleFileUpload}
                handleSave={handleSave}
                thresholdValue={thresholdValue}
                setThresholdValue={setThresholdValue}
                errors={errors}
                setErrors={setErrors}
                currentExeCmd={currentCmdIndex !== -1 && inputCmd.split("\n")[currentCmdIndex]}
                handlePause={handlePause}
                handleStop={handleStop}
                inputCmd={inputCmd}
                setCurrentCmdIndex={setCurrentCmdIndex}
                activeButton={activeButton}
                handleRepeat={handleRepeat}
                setShowSelectedLinePopup={setShowSelectedLinePopup}
                lastCmdIndexRef={lastCmdIndexRef}
            />

            <textarea
                disabled={!selectedPort}
                type="text"
                className={`border rounded-lg p-2 mr-2 mt-4 h-[300px] w-full block ${errors?.inputCmd ? "border-red-400" : "border-neutral-300"}`}
                placeholder="Commands to send"
                value={inputCmd ?? ""}
                onChange={(e) => handleInputCmd(e.target.value)}
            />

            {errors?.inputCmd && <span className="text-xs text-red-400"> * {errors?.inputCmd}</span>}

            <div>
                <h2 className="text-lg font-bold mb-2">Received Messages:</h2>
                <div className="pl-4 pt-2">
                    {receivedMessages.map((msg, index) => (
                        <div className="pt-2" key={index}>
                            {msg}
                        </div>
                    ))}
                </div>
            </div>

            {showErrorModal && (
                <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-[60vh] w-full">
                        <div className="flex flex-row justify-between">
                            <h1 className="font-bold">Error</h1>
                            <span className="text-red-600 text-xl font-bold cursor-pointer float-right" onClick={() => setShowErrorModal(false)}>
                                &times;
                            </span>
                        </div>
                        <p className="mt-4">{errorMessage}</p>
                    </div>
                </div>
            )}

            {showSelectedLinePopup && (
                <SelectLineModel
                    lastCmdIndexRef={lastCmdIndexRef}
                    setCurrentCmdIndex={setCurrentCmdIndex}
                    inputCmd={inputCmd}
                    handleClickClose={() => setShowSelectedLinePopup(false)}
                    executeNextCommand={executeNextCommand}
                />
            )}
        </div>
    );
}

export default App;
