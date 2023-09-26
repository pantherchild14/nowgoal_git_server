import xmlbuilder from "xmlbuilder";
import { promises as fs } from "fs";
import { Parser } from "xml2js";
import { setHours, setMinutes, setSeconds, addHours } from "date-fns";
import { utcToZonedTime } from 'date-fns-tz';

import { get3in13DayXML, get3in1XML, getOdds3DayXML, getOddsGf, getOddsXML } from "../controllers/oddsController.js";
import { getDetail, crawlMatchH2H } from "../crawler/matchDetailCrawl.js";
import { crawlSchedule } from "../crawler/scheduleCrawl.js";
import { updateSchedule } from "../controllers/scheduleController.js";

const xml_change_odds = async () => {
    let retryCount = 0;
    const maxRetryCount = 5;
    const retryDelay = 5000;

    while (retryCount < maxRetryCount) {
        try {
            const data = await getOddsGf();
            const root = xmlbuilder.create("ODDS_DATA");
            data.forEach((item) => {
                const oddsItem = root.ele("ODDS_ITEM");
                Object.keys(item).forEach((key) => {
                    oddsItem.att(key, item[key]);
                });
            });
            const xmlString = root.end({ pretty: true });
            const folderPath = "./data_xml";
            try {
                await fs.access(folderPath);
            } catch (err) {
                await fs.mkdir(folderPath);
            }

            const filePath = "./data_xml/odds_data.xml";
            await fs.writeFile(filePath, xmlString);
            break;
            // console.log("XML file successfully odds_data_RealTime generated.");
        } catch (error) {
            // console.error("Error while getting odds data:", error.message);
            retryCount++;
            if (retryCount === maxRetryCount) {
                throw error;
            }
            await new Promise((resolve) => setTimeout(resolve, retryDelay));
        }
    }
};

const xml_change_schedule = async () => {
    let retryCount = 0;
    const maxRetryCount = 5;
    const retryDelay = 5000;

    while (retryCount < maxRetryCount) {
        try {
            const filePaths = "./data_xml/schedule_3_day.xml";
            const xmlData = await readXmlFile(filePaths);
            const jsData = await parseXmlToJs(xmlData);

            const scheduleItems = jsData.SCHEDULE_DATA.SCHEDULE_ITEM;

            const currentTime = new Date(); // Thời gian hiện tại
            const currentTimeGMT7 = utcToZonedTime(currentTime, 'Asia/Ho_Chi_Minh'); // Chuyển đổi sang GMT+7

            // Tạo thời gian bắt đầu (12:00 PM) và thời gian kết thúc (12:00 PM ngày tiếp theo) cho việc so sánh
            const todayStart = setSeconds(setMinutes(setHours(currentTimeGMT7, 6), 0), 0);
            const tomorrowStart = setSeconds(setMinutes(setHours(addHours(currentTimeGMT7, 24), 12), 0), 0);
            // // Lọc ra các sự kiện nằm trong khoảng từ 12:00AM hôm nay đến 12:00AM ngày mai
            const validEvents = scheduleItems.filter((item) => {
                const eventTimeGMT7 = utcToZonedTime(new Date(Number(item.$.TIME_STAMP)), 'Asia/Ho_Chi_Minh');
                return eventTimeGMT7 >= todayStart && eventTimeGMT7 <= tomorrowStart;
            });
            const matchIDs = validEvents.map((item) => item.$.MATCH_ID);
            const promises = matchIDs.map((id) => getDetail(id));
            const results = await Promise.allSettled(promises);
            const filteredSchedules = results
                .filter((result) => result.status === "fulfilled")
                .map((result) => result.value);

            const root = xmlbuilder.create("SCHEDULE_DATA");
            filteredSchedules.forEach((item) => {
                const oddsItem = root.ele("SCHEDULE_ITEM");
                Object.keys(item).forEach((key) => {
                    oddsItem.att(key, item[key]);
                });
            });
            const xmlString = root.end({ pretty: true });
            const folderPath = "./data_xml";
            try {
                await fs.access(folderPath);
            } catch (err) {
                await fs.mkdir(folderPath);
            }
            const filePath = "./data_xml/schedule_data.xml";
            await fs.writeFile(filePath, xmlString);
            break;
        } catch (error) {
            console.error("Error while getting schedule data:", error.message);
            retryCount++;
            if (retryCount === maxRetryCount) {
                throw error;
            }
            await new Promise((resolve) => setTimeout(resolve, retryDelay));
        }
    }
};

