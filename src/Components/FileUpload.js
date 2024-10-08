import React, { useState } from "react";
import { uploadData } from "../function/googleSheetConfig";

const FileUploadFlyout = (props) => {
    const { setInputCmd, setErrors, lastCmdIndexRef, disabled } = props;

    const [files, setFiles] = useState([]);
    const [fileContent, setFileContent] = useState("");
    const [activeFile, setActiveFile] = useState(null);
    const [flyoutOpen, setFlyoutOpen] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState([]); // For combining files

    const handleFileUpload = (event) => {
        const uploadedFiles = Array.from(event.target.files);
        setFiles((prevFiles) => [...prevFiles, ...uploadedFiles]);
    };

    const handleRemoveFile = (fileName) => {
        setFiles(files.filter((file) => file.name !== fileName));
    };

    const handleLoadFileContent = (file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            setFileContent(e.target.result);
            setActiveFile(file.name);
        };
        reader.readAsText(file);
    };

    const toggleFlyout = () => {
        setFlyoutOpen(!flyoutOpen);
    };

    // Toggle selected files for combining
    const handleSelectFile = (file) => {
        setSelectedFiles((prevSelected) => (prevSelected.includes(file) ? prevSelected.filter((f) => f !== file) : [...prevSelected, file]));
    };

    // Combine the selected files' content
    const handleCombineFiles = () => {
        let combinedContent = "";
        selectedFiles.forEach((file) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                combinedContent += e.target.result + "\n"; // Append file content
                setFileContent(combinedContent); // Update textarea with combined content
            };
            reader.readAsText(file);
        });
    };

    return (
        <div className="relative bg-gray-50 p-0">
            {/* Flyout Toggle Button */}
            <button
                // disabled={disabled}
                className="fixed top-6 disabled:bg-neutral-500 disabled:cursor-not-allowed right-6 z-50 bg-indigo-500 text-white px-4 py-2 rounded-full shadow-lg hover:bg-indigo-600 focus:outline-none"
                onClick={toggleFlyout}
            >
                {flyoutOpen ? "Close" : "Open"} Uploads
            </button>

            {flyoutOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-10"
                    onClick={toggleFlyout} // Close flyout when clicked on the overlay
                />
            )}

            <div
                className={`fixed top-0 right-0 h-screen overflow-auto w-[50%] bg-white shadow-lg transition-transform duration-500 ease-in-out z-[11] ${
                    flyoutOpen ? "translate-x-0" : "translate-x-full"
                }`}
            >
                <div className="p-6 space-y-6">
                    <h2 className="text-2xl font-bold text-indigo-600 mb-4">Upload & Manage Files</h2>

                    <div className="bg-gray-100 p-4 rounded-lg shadow-md flex flex-row justify-between">
                        <input
                            type="file"
                            multiple
                            accept=".txt"
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                            onChange={handleFileUpload}
                        />
                        <button
                            onClick={() => {
                                setInputCmd(fileContent);
                                setErrors((prevState) => {
                                    const { inputCmd, ...rest } = prevState;
                                    return { ...rest };
                                });
                                lastCmdIndexRef.current = fileContent.split("\n").length - 1;

                                uploadData({ action: `Upload File ${activeFile}`, success: "Success" });
                            }}
                            disabled={!fileContent.length}
                            className="disabled:cursor-not-allowed transition ease-in-out delay-150 bg-blue-500 hover:-translate-y-1 hover:scale-110 hover:bg-indigo-500 duration-300  text-white px-3 py-1 rounded-lg"
                        >
                            Upload
                        </button>
                    </div>

                    {files.length > 0 && (
                        <>
                            <div className="bg-white p-4 rounded-lg shadow-md">
                                <h3 className="font-semibold text-lg mb-3 text-indigo-700">Uploaded Files</h3>
                                <ul className="space-y-2">
                                    {files.map((file) => (
                                        <li key={file.name} className="flex justify-between items-center bg-gray-50 p-2 rounded-md">
                                            <span className={`text-gray-700 ${activeFile === file.name ? "font-bold" : ""}`}>{file.name}</span>
                                            <div className="flex space-x-3">
                                                <button onClick={() => handleLoadFileContent(file)} className="bg-indigo-500 text-white px-3 py-1 rounded-lg hover:bg-indigo-600">
                                                    Load
                                                </button>
                                                <button onClick={() => handleRemoveFile(file.name)} className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600">
                                                    Remove
                                                </button>
                                                <input type="checkbox" checked={selectedFiles.includes(file)} onChange={() => handleSelectFile(file)} />
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                                {selectedFiles.length > 1 && (
                                    <button onClick={handleCombineFiles} className="bg-green-500 text-white px-4 py-2 rounded-lg mt-4 hover:bg-green-600">
                                        Combine Selected Files
                                    </button>
                                )}
                            </div>

                            <div className="mt-8 max-w-3xl mx-auto bg-gray-100 p-6 rounded-lg shadow-md">
                                <h3 className="font-semibold text-lg mb-3 text-indigo-700">File Content</h3>
                                <textarea
                                    value={fileContent}
                                    onChange={(e) => setFileContent(e.target.value)}
                                    className="w-full h-64 p-3 bg-white rounded-md border border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FileUploadFlyout;
