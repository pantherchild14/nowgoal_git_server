import request from "request";
import axios from "axios";

export const curl = async(url, dataString = "") => {
    try {
        const options = {
            method: "POST",
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.139 Safari/537.36",
                "Content-Type": "application/json",
                "Content-Length": dataString.length.toString(),
            },
            data: dataString,
        };
        const response = await axios(url);
        return response.data;
    } catch (error) {
        throw new Error(error.message || "Internal server error");
    }
};

export const crawlLink = (link) => {
    return new Promise((resolve, reject) => {
        request(link, (error, response, body) => {
            if (!error && response.statusCode === 200) {
                resolve(body);
            } else {
                reject(error || "Internal server error");
            }
        });
    });
};