// const xml_change_schedule_3day = async () => {
//     let retryCount = 0;
//     const maxRetryCount = 5;
//     const retryDelay = 5000;

//     while (retryCount < maxRetryCount) {
//         try {
//             const filePaths = "./data_xml/schedule_3_day.xml";
//             const xmlData = await readXmlFile(filePaths);
//             const jsData = await parseXmlToJs(xmlData);

//             const scheduleItems = jsData.SCHEDULE_DATA.SCHEDULE_ITEM;
//             const matchIDs = scheduleItems.map((item) => item.$.MATCH_ID);
//             const promises = matchIDs.map((id) => getDetail(id));
//             const results = await Promise.allSettled(promises);
//             const filteredSchedules = results
//                 .filter((result) => result.status === "fulfilled")
//                 .map((result) => result.value);

//             const root = xmlbuilder.create("SCHEDULE_DATA");
//             filteredSchedules.forEach((item) => {
//                 const oddsItem = root.ele("SCHEDULE_ITEM");
//                 Object.keys(item).forEach((key) => {
//                     oddsItem.att(key, item[key]);
//                 });
//             });
//             const xmlString = root.end({ pretty: true });
//             const folderPath = "./data_xml";
//             try {
//                 await fs.access(folderPath);
//             } catch (err) {
//                 await fs.mkdir(folderPath);
//             }
//             const filePath = "./data_xml/schedule_detail_3_day.xml";
//             await fs.writeFile(filePath, xmlString);
//             break;
//         } catch (error) {
//             console.error("Error while getting schedule data:", error.message);
//             retryCount++;
//             if (retryCount === maxRetryCount) {
//                 throw error;
//             }
//             await new Promise((resolve) => setTimeout(resolve, retryDelay));
//         }
//     }
// };

const fetchH2HData = async (matchid, cache) => {
    if (cache.has(matchid)) {
        return cache.get(matchid);
    }

    let retryCount = 3;
    while (retryCount > 0) {
        try {
            const h2hData = await crawlMatchH2H(matchid);
            cache.set(matchid, h2hData);
            return h2hData;
        } catch (error) {
            if (error.code === 'ETIMEDOUT' || error.code === 'ECONNRESET') {
                console.log(`Request failed, retrying... (${retryCount} attempts left)`);
                retryCount--;
                await new Promise((resolve) => setTimeout(resolve, 1000));
            } else {
                console.error(error);
                break;
            }
        }
    }
    return {};
};


