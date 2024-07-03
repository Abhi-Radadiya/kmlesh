import React, { useEffect, useState } from "react";
const { ipcRenderer } = window.require("electron");

function SerialPortComponent() {
    const [ports, setPorts] = useState([]);
    const [selectedPort, setSelectedPort] = useState("");
    const [receivedMessages, setReceivedMessages] = useState([]);
    const [message, setMessage] = useState("");

    useEffect(() => {
        const fetchPorts = async () => {
            const availablePorts = await ipcRenderer.invoke("list-ports");
            setPorts(availablePorts);
        };

        fetchPorts();

        ipcRenderer.on("serial-data", (event, data) => {
            setReceivedMessages((prevMessages) => [...prevMessages, data]);
        });

        return () => {
            ipcRenderer.removeAllListeners("serial-data");
        };
    }, []);

    const handleOpenPort = async () => {
        if (selectedPort) {
            try {
                const response = await ipcRenderer.invoke("open-port", selectedPort);
                console.log(response);
            } catch (error) {
                console.log("Failed to open port:", error);
            }
        } else {
            console.warn("No port selected");
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

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Serial Port Communication</h1>
            <div className="mb-4">
                <select className="border rounded p-2 mr-2" onChange={(e) => setSelectedPort(e.target.value)} value={selectedPort}>
                    <option value="" disabled>
                        Select a COM port
                    </option>
                    {ports.map((port) => (
                        <option key={port.path} value={port.path}>
                            {port.path}
                        </option>
                    ))}
                </select>
            </div>

            <textarea type="text" className="border rounded p-2 mr-2 h-[300px] w-[400px]" placeholder="Data to send" value={message} onChange={(e) => setMessage(e.target.value)} />

            <div className="mb-4">
                <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mr-2" onClick={handleOpenPort}>
                    Open
                </button>

                <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2" onClick={handleSend}>
                    Run
                </button>

                <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded" onClick={handleClosePort}>
                    Close
                </button>
            </div>

            <div>
                <h2 className="text-lg font-bold mb-2">Received Messages:</h2>
                <ul className="list-disc pl-4">
                    {receivedMessages.map((msg, index) => (
                        <li key={index} className="mb-1">
                            {msg}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default SerialPortComponent;
