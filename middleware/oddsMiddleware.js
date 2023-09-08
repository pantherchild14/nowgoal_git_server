import { updateH2H, updateOddsHistory, updatedOdds } from "../controllers/oddsController.js";
import { crawlOdds } from "../crawler/oddsCrawl.js";
import { parseXmlToJs, readXmlFile } from "./changeXML.js";
import { getScheduleByTimeMiddleware, getScheduleMiddleware } from "./scheduleMiddleware.js";

const oddsMiddlerware = async (req, res, next) => {
    try {
        const arrSchedule = await getScheduleMiddleware();
        for (let i = 0; i < arrSchedule.length; i++) {
            for (let i = 0; i < arrSchedule.length; i++) {
                try {
                    await crawlOdds(arrSchedule[i]);
                } catch (error) {
                    console.error("Error updating odds for MATCH_ID:", arrSchedule[i]);
                }
            }
        }
    } catch (error) {
        console.error("Error retrieving schedules by time:", error);
    }
};


const oddsByTimeMiddlerware = async (req, res, next) => {
    try {
        const arrSchedule = await getScheduleByTimeMiddleware();
        for (let i = 0; i < arrSchedule.length; i++) {
            for (let i = 0; i < arrSchedule.length; i++) {
                try {
                    await crawlOdds(arrSchedule[i]);
                } catch (error) {

                }
            }
        }
    } catch (error) {
        console.error("Error retrieving schedules by time:", error);
    }
};

const oddsAllDataMiddlerware = async (req, res, next) => {
    try {
        const filePath = "./data_xml/oddsAll_data.xml";
        const xmlData = await readXmlFile(filePath);
        const jsData = await parseXmlToJs(xmlData);

        const oddsItems = jsData.ODDS_DATA.ODDS_ITEM;
        const updatePromises = oddsItems.map(async (match) => {
            const oddsData = {
                MATCH_ID: match.$.MATCH_ID,
                ODDS_AH_FT: match.$.ODDS_AH_FT,
                ODDS_EURO_FT: match.$.ODDS_EURO_FT,
                ODDS_OU_FT: match.$.ODDS_OU_FT,
                ODDS_AH_HT: match.$.ODDS_AH_HT,
                ODDS_EURO_HT: match.$.ODDS_EURO_HT,
                ODDS_OU_HT: match.$.ODDS_OU_HT,
            };

            await updatedOdds(oddsData);
        });

        await Promise.all(updatePromises);

    } catch (error) {
        console.error("Error retrieving schedules by time:", error);
    }
};

const oddsHistoryMiddlerware = async (req, res, next) => {
    try {
        const filePath = "./data_xml/3in1.xml";
        const xmlData = await readXmlFile(filePath);
        const jsData = await parseXmlToJs(xmlData);

        const oddsItems = jsData.ODDS_DATA.ODDS_ITEM;
        const updatePromises = oddsItems.map(async (match) => {
            const oddsHistoryData = {
                MATCH_ID: match.$._MATCH_ID,
                ODDS: match.$._ODDS,
            };

            await updateOddsHistory(oddsHistoryData);
        });

        await Promise.all(updatePromises);

    } catch (error) {
        console.error("Error retrieving schedules by time:", error);
    }
};

const H2HMiddlerware = async (req, res, next) => {
    try {
        const filePath = "./data_xml/h2h_data.xml";
        const xmlData = await readXmlFile(filePath);
        const jsData = await parseXmlToJs(xmlData);

        const oddsItems = jsData.H2H_DATA.H2H_ITEM;
        const updatePromises = oddsItems.map(async (match) => {
            await updateH2H(match.$);
        });

        await Promise.all(updatePromises);

    } catch (error) {
        console.error("Error retrieving schedules by time:", error);
    }
};


export { oddsMiddlerware, oddsByTimeMiddlerware, oddsHistoryMiddlerware, H2HMiddlerware, oddsAllDataMiddlerware }