import dotenv from "dotenv";
// import zlib from 'zlib';
import { curl } from "./crawl.js";

dotenv.config();


function generateUrl(domain, matchid, t, h, currentTime) {
    const url =
        `${domain}ajax/soccerajax?type=14&&id=${matchid}&t=${t}&cid=8&h=${h}&r1=0&r2=0&r3=0&flesh=${currentTime}`;
    return url;
}

const combineOddsLists = (oddsListFT, oddsListHT) => {
    const combinedOddsList = {
        ODDS_FT: {
            AH: [...oddsListFT["ah"].map(odds => ({ AH: (odds) })),],
            OP: [...oddsListFT["op"].map(odds => ({ OP: (odds) })),],
            OU: [...oddsListFT["ou"].map(odds => ({ OU: (odds) })),]
        },
        ODDS_HT: {
            AH: [...oddsListHT["ah"].map(odds => ({ AH: (odds) })),],
            OP: [...oddsListHT["op"].map(odds => ({ OP: (odds) })),],
            OU: [...oddsListHT["ou"].map(odds => ({ OU: (odds) })),]
        },
    };

    return combinedOddsList;
};


const crawl3in1 = async (matchid) => {
    const currentTime = Date.now();
    const DOMAIN = process.env.DOMAIN;
    const t = 20;
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

        const combinedOddsList = combineOddsLists(dataFT["Data"], dataHT["Data"]);

        return {
            MATCH_ID: matchid,
            ODDS: JSON.stringify(combinedOddsList),
        }

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
            if (retries < retryCount) {
                retries++;
                // console.error(`Request failed, retrying... (Attempt ${retries} of ${retryCount})`);
                await new Promise(resolve => setTimeout(resolve, 5000));
                return fetchData();
            } else {
                console.error("Max retries reached. Could not fetch data.");
                throw error;
            }
        }
    }
    return fetchData();
}


export { crawl3in1 };