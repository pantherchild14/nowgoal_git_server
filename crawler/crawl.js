import request from "request";
import axios from "axios";
import zlib from 'zlib';
import * as fetch from "node-fetch";

export const curl = async (url) => {
    try {
        const options = {
            method: "GET",
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36",
                "Accept": "*/*",
                "Accept-Encoding": "gzip, deflate, br",
                "Accept-Language": "en-US,en;q=0.9",
                "Content-Type": 'text/html; charset=utf-8',

            },
            // responseType: 'arraybuffer',
        };

        const response = await axios(url, options);

        if (response.headers['content-encoding'] === 'gzip') {
            const decompressedData = zlib.unzipSync(response.data);
            const jsonString = decompressedData.toString('utf8');
            try {
                const jsonData = JSON.parsse(jsonString);
                return jsonData;
            } catch (jsonError) {
                console.error("Error parsing JSON:", jsonError);
                return jsonString;
            }
        } else {
            return response.data;
        }
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