import React, { useEffect, useRef, useState } from "react";
import ButtonComponent from "./Components/ButtonComponent";
import { render, screen } from "@testing-library/react";
import App from "./App";
const { ipcRenderer } = window.require("electron");

test("renders learn react link", () => {
    render(<App />);
    const linkElement = screen.getByText(/learn react/i);
    expect(linkElement).toBeInTheDocument();
});

function Axpp() {
    const [selectedPort, setSelectedPort] = useState("");
    const [receivedMessages, setReceivedMessages] = useState([]);
    const [inputCmd, setInputCmd] = useState("");
    const [thresholdValue, setThresholdValue] = useState(2);
    const [errors, setErrors] = useState({});
    const [currentCmdIndex, setCurrentCmdIndex] = useState(0);
    const [counter, setCounter] = useState(0);
    const [paused, setPaused] = useState(false);
    const timeoutRef = useRef(null);
    const pausedRef = useRef(false);

    useEffect(() => {
        ipcRenderer.on("serial-data", (event, data) => {
            setReceivedMessages((prevMessages) => [...prevMessages, data]);
        });

        return () => {
            ipcRenderer.removeAllListeners("serial-data");
        };
    }, []);

    const executeNextCommand = async (index) => {
        if (pausedRef.current || index >= inputCmd.split("\n").length) {
            return;
        }

        let command = inputCmd.split("\n")[index].toUpperCase();

        console.log("command ==>", command);

        timeoutRef.current = setTimeout(() => {
            executeNextCommand(index + 1);
            setCurrentCmdIndex(index + 1);
        }, thresholdValue * 1000);
    };

    const handleClickRun = () => {
        pausedRef.current = false;
        executeNextCommand(currentCmdIndex);
    };

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setInputCmd(e.target.result);
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
    };

    const handleInputCmd = (inputCmd) => {
        setErrors((prevState) => {
            const { inputCmd, ...rest } = prevState;
            return { ...rest };
        });

        setInputCmd(inputCmd);
    };

    const handlePause = () => {
        setPaused(true);
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
    };

    const handleStop = () => {
        setPaused(false);
        setCurrentCmdIndex(0);
        setCounter(0);
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
        </div>
    );
}
