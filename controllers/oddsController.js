import crawlGfOdds from "../crawler/gfdataoddsCrawl.js";
import { crawlOdds } from "../crawler/oddsCrawl.js";
import { parseXmlToJs, readXmlFile } from "../middleware/changeXML.js";
import { DBOdds } from "../models/oddsModel.js";
import { DBSchedule } from "../models/scheduleModel.js";


const getOdds = async(selectedDate, res) => {
    try {
        selectedDate.setUTCHours(0, 0, 0, 0);

        const endDate = new Date(selectedDate);
        endDate.setUTCHours(23, 59, 59, 999);

        const scheduleRecords = await DBSchedule.find({
            TIME_STAMP: {
                $gte: selectedDate,
                $lte: endDate,
            },
        });

        const matchIds = scheduleRecords.map((record) => record.MATCH_ID);
        const oddsRecords = await DBOdds.find({
            MATCH_ID: {
                $in: matchIds,
            },
        });

        res.status(200).json(oddsRecords);
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
};

const getOddsGf = async() => {
    try {
        const data = await crawlGfOdds();
        return data;
    } catch (error) {
        throw new Error("Internal server error");
    }
};

const getOddsXML = async() => {
    try {
        const filePath = "./data_xml/scheduleAll_data.xml";
        const xmlData = await readXmlFile(filePath);
        const jsData = await parseXmlToJs(xmlData);

        const scheduleItems = jsData.SCHEDULE_DATA.SCHEDULE_ITEM;
        const matchIDs = scheduleItems.map((item) => item.$.MATCH_ID);

        const promises = matchIDs.map((id) => crawlOdds(id));
        const odds = await Promise.all(promises);

        const validOdds = odds.filter((odd) => odd !== null);

        return Promise.resolve(validOdds);
    } catch (error) {
        console.error("Error while fetching odds data: ", error);
        return Promise.resolve([]);
    }
};


const updatedOdds = async(oddsData) => {
    const {
        MATCH_ID,
        ODDS_AH_FT,
        ODDS_EURO_FT,
        ODDS_OU_FT,
        ODDS_AH_HT,
        ODDS_EURO_HT,
        ODDS_OU_HT,
    } = oddsData;

    const updateOdds = await DBOdds.findOneAndUpdate({ MATCH_ID: MATCH_ID }, {
        MATCH_ID,
        ODDS_AH_FT,
        ODDS_EURO_FT,
        ODDS_OU_FT,
        ODDS_AH_HT,
        ODDS_EURO_HT,
        ODDS_OU_HT,
    }, { upsert: true, new: true }).lean();

    return updateOdds;
};

export { getOdds, updatedOdds, getOddsGf, getOddsXML };