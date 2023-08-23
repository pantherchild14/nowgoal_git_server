import xmlbuilder from "xmlbuilder";
import { promises as fs } from "fs";
import { Parser } from "xml2js";
import { getOddsDetailHistoryXML, getOddsGf, getOddsXML } from "../controllers/oddsController.js";
import { getDetail, crawlMatchH2H } from "../crawler/matchDetailCrawl.js";
import { crawlSchedule } from "../crawler/scheduleCrawl.js";

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
            const checkID = await getOddsGf();
            const promises = checkID.map((e) => getDetail(e.MATCH_ID));
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
        const filePath = "./data_xml/scheduleAll_data.xml";
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

const xml_odds_change_detail = async (req, res, next) => {
    try {
        let data;
        try {
            data = await getOddsDetailHistoryXML();
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

        const filePath = "./data_xml/odds_change_detail_history.xml";
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

export { xml_change_odds, xml_change_schedule, xml_schedule, xml_odds, xml_odds_change_detail, xml_h2h, readXmlFile, parseXmlToJs };