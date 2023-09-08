import dotenv from "dotenv";
import zlib from 'zlib';
import { curl } from "./crawl.js";

dotenv.config();

function generateUrl(domain, matchid, t, h, currentTime) {
    const url =
        `${domain}ajax/soccerajax?type=14&id=${matchid}&t=${t}&cid=8&h=${h}&flesh=${currentTime}`;

    return url;
}


const crawlOddsDetail = async (matchid) => {
    const currentTime = Date.now();
    const DOMAIN = process.env.DOMAIN;
    const t = 22;
    const FT = 0;
    const HT = 1;

    const replacedUrlFT = generateUrl(DOMAIN, matchid, t, FT, currentTime);
    const replacedUrlHT = generateUrl(DOMAIN, matchid, t, HT, currentTime);
    try {
        const dataFT = await fetchDataWithRetry(replacedUrlFT);
        const dataHT = await fetchDataWithRetry(replacedUrlHT);


        if (dataFT["ErrCode"] !== 0 || dataHT["ErrCode"] !== 0) {
            return null;
        }

        const oddsListFT = dataFT["Data"]["oddsList"];
        const oddsListHT = dataHT["Data"]["oddsList"];

        const extractedOddsListFT = oddsListFT.map(item => oddsFT(item));
        const extractedOddsListHT = oddsListHT.map(item => oddsHT(item));

        const matchedOddsData = extractedOddsListFT.map(ftItem => {
            const matchingHtItem = extractedOddsListHT.find(htItem => htItem.MATCH_ID === ftItem.MATCH_ID);
            if (matchingHtItem) {
                return {
                    MATCH_ID: ftItem.MATCH_ID,
                    ODDS_FT: ftItem.ODDS_FT,
                    CLOSE_FT: ftItem.CLOSE,
                    GS_FT: ftItem.GS,
                    HS_FT: ftItem.HS,
                    HT_FT: ftItem.HT,
                    TIME_CHANGE_FT: ftItem.TIME_CHANGE_FT,

                    CLOSE_HT: matchingHtItem.CLOSE,
                    GS_HT: matchingHtItem.GS,
                    HS_FT: matchingHtItem.HS,
                    HT_HT: matchingHtItem.HT,
                    ODDS_HT: matchingHtItem.ODDS_HT,
                    TIME_CHANGE_HT: matchingHtItem.TIME_CHANGE_HT,
                };
            }
            return ftItem;
        });
        return {
            MATCH_ID: matchid,
            ODDS_DATA: JSON.stringify(matchedOddsData),
        };
    } catch (err) {
        console.error("Error crawling odds detail:", err);
        return null;
    }


};

async function fetchDataWithRetry(url) {
    const retryCount = 3;
    let retries = 0;

    async function fetchData() {
        try {
            const data = await curl(url);
            return data;
        } catch (error) {
            // if (retries < retryCount) {
            //     retries++;
            //     // console.error(`Request failed, retrying... (Attempt ${retries} of ${retryCount})`);
            //     await new Promise(resolve => setTimeout(resolve, 5000));
            //     return fetchData();
            // } else {
            //     console.error("Max retries reached. Could not fetch data.");
            //     throw error;
            // }
        }
    }
    return fetchData();
}


const oddsFT = (str) => {
    const odds = str["odds"];
    const time_change = str["mt"];
    const close = str["close"];
    const gs = str["gs"];
    const hs = str["hs"];
    const ht = str["ht"];

    const oddsData = {
        CLOSE: String(close),
        GS: gs,
        HS: hs,
        HT: ht,
        ODDS_FT: odds,
        TIME_CHANGE_FT: time_change,
    };

    return oddsData;
};

const oddsHT = (str) => {
    const odds = str["odds"];
    const time_change = str["mt"];
    const close = str["close"];
    const gs = str["gs"];
    const hs = str["hs"];
    const ht = str["ht"];

    const oddsData = {
        CLOSE: String(close),
        GS: gs,
        HS: hs,
        HT: ht,
        ODDS_HT: odds,
        TIME_CHANGE_HT: time_change,
    };

    return oddsData;
};


export { crawlOddsDetail };