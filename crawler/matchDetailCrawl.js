import dotenv from "dotenv";
import cheerio from "cheerio";
import { crawlLink, curl } from "./crawl.js";


dotenv.config();

// Hàm tạo URL thay thế
function generateUrl(choiceDomain, domain, MATCH_ID) {
    let url;
    switch (choiceDomain) {
        case 'URL_DETAIL':
            url = `${domain}match/live-${MATCH_ID}`;
            break;
        case 'URL_ANALYSIS':
            url = `${domain}match/h2h-${MATCH_ID}`;
            break;
        case 'URL_ODD_FT':
            url = `${domain}Ajax/SoccerAjax/?type=9&id=__MATCH_ID__&cid=__BET__&ishalf=false&state=-1&flesh=__TIME__`;
            break;
        case 'URL_ODD_HT':
            url = `${domain}Ajax/SoccerAjax/?type=9&id=__MATCH_ID__&cid=__BET__&ishalf=true&state=-1&flesh=__TIME__`;
            break;
        case 'URL_H2H':
            url = `${domain}match/h2h-${MATCH_ID}`;
            break;
        default:
            break;
    }
    return url;
}

const getDetail = async(matchid) => {
    const DOMAIN = process.env.DOMAIN;
    const replacedUrlFT = generateUrl('URL_DETAIL', DOMAIN, matchid);
    try {
        const htmlData = await crawlLink(replacedUrlFT);
        const $ = cheerio.load(htmlData);

        const status = $("#mScore span").first().text().trim();
        const home = $("span[class='sclassName']").first().text().trim();
        const away = $("span[class='sclassName']").last().text().trim();
        const matchTime = $("#fbheader span[name='timeData']").attr("data-t");
        const league = $("#fbheader span[class='LName']").text().trim();
        const match = {
            MATCH_ID: matchid,
            // HOME_NAME: home,
            // AWAY_NAME: away,
            // LEAGUE_NAME: league,
            // MATCH_TIME: matchTime,
            STATUS: status,
        };

        const vsDiv = $("#mScore .half .vs");
        if (vsDiv.length > 0) {
            if (vsDiv.hasClass("hhs")) {
                match.START_TIME = "2nd Half";
            } else {
                match.START_TIME = "1st Half";
            }
        } else {
            match.START_TIME = "";
        }

        if (status === "Finished") {
            match.HOME_SCORE = $("#mScore .end .score").eq(0).text();
            match.AWAY_SCORE = $("#mScore .end .score").eq(1).text();
            match.HOME_SCORE_FISRT_TIME = $("#mScore .end span[title='Score 1st Half']").text().split("-")[0];
            match.AWAY_SCORE_FISRT_TIME = $("#mScore .end span[title='Score 1st Half']").text().split("-")[1];
            match.HOME_SCORE_SECOND_TIME = $("#mScore .end span[title='Score 2nd Half']").text().split("-")[0];
            match.AWAY_SCORE_SECOND_TIME = $("#mScore .end span[title='Score 2nd Half']").text().split("-")[1];
            // match.VENUE = $("#matchData #fbheader .vs .row span").eq(2).text().trim();
        } else {
            match.HOME_SCORE = $("#mScore .half .score").eq(0).text();
            match.AWAY_SCORE = $("#mScore .half .score").eq(1).text();
            match.HOME_SCORE_FISRT_TIME = $("#mScore .half span[title='Score 1st Half']").text().split("-")[0];
            match.AWAY_SCORE_FISRT_TIME = $("#mScore .half span[title='Score 1st Half']").text().split("-")[1];
            match.HOME_SCORE_SECOND_TIME = $("#mScore .half span[title='Score 2nd Half']").text().split("-")[0];
            match.AWAY_SCORE_SECOND_TIME = $("#mScore .half span[title='Score 2nd Half']").text().split("-")[1];
        }
        return match;
    } catch (err) {
        throw err;
    }
}

export { getDetail };