const h2h = async () => {
    try {
        const filePath = "./data_xml/schedule_3_day.xml";
        const xmlData = await readXmlFile(filePath);
        const jsData = await parseXmlToJs(xmlData);

        const scheduleItems = jsData.SCHEDULE_DATA.SCHEDULE_ITEM;

        const currentTime = new Date(); // Thời gian hiện tại
        const currentTimeGMT7 = utcToZonedTime(currentTime, 'Asia/Ho_Chi_Minh'); // Chuyển đổi sang GMT+7

        // Tạo thời gian bắt đầu (12:00 PM) và thời gian kết thúc (12:00 PM ngày tiếp theo) cho việc so sánh
        const todayStart = setSeconds(setMinutes(setHours(currentTimeGMT7, 6), 0), 0);
        const tomorrowStart = setSeconds(setMinutes(setHours(addHours(currentTimeGMT7, 24), 12), 0), 0);
        // // Lọc ra các sự kiện nằm trong khoảng từ 12:00AM hôm nay đến 12:00AM ngày mai
        const validEvents = scheduleItems.filter((item) => {
            const eventTimeGMT7 = utcToZonedTime(new Date(Number(item.$.TIME_STAMP)), 'Asia/Ho_Chi_Minh');
            return eventTimeGMT7 >= todayStart && eventTimeGMT7 <= tomorrowStart;
        });

        const cache = new Map();

        const promises = validEvents.map((match) => {
            const matchId = match.$.MATCH_ID;
            return fetchH2HData(matchId, cache);
        });
        const combinedData = await Promise.all(promises);

        // Loại bỏ các giá trị null (trận đấu nằm ngoài khoảng thời gian)
        const validData = combinedData.filter((data) => data !== null);

        return validData;
    } catch (err) {
        console.log(err);
        return [];
    }
};

// const h2h = async () => {
//     try {
//         const filePath = "./data_xml/scheduleAll_data.xml";
//         const xmlData = await readXmlFile(filePath);
//         const jsData = await parseXmlToJs(xmlData);
//         const scheduleData = jsData['SCHEDULE_DATA']['SCHEDULE_ITEM'];

//         const cache = new Map();

//         const currentTime = new Date().getTime();
//         const beforeTime = currentTime - 10 * 60 * 60 * 1000;
//         const endTime = currentTime + 0 * 60 * 60 * 1000;

//         const promises = scheduleData.map((match) => {
//             const matchTime = new Date(match.$.MATCH_TIME).getTime();
//             if (matchTime >= beforeTime && matchTime <= endTime) {
//                 const matchId = match.$.MATCH_ID;
//                 return fetchH2HData(matchId, cache);
//             }
//             return null;
//         });
//         const combinedData = await Promise.all(promises);

//         // Loại bỏ các giá trị null (trận đấu nằm ngoài khoảng thời gian)
//         const validData = combinedData.filter((data) => data !== null);

//         return validData;
//     } catch (err) {
//         console.log(err);
//         return [];
//     }
// };


const h2h_3day = async () => {
    try {
        const filePath = "./data_xml/schedule_3_day.xml";
        const xmlData = await readXmlFile(filePath);
        const jsData = await parseXmlToJs(xmlData);
        const scheduleData = jsData['SCHEDULE_DATA']['SCHEDULE_ITEM'];

        const cache = new Map();
        const promises = scheduleData.map((match) => fetchH2HData(match.$.MATCH_ID, cache));
        const combinedData = await Promise.all(promises);

        return combinedData;
    } catch (err) {
        console.log(err);
        return [];
    }
};

const xml_h2h = async (req, res, next) => {
    try {
        const results = await h2h();
        const scheduleArray = Array.isArray(results) ? results : [results];

        const root = xmlbuilder.create("H2H_DATA");
        scheduleArray.forEach((item) => {
            const oddsItem = root.ele("H2H_ITEM");
            Object.keys(item).forEach((key) => {
                oddsItem.att(key, item[key]);
            });
        });
        const xmlString = root.end({ pretty: true });
        const folderPath = "./data_xml";
        try {
            await fs.access(folderPath);
        } catch (err) {
            await fs.mkdir(folderPath);
        }
        const filePath = "./data_xml/h2h_data.xml";
        await fs.writeFile(filePath, xmlString);
        console.log("XML file successfully generated.");
    } catch (error) {
        console.error("Error crawl h2h xml : ", error);
    }
};

