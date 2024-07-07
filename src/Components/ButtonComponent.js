import React, { useEffect, useState } from "react";
const { ipcRenderer } = window.require("electron");

function ButtonComponent(props) {
    const { handleSend, handleFileUpload, selectedPort, setSelectedPort } = props;

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

    return (
        <div className="w-full flex justify-center items-center">
            <div className="bg-white w-full">
                <div className="border-b border-neutral-300 pb-4 mb-4">
                    <h3 className="text-lg font-bold">Port section</h3>

                    <select className="border border-neutral-300 rounded-md p-2 mr-2" onChange={(e) => onSelectPort(e.target.value)} value={selectedPort}>
                        <option value="" disabled>
                            Select a port
                        </option>
                        {ports.map((port) => (
                            <option key={port.path} value={port.path}>
                                {port.path}
                            </option>
                        ))}
                    </select>

                    <button className="border border-neutral-300 px-4 py-2 rounded-md hover:bg-neutral-100" onClick={openPort}>
                        Open port
                    </button>
                    <button className="border border-neutral-300 px-4 py-2 mx-2 rounded-md hover:bg-neutral-100" onClick={handleClosePort}>
                        Close port
                    </button>
                </div>

                <div className="flex items-center gap-4 mb-4">
                    <input type="file" accept=".txt" onChange={handleFileUpload} className="hidden" id="file-upload" />
                    <label htmlFor="file-upload" className="border border-neutral-300 hover:bg-neutral-100 px-4 py-2 rounded-md cursor-pointer">
                        Upload
                    </label>

                    <button className="border border-neutral-300 px-4 py-2 rounded-md hover:bg-neutral-100">Save</button>
                    <button className="border border-neutral-300 px-4 py-2 rounded-md hover:bg-neutral-100" onClick={handleSend}>
                        Run
                    </button>
                    <button className="border border-neutral-300 px-4 py-2 rounded-md hover:bg-neutral-100">Stop</button>
                    <button className="border border-neutral-300 px-4 py-2 rounded-md hover:bg-neutral-100">Pause</button>
                </div>
            </div>
        </div>
    );
}

export default ButtonComponent;
