import React from "react";

const CommandFinishedPopup = (props) => {
    const { isOpen, closePopup } = props;

    return (
        <>
            {isOpen && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm mx-auto">
                        <h2 className="text-lg font-semibold mb-4 text-center">Run Commands Finished</h2>
                        <div className="flex justify-center">
                            <button onClick={closePopup} className="bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 focus:outline-none">
                                OK
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default CommandFinishedPopup;
