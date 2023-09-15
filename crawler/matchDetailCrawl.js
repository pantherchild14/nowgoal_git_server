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

const getDetail = async (matchid) => {
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

        const weatherRow = $("#matchData #fbheader .vs .row").eq(4).text();
        const weatherMatch = weatherRow.match(/Weather:\s+(.+)/);
        const weatherInfo = weatherMatch ? weatherMatch[1].trim() : "";

        const match = {
            MATCH_ID: matchid,
            HOME_NAME: home,
            AWAY_NAME: away,
            LEAGUE_NAME: league,
            MATCH_TIME: matchTime,
            STATUS: status,
            WHEATHER: weatherInfo,
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
            // match.VENUE = $("#matchData #fbheader .vs .row").eq(2).text().trim();
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

const crawlMatchH2H = async (matchID) => {
    try {

        const match = await getH2H(matchID);

        if (!match) {
            return {};
        }


        if (Object.keys(match).length > 0) {
            match.MATCH_ID = matchID;

            if (Object.keys(match.H2H).length > 0) {
                match.H2H = JSON.stringify(match.H2H);
            }

            if (Object.keys(match.LAST_MATCH_HOME).length > 0) {
                match.LAST_MATCH_HOME = JSON.stringify(match.LAST_MATCH_HOME);
            }

            if (Object.keys(match.LAST_MATCH_AWAY).length > 0) {
                match.LAST_MATCH_AWAY = JSON.stringify(match.LAST_MATCH_AWAY);
            }
            return match;
        }
    } catch (err) {
        if (err.code === 'ETIMEDOUT') {
            console.error(`Connection timed out for matchID: ${matchID}`);
        } else {
            console.error(`Error fetching H2H data for matchID: ${matchID}`, err);
        }
        return {};
    }
};

/*
 * Hàm cào thông số đối đầu của cả trận.
 * Trong đó:
 * Bảng Head to Head Statistics
 * 0 => League/Cup	  
 * 1 => 
 * 2 => Date
 * 3 => Home
 * 4 => 
 * 5 => Score
 * 6 => 
 * 7 => Away
 * 8 =>
 * 9 => Corner
 * 10 => Thời gian cập nhật kèo
 * 11 =>
 * 12 =>
 * 13 =>
 * 14 =>
 * 15 =>
 * 16 =>
 * 17 => W/L
 * 18 =>
 * 19 =>
 * 20 =>
 * 21 =>
 * 22 =>
 * 23 =>
 * 24 =>
 * 25 =>
 * 26 =>
 * 27 =>
 * 28 =>
 */

const getH2H = async (matchid) => {
    const DOMAIN = process.env.DOMAIN;
    const replacedUrlFT = generateUrl('URL_ANALYSIS', DOMAIN, matchid);
    try {
        const htmlData = await crawlLink(replacedUrlFT);
        const $ = cheerio.load(htmlData);
        const arRes = {
            MATCH_ID: matchid,
            H2H: [],
            LAST_MATCH_HOME: [],
            LAST_MATCH_AWAY: [],
        };

        const arReplace = {
            formatDate: "",
            "(": "",
            "'": "",
            ")": "",
        };

        const arTitle = ["League", "Date", "Home", "Score", "Away", "Corner", "W/L"];
        let ind = 0;
        $("#table_v3 tr").each((_, tr) => {
            if (ind < 3) {
                ind++;
                return;
            }

            const arTemp = {};
            let j = 0;

            $(tr).children("td").each((_, td) => {

                const temp = $(td).text();

                if (typeof temp === "string" && temp.trim() !== "") {

                    if (temp === 'No Data!') {
                        return false;
                    }

                    if (temp === "") {
                        return;
                    }

                    if (!arTitle[j]) {
                        return;
                    }

                    if (arTitle[j] === "Date") {
                        arTemp[arTitle[j]] = convertDateOdds(temp);

                    } else if (arTitle[j] === "Score" || arTitle[j] === "Corner") {
                        const [firstPart, secondPart] = temp.split("(");
                        arTemp[arTitle[j]] = firstPart.trim();
                        if (secondPart && typeof secondPart === "string") {
                            arTemp[`Half${arTitle[j]}`] = secondPart.trim().replace(/formatDate|\(|'|\)/g, matched => arReplace[matched]);
                        }
                    }
                    else if (arTitle[j] === "W/L") {
                        arTemp["W_L"] = temp.split(" ").map(value => value.trim()).filter(value => value !== "").join(", ");
                    }
                    else {
                        arTemp[arTitle[j]] = temp.trim();
                    }

                    j++;
                }
            });

            if (Object.keys(arTemp).length > 0) {
                arRes['H2H'].push(arTemp);
            }
        });
        ind = 0;
        $("#table_v1 tr").each((_, tr) => {
            if (ind < 3) {
                ind++;
                return;
            }

            const arTemp = {};
            let j = 0;
            $(tr).children("td").each((_, td) => {
                const temp = $(td).text();
                if (typeof temp === "string" && temp.trim() !== "") {
                    const temp = $(td).text().trim();

                    if (temp === 'No Data!') {
                        return false;
                    }

                    if (temp === "") {
                        return;
                    }

                    if (!arTitle[j]) {
                        return;
                    }

                    if (arTitle[j] === "Date") {
                        arTemp[arTitle[j]] = convertDateOdds(temp);
                    } else if (arTitle[j] === "Score" || arTitle[j] === "Corner") {
                        const [firstPart, secondPart] = temp.split("(");
                        arTemp[arTitle[j]] = firstPart.trim();
                        if (secondPart && typeof secondPart === "string") {
                            arTemp[`Half${arTitle[j]}`] = secondPart.trim().replace(/formatDate|\(|'|\)/g, matched => arReplace[matched]);
                        }
                    } else if (arTitle[j] === "W/L") {
                        arTemp["W_L"] = temp.split(" ").map(value => value.trim()).filter(value => value !== "").join(", ");
                    } else {
                        arTemp[arTitle[j]] = temp;
                    }
                    j++
                }
            });
            if (Object.keys(arTemp).length > 0) {
                arRes['LAST_MATCH_HOME'].push(arTemp);
            }
        });
        ind = 0
        $('#table_v2 tr').each((_, tr) => {
            if (ind < 3) {
                ind++;
                return;
            }

            const arTemp = {};
            let j = 0;

            $(tr).children('td').each((_, td) => {
                const temp = $(td).text();
                if (typeof temp === "string" && temp.trim() !== "") {
                    const temp = $(td).text().trim();

                    if (temp === 'No Data!') {
                        return false;
                    }

                    if (temp === "") {
                        return;
                    }

                    if (!arTitle[j]) {
                        return;
                    }

                    if (arTitle[j] === "Date") {
                        arTemp[arTitle[j]] = convertDateOdds(temp);
                    } else if (arTitle[j] === "Score" || arTitle[j] === "Corner") {
                        const [firstPart, secondPart] = temp.split("(");
                        arTemp[arTitle[j]] = firstPart.trim();
                        if (secondPart && typeof secondPart === "string") {
                            arTemp[`Half${arTitle[j]}`] = secondPart.trim().replace(/formatDate|\(|'|\)/g, matched => arReplace[matched]);
                        }
                    } else if (arTitle[j] === "W/L") {
                        arTemp["W_L"] = temp.split(" ").map(value => value.trim()).filter(value => value !== "").join(", ");
                    } else {
                        arTemp[arTitle[j]] = temp;
                    }

                    j++;
                }
            });
            if (Object.keys(arTemp).length > 0) {
                arRes['LAST_MATCH_AWAY'].push(arTemp);
            }
        });

        return arRes;
    } catch (err) {
        console.log(err)
    }
}


const convertDateOdds = (str) => {
    const arReplace = {
        formatDate: "",
        "(": "",
        "'": "",
        ")": "",
    };

    str = str.replace(/formatDate|\(|'|\)/g, matched => arReplace[matched]);

    const arStr = str.split(",");
    const m = arStr[1].split("-")[0];

    let month = m < 10 ? "0" + m : m;
    const time = new Date(`${arStr[0]}-${month}-${arStr[2]} ${arStr[3]}:${arStr[4]}:${arStr[5]}`).getTime();

    return time;
};




export { getDetail, crawlMatchH2H };