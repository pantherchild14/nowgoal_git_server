import xmlbuilder from "xmlbuilder";
import { promises as fs } from "fs";
import { Parser } from "xml2js";
import { getOddsGf } from "../controllers/oddsController.js";
import { getDetail } from "../crawler/matchDetailCrawl.js";

const xml_change_odds = async() => {
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
            console.error("Error while getting odds data:", error.message);
            retryCount++;
            if (retryCount === maxRetryCount) {
                throw error;
            }
            await new Promise((resolve) => setTimeout(resolve, retryDelay));
        }
    }
};


const xml_change_schedule = async() => {
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


const readXmlFile = async(filePath) => {
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

export { xml_change_odds, xml_change_schedule, readXmlFile, parseXmlToJs };