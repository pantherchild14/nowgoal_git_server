import dotenv from "dotenv";
// import zlib from 'zlib';
import { curl } from "./crawl.js";
import cheerio from "cheerio";

dotenv.config();

function generateUrl(domain, matchid, t, currentTime) {
    const url =
        `${domain}Ajax/SoccerAjax/?type=${t}&id=${matchid}&flesh=${currentTime}`;
    return url;
}

const crawlTimeRun = async (matchid) => {
    const currentTime = Date.now();
    const DOMAIN = process.env.DOMAIN;
    const t = 11;

    const replacedUrlFT = generateUrl(DOMAIN, matchid, t, currentTime);
    try {
        const time = await timeRun(matchid, replacedUrlFT);
        return time;
    } catch (err) {
        console.error("Error crawling Time Run:", err);
        return null;
    }
}

const timeRun = async (matchid, url) => {
    try {
        const data = await curl(url);

        if (data["ErrCode"] !== 0) {
            console.log(`Error fetching odds data for match ID ${matchid}`);
            return null;
        }

        return statusTime(matchid, data['Data']);
    } catch (err) {

    }
}

const statusTime = (matchid, str) => {
    const state = str["state"];
    const time = str["time"];
    const html = str["html"];
    const $ = cheerio.load(html);
    const scoreHome = $('.score').first().text();
    const scoreAway = $('.score').last().text();

    const data = {
        MATCH_ID: matchid,
        STATE: state,
        TIME: time,
        SCORE_HOME: scoreHome,
        SCORE_AWAY: scoreAway,
        // HTML: html,
    }

    return data;
}

export { crawlTimeRun }