const xml_h2h_3day = async (req, res, next) => {
    try {
        const results = await h2h_3day();
        const scheduleArray = Array.isArray(results) ? results : [results];

        const root = xmlbuilder.create("H2H_DATA");
        scheduleArray.forEach((item) => {
            const oddsItem = root.ele("H2H_ITEM");
            Object.keys(item).forEach((key) => {
                oddsItem.att(key, item[key]);
            });
        });
        const xmlString = root.end({ pretty: true });
        const folderPath = "./data_xml";
        try {
            await fs.access(folderPath);
        } catch (err) {
            await fs.mkdir(folderPath);
        }
        const filePath = "./data_xml/h2h_3_day.xml";
        await fs.writeFile(filePath, xmlString);
        console.log("XML file successfully h2h_3_day generated.");
    } catch (error) {
        console.error("Error crawl h2h xml : ", error);
    }
};

const xml_schedule = async (req, res, next) => {
    try {
        const currentDate = new Date();

        function formatDate(date) {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        }

        const formattedDate = formatDate(currentDate);
        const results = await crawlSchedule(formattedDate);

        const scheduleArray = Array.isArray(results) ? results : [results];

        const root = xmlbuilder.create("SCHEDULE_DATA");
        scheduleArray.forEach((item) => {
            const oddsItem = root.ele("SCHEDULE_ITEM");
            Object.keys(item).forEach((key) => {
                oddsItem.att(key, item[key]);
            });
        });
        const xmlString = root.end({ pretty: true });
        const folderPath = "./data_xml";
        try {
            await fs.access(folderPath);
        } catch (err) {
            await fs.mkdir(folderPath);
        }
        const filePath = "./data_xml/scheduleAll_data.xml";
        await fs.writeFile(filePath, xmlString);
    } catch (error) {
        console.error("Error crawl schedule xml : ", error);
    }
};

const xml_schedule_deleted = async (req, res, next) => {
    try {
        const currentDate = new Date();

        const yesterdayDate = new Date(currentDate);
        yesterdayDate.setDate(yesterdayDate.getDate() - 1);

        function formatDate(date) {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        }

        // Sử dụng ngày hôm qua để lấy dữ liệu
        const formattedDate = formatDate(yesterdayDate);
        const results = await crawlSchedule(formattedDate);

        const scheduleArray = Array.isArray(results) ? results : [results];

        const root = xmlbuilder.create("SCHEDULE_DATA");
        scheduleArray.forEach((item) => {
            const oddsItem = root.ele("SCHEDULE_ITEM");
            Object.keys(item).forEach((key) => {
                oddsItem.att(key, item[key]);
            });
        });
        const xmlString = root.end({ pretty: true });
        const folderPath = "./data_xml";
        try {
            await fs.access(folderPath);
        } catch (err) {
            await fs.mkdir(folderPath);
        }
        const filePath = "./data_xml/scheduleDeleted_data.xml";
        await fs.writeFile(filePath, xmlString);
    } catch (error) {
        console.error("Error crawl schedule xml : ", error);
    }
};


const xml_schedule3Day = async (req, res, next) => {
    try {
        const currentDate = new Date();

        function formatDate(date) {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        }

        const folderPath = "./data_xml";
        try {
            await fs.access(folderPath);
        } catch (err) {
            await fs.mkdir(folderPath);
        }

        const filePath = "./data_xml/schedule_3_day.xml";
        let root;
        try {
            const existingData = await fs.readFile(filePath, "utf-8");
            root = xmlbuilder.create(existingData, { parseOptions: { ignoreDecorators: true } });
        } catch (error) {
            root = xmlbuilder.create("SCHEDULE_DATA");
        }

        for (let i = 0; i <= 2; i++) {
            const dateToCrawl = new Date(currentDate);
            dateToCrawl.setDate(dateToCrawl.getDate() + i);
            const formattedDate = formatDate(dateToCrawl);
            const results = await crawlSchedule(formattedDate);

            const scheduleArray = Array.isArray(results) ? results : [results];

            scheduleArray.forEach((item) => {
                const oddsItem = root.ele("SCHEDULE_ITEM");
                Object.keys(item).forEach((key) => {
                    oddsItem.att(key, item[key]);
                });
            });

            console.log(`Crawled schedule for ${formattedDate}`);
        }

        const xmlString = root.end({ pretty: true });
        await fs.writeFile(filePath, xmlString);
    } catch (error) {
        console.error("Error crawl schedule xml: ", error);
    }
};

