import React, { useEffect, useRef, useState } from "react";
import ButtonComponent from "./Components/ButtonComponent";

function App() {
    const [selectedPort, setSelectedPort] = useState("");
    const [receivedMessages, setReceivedMessages] = useState([]);
    const [inputCmd, setInputCmd] = useState("");
    const [thresholdValue, setThresholdValue] = useState(1);
    const [errors, setErrors] = useState({});
    const [currentCmdIndex, setCurrentCmdIndex] = useState(0);
    const [counter, setCounter] = useState(0);
    const timeoutRef = useRef(null);
    const pausedRef = useRef(false);

    useEffect(() => {
        const unsubscribe = window.electron.onSerialData((data) => {
            setReceivedMessages((prevMessages) => [...prevMessages, data]);
        });

        return () => {
            unsubscribe();
        };
    }, []);

    const executeNextCommand = async (index) => {
        if (pausedRef.current || index >= inputCmd.split("\n").length) {
            setCurrentCmdIndex(0);
            return;
        }

        let command = inputCmd.split("\n")[index].toUpperCase();
        window.electron.logAction("Execute Command", command, "FF0000FF");

        console.log("command ==>", command);

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
            await executeNextCommand(index + 1);
            setCurrentCmdIndex(index + 1);
        }
    };

    // const handleClickRun = async () => {
    //     for (let i = 0; i < 10; i++) {
    //         const response = await window.electron.sendData("R1V5-0");
    //         const now = new Date();
    //         const minutes = String(now.getMinutes()).padStart(2, "0");
    //         const seconds = String(now.getSeconds()).padStart(2, "0");
    //         const timestamp = `${minutes}:${seconds}`;
    //         console.log("pin ==>", response, "timestamp ==>", timestamp);

    //         await new Promise((resolve) => setTimeout(resolve, 500)); // Ensuring a delay between commands
    //     }
    // };

    const handleClickRun = () => {
        let error = false;

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
        executeNextCommand(currentCmdIndex);
    };

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setInputCmd(e.target.result);
                window.electron.logAction("File Upload", `File content loaded: ${file.name}`, "FF0000FF");
            };
            reader.readAsText(file);
        }
    };

    const handleSave = () => {
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

        setInputCmd(inputCmd);
    };

    const sendPinCommand = async (pin) => {
        console.log("pin ==>", pin);
        try {
            const response = await window.electron.sendData(pin);
            console.log(response);
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
        const Reactor = command.substring(0, 2);
        let sep = command.indexOf(",", 3);
        let spa = command.indexOf(" ");
        let pin = `${Reactor}S${command.substring(spa + 1, sep - spa - 1)}-${command.substring(sep + 1)}-0.00`;
        window.electron.sendData(pin);
    };

    const handleZCommand = async (command) => {
        const Reactor = command.substring(0, 2);
        let sep = command.indexOf(",", 3);
        let spa = command.indexOf(" ");
        let pin = `${Reactor}Z${command.substring(spa + 1, sep - spa - 1)}-${command.substring(sep + 1)}-0.00`;
        window.electron.sendData(pin);
    };

    const handlePumpCommand = async (command) => {
        const Reactor = command.substring(0, 2);
        let sep = command.indexOf("-");
        let pin = `${Reactor}P${command.substring(sep)}`;
        window.electron.sendData(pin);
    };

    const handlePause = () => {
        pausedRef.current = true;
        window.electron.logAction("Pause", "Execution paused", "FF00FFFF");
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
    };

    const handleStop = () => {
        pausedRef.current = false;
        setCurrentCmdIndex(0);
        setCounter(0);
        window.electron.logAction("Stop", "Execution stopped", "FF00FFFF");
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
    };

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
            />

            <textarea
                type="text"
                className={`border rounded-lg p-2 mr-2 mt-2 h-[300px] w-full block ${errors?.inputCmd ? "border-red-400" : "border-neutral-300"}`}
                placeholder="Commands to send"
                value={inputCmd ?? ""}
                onChange={(e) => handleInputCmd(e.target.value)}
            />

            {errors?.inputCmd && <span className="text-xs text-red-400"> * {errors?.inputCmd}</span>}

            {/* <div>
          <h2 className="text-lg font-bold mb-2">Received Messages:</h2>
          <ul className="list-disc pl-4">
              {receivedMessages.map((msg, index) => (
                  <li key={index}>{msg}</li>
              ))}
          </ul>
      </div> */}
        </div>
    );
}

export default App;
