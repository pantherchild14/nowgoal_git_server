import dotenv from "dotenv";
import { curl } from "./crawl.js";
import { updateSchedule, updateScheduleByTime } from "../controllers/scheduleController.js";

dotenv.config();
// Hàm tạo URL thay thế
function generateUrl(domain, date, currentTime) {
    const url =
        "__DOMAIN__ajax/SoccerAjax?type=6&date=__DATE__&order=time&timezone=0&flesh=__CURRENT_TIME__";

    const replacedUrl = url
        .replace("__DOMAIN__", domain)
        .replace("__DATE__", date)
        .replace("__CURRENT_TIME__", currentTime);

    return replacedUrl;
}
// Hàm lấy lịch trình
const crawlSchedule = async(date) => {
    const currentTime = Date.now();
    const DOMAIN = process.env.DOMAIN;
    const replacedUrl = generateUrl(DOMAIN, date, currentTime);
    try {
        const data = await curl(replacedUrl);
        // lấy giá trị của mảng B
        const patternB = /B\[[0-9]*\]=\[.*\]/g;
        const matchesB = data["Data"].match(patternB);
        const arLeague = {};
        matchesB.forEach((value) => {
            const arExpl = value.split("=");
            const index = arExpl[0].replace(/B\[|\]/g, "");
            const str = arExpl[1].replace(/\[|\]/g, "");

            const item = analysisDataTypeB(str);
            arLeague[index] = item;
        });

        // lấy giá trị của mảng A
        const patternA = /A\[[0-9]*\]=\[.*\]/g;
        const matchesA = data["Data"].match(patternA);
        const arrMatch = {};

        matchesA.forEach((value) => {
            const arExpl = value.split("=");
            const str = arExpl[1].replace(/\[|\]/g, "");

            const item = analysisDataTypeA(str);

            item.LEAGUE_ID = arLeague[item.LEAGUE_INDEX].LEAGUE_ID;
            item.LEAGUE_NAME = arLeague[item.LEAGUE_INDEX].NAME;
            item.LEAGUE_SHORT_NAME = arLeague[item.LEAGUE_INDEX].SHORT_NAME;
            delete item.LEAGUE_INDEX;

            arrMatch[item.MATCH_ID] = item;
        });
        // Object.values(arrMatch).forEach(async(match) => {
        //     // await updateSchedule(match);
        //     // await updateSchedule(match)
        // });

        /* convert data XML */

        const results = [];
        for (const match of Object.values(arrMatch)) {
            const matchs = await match;
            results.push(matchs);
        }
        return results;
    } catch (error) {
        console.error("Error:", error);
        throw new Error("Internal server error");
    }
};

const crawlStatusSchedule = async(date) => {
    const currentTime = Date.now();
    const DOMAIN = process.env.DOMAIN;
    const replacedUrl = generateUrl(DOMAIN, date, currentTime);
    try {
        const data = await curl(replacedUrl);

        // lấy giá trị của mảng A
        const patternA = /A\[[0-9]*\]=\[.*\]/g;
        const matchesA = data["Data"].match(patternA);
        const arrMatch = {};

        matchesA.forEach((value) => {
            const arExpl = value.split("=");
            const str = arExpl[1].replace(/\[|\]/g, "");

            const item = updateStatusAnalysisDataTypeA(str);

            delete item.LEAGUE_INDEX;

            arrMatch[item.MATCH_ID] = item;

        });
        for (const matchId in arrMatch) {
            const matchData = arrMatch[matchId];

            // Update the schedule in the database
            const currentDate = new Date();
            const startTime = new Date(currentDate.getTime() - 8 * 60 * 60 * 1000);
            const endTime = new Date(currentDate);
            await updateScheduleByTime(startTime, endTime, matchData.MATCH_ID, matchData);
        }
    } catch (error) {
        console.error("Error:", error);
        throw new Error("Internal server error");
    }
}

