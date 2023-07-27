import dotenv from "dotenv";
import asyncHandler from "express-async-handler";
import { parseString } from 'xml2js';
import { curl } from "./crawl.js";

dotenv.config();

// Hàm tạo URL thay thế
function generateUrl(domain, BET_ID, currentTime) {
    const url =
        `${domain}gf/data/odds/en/goal${BET_ID}.xml?${currentTime}`;

    return url;
}

function extractValuesFromXML(xmlData) {
    return new Promise((resolve, reject) => {
        parseString(xmlData, (err, result) => {
            if (err) {
                reject(err);
            } else {
                const matchArray = result.c.match;
                const matchData = matchArray.map(match => {
                    const matchValuesArray = match.m.map(value => {
                        const valueNames = ['MATCH_ID', 'unknow2', 'Handicap', 'HomeHandicap', 'AwayHandicap', 'unknow6', 'HW', 'D', 'AW', 'unknow10', 'Goals', 'Over', 'Under', 'unknow14', 'unknow15', 'unknow16', 'unknow17', 'unknow18', 'unknow19', 'unknow20', 'unknow21', 'unknow22', 'unknow23', 'unknow24'];
                        const values = value.split(',');
                        const namedValues = {};
                        values.forEach((val, index) => {
                            const name = valueNames[index];
                            namedValues[name] = val;
                        });
                        return namedValues;
                    });
                    return {
                        values: matchValuesArray
                    };
                });
                resolve(matchData);
            }
        });
    });
}

const crawlGfOdds = asyncHandler(async() => {
    const currentTime = Date.now();
    const DOMAIN = process.env.DOMAIN;
    const BET_ID = process.env.BET_ID;
    const replacedUrl = generateUrl(DOMAIN, BET_ID, currentTime);
    let resultData = [];

    try {
        const data = await curl(replacedUrl);
        const matches = await extractValuesFromXML(data);
        const matchDataArray = matches.map(match => match.values);

        for (let i = 0; i < matchDataArray.length; i++) {
            const matchData = matchDataArray[i];
            for (let j = 0; j < matchData.length; j++) {
                const matchValues = matchData[j];
                resultData.push(matchValues);
            }
        }

    } catch (error) {
        console.error("Error while fetching odds data:", error);
        throw new Error("Error while fetching odds data");
    }

    return resultData;
});

export default crawlGfOdds;