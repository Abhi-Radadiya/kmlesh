import React, { useEffect, useState } from "react";
import ButtonComponent from "./Components/ButtonComponent";
const { ipcRenderer } = window.require("electron");

function App() {
    const [selectedPort, setSelectedPort] = useState("");
    const [receivedMessages, setReceivedMessages] = useState([]);
    const [message, setMessage] = useState("");

    useEffect(() => {
        ipcRenderer.on("serial-data", (event, data) => {
            setReceivedMessages((prevMessages) => [...prevMessages, data]);
        });

        return () => {
            ipcRenderer.removeAllListeners("serial-data");
        };
    }, []);

    const handleSend = async () => {
        if (selectedPort) {
            try {
                const response = await ipcRenderer.invoke("send-data", selectedPort, message);
                console.log(response);
            } catch (error) {
                console.log("Failed to send data:", error);
            }
        } else {
            console.warn("No port selected");
        }
    };

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setMessage(e.target.result);
            };
            reader.readAsText(file);
        }
    };

    const handleSave = () => {
        const blob = new Blob([message], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "commands.txt";
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="p-4">
            <ButtonComponent handleSend={handleSend} selectedPort={selectedPort} setSelectedPort={setSelectedPort} handleFileUpload={handleFileUpload} handleSave={handleSave} />

            <textarea
                type="text"
                className="border rounded p-2 mr-2 h-[300px] w-full"
                placeholder="Commands to send"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
            />

            <div>
                <h2 className="text-lg font-bold mb-2">Received Messages:</h2>
                <p className="list-disc pl-4">{receivedMessages}</p>
            </div>
        </div>
    );
}

export default App;