/*
 * Hàm phân tích dữ liệu loại A lấy được từ việc cào ở hàm crawl
 * Dữ liệu đầu vào có dạng: 2346247,29,8856,1036,'Deportes Santa Cruz','Deportes Temuco','2023,5,5,00,00,00',-1,1,1,1,0,1,0,4,1,'13','4','','',42,'','',3,8
 * Trong dữ các giá trị lần lượt tương ứng là:
 * Giá trị 0 - id trận đấu
 * Giá trị 1 - index giải đấu, lấy tương ứng từ mảng dữ liệu loại B cũng trả về từ hàm crawl ở trên
 * Giá trị 2 - id đội chủ nhà
 * Giá trị 3 - id đội khách
 * Giá trị 4 - Tên đội chủ nhà
 * Giá trị 5 - Tên đội khách
 * Giá trị 6 - Năm
 * Giá trị 7 - Tháng (Lưu ý giá trị tháng trả về tính từ 0 nên cần cộng thêm 1 đơn vị)
 * Giá trị 8 - Ngày
 * Giá trị 9 - Giờ
 * Giá trị 10 - Phút
 * Giá trị 11 - Giây
 * giá trị 12 - status
 * giá trị 13 - score home
 * giá trị 14 - score way
 * giá trị 15 - H (ex: *-T,int-int)
 * giá trị 16 - T (ex: H-*,int-int)
 * giá trị 17 - H-T (ex: H-T, *-int)
 * giá trị 18 - H-T (ex: H-T, int-*)
 * giá trị 19 - chưa rõ
 * giá trị 20 - chưa rõ
 * giá trị 21 - chưa rõ
 * giá trị 22 - chưa rõ
 * giá trị 23 - chưa rõ
 * giá trị 24 - chưa rõ
 * giá trị 25 - chưa rõ
 * giá trị 26 - chưa rõ
 * giá trị 27 - chưa rõ
 * giá trị 28 - C (ex:*-int)
 * giá trị 29 - C (ex:int-*)
 */
const analysisDataTypeA = (str) => {
    const arExpl = str.split(",");
    const matchTime = `${arExpl[6].trim().replace(/'/g, "")}-${parseInt(
      arExpl[7].trim().replace(/'/g, "")
    ) + 1}-${arExpl[8].trim().replace(/'/g, "")} ${arExpl[9]
      .trim()
      .replace(/'/g, "")}:${arExpl[10].trim().replace(/'/g, "")}:${arExpl[11]
      .trim()
      .replace(/'/g, "")}`;

    const timestamp = Date.parse(matchTime);

    return {
        MATCH_ID: arExpl[0],
        LEAGUE_INDEX: arExpl[1],
        HOME_ID: arExpl[2],
        AWAY_ID: arExpl[3],
        HOME_NAME: arExpl[4].trim().replace(/'/g, ""),
        AWAY_NAME: arExpl[5].trim().replace(/'/g, ""),
        TIME_STAMP: timestamp,
        MATCH_TIME: matchTime,
        STATUS: arExpl[12],
        SCORE_HOME: arExpl[13],
        SCORE_AWAY: arExpl[14],
        H_T: `${arExpl[15]}-${arExpl[16]}`,
        F_T: `${arExpl[17]}-${arExpl[18]}`,
        C: `${arExpl[28]}-${arExpl[29]}`
    };
};

const updateStatusAnalysisDataTypeA = (str) => {
    const arExpl = str.split(",");
    const matchTime = `${arExpl[6].trim().replace(/'/g, "")}-${parseInt(
      arExpl[7].trim().replace(/'/g, "")
    ) + 1}-${arExpl[8].trim().replace(/'/g, "")} ${arExpl[9]
      .trim()
      .replace(/'/g, "")}:${arExpl[10].trim().replace(/'/g, "")}:${arExpl[11]
      .trim()
      .replace(/'/g, "")}`;

    const timestamp = Date.parse(matchTime); // Chuyển đổi ngày tháng sang timestamp

    return {
        MATCH_ID: arExpl[0],
        LEAGUE_INDEX: arExpl[1],
        TIME_STAMP: timestamp,
        MATCH_TIME: matchTime,
        STATUS: arExpl[12],
        SCORE_HOME: arExpl[13],
        SCORE_AWAY: arExpl[14],
        H_T: `${arExpl[15]}-${arExpl[16]}`,
        F_T: `${arExpl[17]}-${arExpl[18]}`,
        C: `${arExpl[28]}-${arExpl[29]}`
    };
};

/*
 * Hàm phân tích dữ liệu loại B lấy được từ việc cào ở hàm crawl
 * Dữ liệu đầu vào có dạng: 2153,'BNY','Brazil national youth (U20) Football Championship','#339866',0,0,0,39
 * Trong dữ các giá trị lần lượt tương ứng là:
 * Giá trị 1 - id giải đấu
 * Giá trị 2 - tên viết tắt giải đấu
 * Giá trị 3 - tên đầy đủ giải đấu
 * giá trị 4 - color league
 * gía trị 5 - chưa rõ
 * giá trị 6 - chưa rõ
 * giá trị 7 - chưa rõ
 * giá trị 8 - chưa rõ
 */
function analysisDataTypeB(str) {
    const arExpl = str.split(",");
    return {
        LEAGUE_ID: arExpl[0],
        NAME: arExpl[2].trim().replace(/'/g, ""),
        SHORT_NAME: arExpl[1].trim().replace(/'/g, ""),
    };
}

export { crawlSchedule, crawlStatusSchedule };