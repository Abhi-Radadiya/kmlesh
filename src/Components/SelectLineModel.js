import React, { useState } from "react";

export default function SelectLineModel(props) {
    const { inputCmd, setCurrentCmdIndex, lastCmdIndexRef, executeNextCommand } = props;

    const [isOpen, setIsOpen] = useState({ startCommand: false, endCommand: false });
    const [selectedCommand, setSelectedCommand] = useState({ startCommand: "", endCommand: "" });
    const [startIndex, setStartIndex] = useState(0);

    const commands = inputCmd.split("\n").filter((cmd) => cmd.trim() !== "");

    const handleCommandChange = (cmd, index, location) => {
        setSelectedCommand((prevState) => ({ ...prevState, [location]: cmd }));
        if (location === "startCommand") {
            setCurrentCmdIndex(index);
            setStartIndex(index); // Set the start index
            setSelectedCommand((prevState) => ({ ...prevState, endCommand: "" })); // Reset the end command if start command changes
        } else {
            lastCmdIndexRef.current = index;
        }
        setIsOpen({ startCommand: false, endCommand: false });
    };

    // Filter commands for the end command dropdown based on the selected start command index
    const filteredEndCommands = startIndex !== null ? commands.slice(startIndex + 1) : [];

    const handleSave = () => {
        props.handleClickClose();
        executeNextCommand(startIndex);
    };

    const handleClickClose = () => {
        setCurrentCmdIndex(0);
        lastCmdIndexRef.current = inputCmd.split("\n").length - 1; // Update the ref

        props.handleClickClose();
    };

    return (
        <>
            <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center">
                <div className="bg-white p-6 rounded-lg shadow-lg max-w-[60vh] w-full">
                    <div className="flex flex-row justify-between">
                        <h1 className="font-bold">Select Lines to Execute</h1>
                        <span className="text-xl font-bold cursor-pointer float-right" onClick={() => handleClickClose()}>
                            &times;
                        </span>
                    </div>

                    <div className="flex flex-row items-center gap-6 mt-4">
                        <div className="relative w-1/2">
                            <div>
                                <button
                                    type="button"
                                    className="w-full border rounded-md p-2 border-neutral-300"
                                    onClick={() => setIsOpen((prevState) => ({ startCommand: !prevState.startCommand, endCommand: false }))}
                                >
                                    {selectedCommand.startCommand || "Select start command"} <span className="ml-2">&#9662;</span>
                                </button>
                            </div>

                            {isOpen.startCommand && (
                                <div className="origin-top-left absolute left-0 mt-2 z-10 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                                    <ul className="max-h-72 overflow-y-auto">
                                        {commands.map((cmd, index) => (
                                            <li
                                                key={index}
                                                className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-gray-200"
                                                onClick={() => handleCommandChange(cmd, index, "startCommand")}
                                            >
                                                {cmd}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>

                        <div className="relative w-1/2">
                            <div>
                                <button
                                    type="button"
                                    className="w-full border rounded-md p-2 border-neutral-300"
                                    onClick={() => setIsOpen((prevState) => ({ startCommand: false, endCommand: !prevState.endCommand }))}
                                    disabled={startIndex === null} // Disable if no start command is selected
                                >
                                    {selectedCommand.endCommand || "Select end command"} <span className="ml-2">&#9662;</span>
                                </button>
                            </div>

                            {isOpen.endCommand && (
                                <div className="origin-top-left absolute left-0 mt-2 z-10 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                                    <ul className="max-h-72 overflow-y-auto">
                                        {filteredEndCommands.length > 0 ? (
                                            filteredEndCommands.map((cmd, index) => (
                                                <li
                                                    key={index + startIndex + 1} // Adjust index key to maintain uniqueness
                                                    className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-gray-200"
                                                    onClick={() => handleCommandChange(cmd, index + startIndex + 1, "endCommand")}
                                                >
                                                    {cmd}
                                                </li>
                                            ))
                                        ) : (
                                            <li className="py-2 pl-3 pr-9 text-gray-500">No commands available</li>
                                        )}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>

                    <button
                        disabled={!selectedCommand.endCommand}
                        className={`border border-neutral-300 px-4 py-2 w-full mt-6 rounded-md disabled:bg-neutral-100 disabled:cursor-not-allowed`}
                        onClick={handleSave}
                    >
                        Run
                    </button>
                </div>
            </div>
        </>
    );
}
