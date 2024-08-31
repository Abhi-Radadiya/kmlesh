import React from "react";
import { uploadData } from "../function/googleSheetConfig";

export default function UploadSpecificFileToRepeatModal(props) {
    const { handleClickClose, setInputCmd, setThresholdValue } = props;

    const handleFileUpload = (event) => {
        const file = event.target.files[0];

        const fileInput = event.target;

        if (file) {
            const reader = new FileReader();

            reader.onload = (e) => {
                setInputCmd(e.target.result);

                uploadData({ action: `Upload file ${file.name}`, success: "Success" });
            };

            reader.readAsText(file);
            setThresholdValue(1);
        }

        handleClickClose();

        fileInput.value = "";
    };

    return (
        <>
            <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center">
                <div className="bg-white p-6 rounded-lg shadow-lg max-w-[60vh] w-full">
                    <div className="flex flex-row justify-between mb-4">
                        <h1 className="font-bold">Select File to Repeat</h1>
                        <span className="text-xl font-bold cursor-pointer float-right" onClick={() => handleClickClose()}>
                            &times;
                        </span>
                    </div>

                    <input type="file" accept=".txt" onChange={handleFileUpload} className="hidden" id="repeat-file-upload" />
                    <label htmlFor="repeat-file-upload" className="border border-neutral-300 hover:bg-neutral-100 px-4 py-2 rounded-md cursor-pointer disabled:bg-neutral-100 mt-4">
                        Upload
                    </label>
                </div>
            </div>
        </>
    );
}