const updateScheduleFor3Days = async (req, res, next) => {
    try {
        const filePath = "./data_xml/schedule_3_day.xml";
        const xmlData = await readXmlFile(filePath);
        const jsData = await parseXmlToJs(xmlData);
        const dataJS = jsData['SCHEDULE_DATA']['SCHEDULE_ITEM'];

        const updatePromises = dataJS.map(async (match) => {
            return updateSchedule(match.$);
        });

        await Promise.all(updatePromises);


    } catch (error) {
        console.error("Error retrieving createScheduleMiddleware: ", error);
    }
};

const xml_odds = async (req, res, next) => {
    try {
        let data;
        try {
            data = await getOddsXML();
        } catch (error) {
            console.error("Error fetching odds data: ", error);
            return;
        }

        if (!Array.isArray(data)) {
            console.error("Invalid odds data format. Expected an array.");
            return;
        }

        const root = xmlbuilder.create("ODDS_DATA");
        for (const item of data) {
            if (!item || typeof item !== "object") {
                console.error("Invalid odds data format:", item);
                continue;
            }

            const oddsItem = root.ele("ODDS_ITEM");
            for (const key of Object.keys(item)) {
                oddsItem.att(key, item[key]);
            }
        }
        const xmlString = root.end({ pretty: true });
        const folderPath = "./data_xml";
        try {
            await fs.access(folderPath);
        } catch (err) {
            await fs.mkdir(folderPath);
        }

        const filePath = "./data_xml/oddsAll_data.xml";
        await fs.writeFile(filePath, xmlString);
        console.log("XML file successfully generated.");
    } catch (error) {
        console.error("Error crawl odds xml: ", error);
        return;
    }
};

const xml_odds_3Day = async (req, res, next) => {
    try {
        let data;
        try {
            data = await getOdds3DayXML();
        } catch (error) {
            console.error("Error fetching odds data: ", error);
            return;
        }

        if (!Array.isArray(data)) {
            console.error("Invalid odds data format. Expected an array.");
            return;
        }

        const root = xmlbuilder.create("ODDS_DATA");
        for (const item of data) {
            if (!item || typeof item !== "object") {
                console.error("Invalid odds data format:", item);
                continue;
            }

            const oddsItem = root.ele("ODDS_ITEM");
            for (const key of Object.keys(item)) {
                oddsItem.att(key, item[key]);
            }
        }
        const xmlString = root.end({ pretty: true });
        const folderPath = "./data_xml";
        try {
            await fs.access(folderPath);
        } catch (err) {
            await fs.mkdir(folderPath);
        }

        const filePath = "./data_xml/oddsAll_data_3_day.xml";
        await fs.writeFile(filePath, xmlString);
        console.log("XML file successfully generated.");
    } catch (error) {
        console.error("Error crawl odds xml: ", error);
        return;
    }
};

/* --------------------------------------------------------------- */
/* Odds History was change new type */

// const xml_odds_change_detail = async (req, res, next) => {
//     try {
//         let data;
//         try {
//             data = await getOddsDetailHistoryXML();
//         } catch (error) {
//             console.error("Error fetching odds data: ", error);
//             return;
//         }
//         if (!Array.isArray(data)) {
//             console.error("Invalid odds data format. Expected an array.");
//             return;
//         }

