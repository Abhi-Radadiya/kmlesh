import React, { useEffect, useState } from "react";
const { ipcRenderer } = window.require("electron");

const App = () => {
    const [inputCmd, setInputCmd] = useState("");
    const [counter, setCounter] = useState(0);
    const [receivedMessages, setReceivedMessages] = useState([]);
    const [thresholdValue, setThresholdValue] = useState(1);
    const [errors, setErrors] = useState({});
    const [isRunning, setIsRunning] = useState(false);

    useEffect(() => {
        ipcRenderer.on("serial-data", (event, data) => {
            setReceivedMessages((prevMessages) => [...prevMessages, data]);
        });

        return () => {
            ipcRenderer.removeAllListeners("serial-data");
        };
    }, []);

    const handleClickRun = () => {
        if (thresholdValue === "" || inputCmd.trim() === "") {
            setErrors({
                ...errors,
                threshold: thresholdValue === "" ? "Please add threshold value" : "",
                inputCmd: inputCmd.trim() === "" ? "Please enter commands" : "",
            });
            return;
        }

        setErrors({});
        setIsRunning(true);
        executeNextCommand(0);
    };

    const executeNextCommand = async (index) => {
        if (index >= inputCmd.split("\n").length) {
            setIsRunning(false);
            return;
        }

        let command = inputCmd.split("\n")[index].toUpperCase();

        // try {
        //     if (!ipcRenderer.sendSync("is-port-open")) {
        //         ipcRenderer.send("open-port");
        //     }

        //     if (command.includes("V ON")) {
        //         await handleVOnCommand(command);
        //     } else if (command.includes("V OFF")) {
        //         await handleVOffCommand(command);
        //     } else if (command.includes("HOLD")) {
        //         await handleHoldCommand(command);
        //     } else if (command.includes("REP")) {
        //         await handleRepCommand(command, index);
        //     } else if (command.includes("S")) {
        //         await handleSCommand(command);
        //     } else if (command.includes("Z")) {
        //         await handleZCommand(command);
        //     } else if (command.includes("PUMP")) {
        //         await handlePumpCommand(command);
        //     }
        // } catch (error) {
        //     console.error("Error executing command:", error);
        // }

        setTimeout(() => {
            executeNextCommand(index + 1);
        }, thresholdValue * 1000);
    };

    const handleVOnCommand = async (command) => {
        const Sstr = command.substring(4);
        let count = [...Sstr].filter((c) => c === "V").length;

        if (count > 0) {
            const Reactor = command.substring(0, 2);
            let start_pos = command.indexOf(" ", 6);
            let end_pos = command.indexOf(",", 3);

            for (let i = 0; i < count; i++) {
                let pin = `${Reactor}V${command.substring(start_pos + 1, end_pos - start_pos - 1)}-1`;
                ipcRenderer.send("send-data", pin);
                await new Promise((resolve) => setTimeout(resolve, 50));
                start_pos = end_pos;
                end_pos = command.indexOf(",", start_pos + 1);
            }

            let pins = `${Reactor}V${command.substring(start_pos + 1)}-1`;
            ipcRenderer.send("send-data", pins);
            await new Promise((resolve) => setTimeout(resolve, 50));
        } else {
            const Reactor = command.substring(0, 2);
            let spa = command.indexOf(" ", 6);
            let pin = `${Reactor}V${command.substring(spa + 1)}-1`;
            ipcRenderer.send("send-data", pin);
        }
    };

    const handleVOffCommand = async (command) => {
        const Sstr = command.substring(4);
        let count = [...Sstr].filter((c) => c === "V").length;

        if (count > 0) {
            const Reactor = command.substring(0, 2);
            let start_pos = command.indexOf(" ", 6);
            let end_pos = command.indexOf(",", 3);

            for (let i = 0; i < count; i++) {
                let pin = `${Reactor}V${command.substring(start_pos + 1, end_pos - start_pos - 1)}-0`;
                ipcRenderer.send("send-data", pin);
                await new Promise((resolve) => setTimeout(resolve, 50));
                start_pos = end_pos;
                end_pos = command.indexOf(",", start_pos + 1);
            }

            let pins = `${Reactor}V${command.substring(start_pos + 1)}-0`;
            ipcRenderer.send("send-data", pins);
            await new Promise((resolve) => setTimeout(resolve, 50));
        } else {
            const Reactor = command.substring(0, 2);
            let spa = command.indexOf(" ", 6);
            let pin = `${Reactor}V${command.substring(spa + 1)}-0`;
            ipcRenderer.send("send-data", pin);
        }
    };

    const handleHoldCommand = async (command) => {
        let spa = command.indexOf(" ");
        let s = parseInt(command.substring(spa + 1));
        await new Promise((resolve) => setTimeout(resolve, s));
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
        ipcRenderer.send("send-data", pin);
    };

    const handleZCommand = async (command) => {
        const Reactor = command.substring(0, 2);
        let sep = command.indexOf(",", 3);
        let spa = command.indexOf(" ");
        let pin = `${Reactor}Z${command.substring(spa + 1, sep - spa - 1)}-${command.substring(sep + 1)}-0.00`;
        ipcRenderer.send("send-data", pin);
    };

    const handlePumpCommand = async (command) => {
        const Reactor = command.substring(0, 2);
        let sep = command.indexOf("-");
        let pin = `${Reactor}P${command.substring(sep)}`;
        ipcRenderer.send("send-data", pin);
    };

    return (
        <div className="p-4">
            <textarea
                type="text"
                className={`border rounded-lg p-2 mr-2 mt-2 h-[300px] w-full block ${errors.inputCmd ? "border-red-400" : "border-neutral-300"}`}
                placeholder="Commands to send"
                value={inputCmd}
                onChange={(e) => setInputCmd(e.target.value)}
            />
            {errors.inputCmd && <span className="text-xs text-red-400"> * {errors.inputCmd}</span>}

            <div className="flex flex-row items-center h-fit mt-4">
                <label htmlFor="threshold" className="mr-2">
                    Threshold
                </label>
                <input
                    type="number"
                    value={thresholdValue}
                    onChange={(e) => setThresholdValue(e.target.value)}
                    name="threshold"
                    className={`px-4 py-2 border rounded-lg ${errors.threshold ? "border-red-400" : "border-neutral-300"}`}
                    placeholder="Add threshold"
                />
                {errors.threshold && <span className="text-xs text-red-400 ml-2"> * {errors.threshold}</span>}
            </div>

            <button className="border border-neutral-300 px-4 py-2 rounded-md hover:bg-neutral-100 mt-4" onClick={handleClickRun} disabled={isRunning}>
                Run
            </button>

            <div>
                <h2 className="text-lg font-bold mt-4">Received Messages:</h2>
                <ul className="list-disc pl-4">
                    {receivedMessages.map((msg, index) => (
                        <li key={index}>{msg}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default App;
