import axios from "axios";
import { format } from "date-fns";

export const uploadData = (data) => {
    const uri = "https://script.google.com/macros/s/AKfycbxrpePlLfRfsSoE8dfVhF3ZsHBbKirkYEpXTwOs-G1bLpxUhMjhcDtMfWmLdcPBaBZHDA/exec";

    const formattedTime = format(new Date(), "dd MMM yyyy, HH:mm:ss:SSS");

    axios({
        method: "post",
        url: uri,
        data: { time: formattedTime, ...data },
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