//         const root = xmlbuilder.create("ODDS_DATA");
//         for (const item of data) {
//             if (!item || typeof item !== "object") {
//                 console.error("Invalid odds data format:", item);
//                 continue;
//             }
//             const oddsItem = root.ele("ODDS_ITEM");
//             for (const key of Object.keys(item)) {
//                 const safeKey = `_${key}`.replace(/\W+/g, "_");
//                 oddsItem.att(safeKey, item[key]);
//             }
//         }
//         const xmlString = root.end({ pretty: true });
//         const folderPath = "./data_xml";
//         try {
//             await fs.access(folderPath);
//         } catch (err) {
//             await fs.mkdir(folderPath);
//         }

//         const filePath = "./data_xml/odds_change_detail_history.xml";
//         await fs.writeFile(filePath, xmlString);
//         console.log("XML file successfully generated.");
//     } catch (error) {
//         console.error("Error crawl odds xml: ", error);
//         return;
//     }
// };

/* --------------------------------------------------------------- */


const xml_3in1 = async (req, res, next) => {
    try {
        let data;
        try {
            data = await get3in1XML();
        } catch (error) {
            console.error("Error fetching odds data: ", error);
            return;
        }
        if (!Array.isArray(data)) {
            console.error("Invalid odds data format. Expected an array.");
            return;
        }

        const root = xmlbuilder.create("ODDS_DATA");
        for (const item of data) {
            if (!item || typeof item !== "object") {
                console.error("Invalid odds data format:", item);
                continue;
            }
            const oddsItem = root.ele("ODDS_ITEM");
            for (const key of Object.keys(item)) {
                const safeKey = `_${key}`.replace(/\W+/g, "_");
                oddsItem.att(safeKey, item[key]);
            }
        }
        const xmlString = root.end({ pretty: true });
        const folderPath = "./data_xml";
        try {
            await fs.access(folderPath);
        } catch (err) {
            await fs.mkdir(folderPath);
        }

        const filePath = "./data_xml/3in1.xml";
        await fs.writeFile(filePath, xmlString);
        console.log("XML file successfully generated.");
    } catch (error) {
        console.error("Error crawl odds xml: ", error);
        return;
    }
};

const xml_3in1_3Day = async (req, res, next) => {
    try {
        let data;
        try {
            data = await get3in13DayXML();
        } catch (error) {
            console.error("Error fetching odds data: ", error);
            return;
        }
        if (!Array.isArray(data)) {
            console.error("Invalid odds data format. Expected an array.");
            return;
        }

        const root = xmlbuilder.create("ODDS_DATA");
        for (const item of data) {
            if (!item || typeof item !== "object") {
                console.error("Invalid odds data format:", item);
                continue;
            }
            const oddsItem = root.ele("ODDS_ITEM");
            for (const key of Object.keys(item)) {
                const safeKey = `_${key}`.replace(/\W+/g, "_");
                oddsItem.att(safeKey, item[key]);
            }
        }
        const xmlString = root.end({ pretty: true });
        const folderPath = "./data_xml";
        try {
            await fs.access(folderPath);
        } catch (err) {
            await fs.mkdir(folderPath);
        }

        const filePath = "./data_xml/3in1_3_day.xml";
        await fs.writeFile(filePath, xmlString);
        console.log("XML file successfully generated.");
    } catch (error) {
        console.error("Error crawl odds xml: ", error);
        return;
    }
};


const readXmlFile = async (filePath) => {
    try {
        const data = await fs.readFile(filePath, "utf8");
        return data;
    } catch (err) {
        throw err;
    }
};

const parseXmlToJs = (xmlData) => {
    return new Promise((resolve, reject) => {
        const parser = new Parser();
        parser.parseString(xmlData, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
};

export {
    xml_change_odds,
    xml_change_schedule,
    xml_schedule,
    xml_schedule_deleted,
    xml_odds,
    xml_h2h,
    xml_h2h_3day,
    readXmlFile,
    parseXmlToJs,
    xml_3in1,
    updateScheduleFor3Days,
    xml_schedule3Day,
    xml_3in1_3Day,
    xml_odds_3Day,
    // xml_change_schedule_3day
};