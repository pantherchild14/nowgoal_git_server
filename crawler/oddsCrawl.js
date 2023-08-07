import dotenv from "dotenv";
import { curl } from "./crawl.js";
import { updatedOdds } from "../controllers/oddsController.js";

dotenv.config();

function generateUrl(domain, t, matchid, h, currentTime) {
    const url =
        `${domain}ajax/soccerajax?type=14&t=${t}&id=${matchid}&h=${h}&flesh=${currentTime}`;

    return url;
}

const crawlOdds = async(matchid) => {
    const currentTime = Date.now();
    const DOMAIN = process.env.DOMAIN;
    const t = 1;
    const FT = 0;
    const HT = 1;

    const replacedUrlFT = generateUrl(DOMAIN, t, matchid, FT, currentTime);
    const replacedUrlHT = generateUrl(DOMAIN, t, matchid, HT, currentTime);
    try {
        const dataFT = await curl(replacedUrlFT);
        const dataHT = await curl(replacedUrlHT);

        if (dataFT["ErrCode"] !== 0 || dataHT["ErrCode"] !== 0) {
            return null;
        }

        const mixoddsFT = dataFT["Data"]["mixodds"];
        const arrBet365FT = process.env.BET_ID ? mixoddsFT.find((item) => item.cid === Number(process.env.BET_ID)) : undefined;
        const arrResFT = oddsFT(matchid, arrBet365FT);

        const mixoddsHT = dataHT["Data"]["mixodds"];
        const arrBet365HT = process.env.BET_ID ? mixoddsHT.find((item) => item.cid === Number(process.env.BET_ID)) : undefined;
        const arrResHT = oddsHT(matchid, arrBet365HT);

        if (arrResHT && arrResHT.MATCH_ID === arrResFT.MATCH_ID) {
            Object.assign(arrResFT, {
                ODDS_AH_HT: arrResHT.ODDS_AH_HT,
                ODDS_EURO_HT: arrResHT.ODDS_EURO_HT,
                ODDS_OU_HT: arrResHT.ODDS_OU_HT,
                ...arrResHT,
            });
        }

        // await updatedOdds(arrResFT)
        return arrResFT;
    } catch (err) {
        return null;
    }
};

const oddsFT = (matchid, str) => {
    const oddAh = JSON.stringify(str["ah"]);
    const oddEuro = JSON.stringify(str["euro"]);
    const oddOu = JSON.stringify(str["ou"]);

    const oddsData = {
        MATCH_ID: matchid,
        ODDS_AH_FT: oddAh,
        ODDS_EURO_FT: oddEuro,
        ODDS_OU_FT: oddOu,
    };

    return oddsData;
};

const oddsHT = (matchid, str) => {
    const oddAh = JSON.stringify(str["ah"]);
    const oddEuro = JSON.stringify(str["euro"]);
    const oddOu = JSON.stringify(str["ou"]);

    const oddsData = {
        MATCH_ID: matchid,
        ODDS_AH_HT: oddAh,
        ODDS_EURO_HT: oddEuro,
        ODDS_OU_HT: oddOu,
    };

    return oddsData;
};

export { crawlOdds };