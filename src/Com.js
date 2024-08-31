// https://script.google.com/macros/s/AKfycbzZTk7jW1r08H_BjOeFiXLA1ZfYkeli3i8s8zqgmAQhcMBv-b-38eGiThE6GuhUpUrVPA/exec
// AKfycbzZTk7jW1r08H_BjOeFiXLA1ZfYkeli3i8s8zqgmAQhcMBv-b-38eGiThE6GuhUpUrVPA
import React, { useState } from "react";
import axios from "axios";

const App = () => {
    const [input, setInput] = useState("");
    const [color, setColor] = useState("white");
    const [colors] = useState(["white", "red", "green", "blue", "yellow"]); // Example colors

    const uri = "https://script.google.com/macros/s/AKfycbxrpePlLfRfsSoE8dfVhF3ZsHBbKirkYEpXTwOs-G1bLpxUhMjhcDtMfWmLdcPBaBZHDA/exec";

    const handleInputChange = (event) => setInput(event.target.value);
    const handleColorChange = (event) => setColor(event.target.value);

    const handleSubmit = async () => {
        const data = {
            Name: "John DOw",
            Email: "Face@Mail.com",
            Message: "This is just a message",
            sMessage: "This is just a message",
            wd: "Thiscasdcs is just a message",
            awd: "This is jdcsdcsust a message",
            wdddwd: "This is justdcdcs sssvs  s as s  smessage",
        };

        axios({
            method: "post",
            url: uri,
            data,
            headers: {
                "Content-Type": "text/plain;charset=utf-8",
            },
        })
            .then(function (response) {
                console.log(response);
            })
            .catch(function (error) {
                console.log(error);
            });
    };

    const downloadSheetAsExcel = () => {
        // Implement Excel download logic here
        alert("Download functionality is not implemented.");
    };

    return (
        <div style={{ padding: "20px" }}>
            <h1>Google Sheets Integration</h1>
            <input type="text" value={input} onChange={handleInputChange} placeholder="Enter your data" style={{ marginRight: "10px" }} />
            <select value={color} onChange={handleColorChange}>
                {colors.map((c, index) => (
                    <option key={index} value={c} style={{ backgroundColor: c }}>
                        {c}
                    </option>
                ))}
            </select>
            <button onClick={handleSubmit} style={{ marginLeft: "10px" }}>
                Add Data
            </button>
            <button onClick={downloadSheetAsExcel} style={{ marginLeft: "10px" }}>
                Download Excel
            </button>
            <div style={{ marginTop: "20px" }}>
                <h2>Preview</h2>
                <div
                    style={{
                        padding: "10px",
                        backgroundColor: color,
                        border: "1px solid #ccc",
                        borderRadius: "5px",
                    }}
                >
                    {input || "No data entered"}
                </div>
            </div>
        </div>
    );
};

export default App;
