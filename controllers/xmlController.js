import { parseXmlToJs, readXmlFile } from "../middleware/changeXML.js";

const getXmlOddsChange = async (req, res) => {
    try {
        const filePath = "./data_xml/odds_data.xml";
        const xmlData = await readXmlFile(filePath);
        const jsData = await parseXmlToJs(xmlData);
        // return JSON.stringify(jsData);
        res.status(200).json(jsData);
    } catch (error) {
        console.error("Error while emitting odds data:", error.message);
        res.status(500).json({ error: "Error while emitting odds data" });
    }
}

const getXmlOddsSingleChange = async (req, res) => {
    try {
        const filePath = "./data_xml/odds_data.xml";
        const xmlData = await readXmlFile(filePath);
        const jsData = await parseXmlToJs(xmlData);
        const oddsData = jsData['ODDS_DATA']['ODDS_ITEM'];

        const id = req.params.id;

        const matchedItem = oddsData.find(item => item['$']['MATCH_ID'] === id);

        if (matchedItem) {
            res.status(200).json(matchedItem);
        } else {
            res.status(404).json({ error: "Matching item not found" });
        }
    } catch (error) {
        console.error("Error while emitting odds data:", error.message);
        res.status(500).json({ error: "Error while emitting odds data" });
    }
};

const getXmlStatusChange = async (req, res) => {
    try {
        const filePath = "./data_xml/schedule_data.xml";
        const xmlData = await readXmlFile(filePath);
        const jsData = await parseXmlToJs(xmlData);
        // return JSON.stringify(jsData);
        res.status(200).json(jsData);
    } catch (error) {
        console.error("Error while emitting status data:", error.message);
        res.status(500).json({ error: "Error while emitting status data" });
    }
}

const getXmlScheduleSingleChange = async (req, res) => {
    try {
        const filePath = "./data_xml/schedule_data.xml";
        const xmlData = await readXmlFile(filePath);
        const jsData = await parseXmlToJs(xmlData);
        const scheduleData = jsData['SCHEDULE_DATA']['SCHEDULE_ITEM'];

        const id = req.params.id;

        const matchedItem = scheduleData.find(item => item['$']['MATCH_ID'] === id);

        if (matchedItem) {
            res.status(200).json(matchedItem);
        } else {
            res.status(404).json({ error: "Matching item not found" });
        }
    } catch (error) {
        console.error("Error while emitting status data:", error.message);
        res.status(500).json({ error: "Error while emitting status data" });
    }
}

const getXmlScheduleSingleAll = async (req, res) => {
    try {
        const filePath = "./data_xml/scheduleAll_data.xml";
        const xmlData = await readXmlFile(filePath);
        const jsData = await parseXmlToJs(xmlData);
        const scheduleData = jsData['SCHEDULE_DATA']['SCHEDULE_ITEM'];

        const id = req.params.id;

        const matchedItem = scheduleData.find(item => item['$']['MATCH_ID'] === id);

        if (matchedItem) {
            res.status(200).json(matchedItem);
        } else {
            res.status(404).json({ error: "Matching item not found" });
        }
    } catch (error) {
        console.error("Error while emitting status data:", error.message);
        res.status(500).json({ error: "Error while emitting status data" });
    }
}

const getXmlOddsSingleAll = async (req, res) => {
    try {
        const filePath = "./data_xml/oddsAll_data.xml";
        const xmlData = await readXmlFile(filePath);
        const jsData = await parseXmlToJs(xmlData);
        const scheduleData = jsData['ODDS_DATA']['ODDS_ITEM'];

        const id = req.params.id;

        const matchedItem = scheduleData.find(item => item['$']['MATCH_ID'] === id);

        if (matchedItem) {
            res.status(200).json(matchedItem);
        } else {
            res.status(404).json({ error: "Matching item not found" });
        }
    } catch (error) {
        console.error("Error while emitting status data:", error.message);
        res.status(500).json({ error: "Error while emitting status data" });
    }
}

const getXmlOddsAll = async (req, res) => {
    try {
        const filePath = "./data_xml/oddsAll_data_3_day.xml";
        const xmlData = await readXmlFile(filePath);
        const jsData = await parseXmlToJs(xmlData);

        res.status(200).json(jsData);
    } catch (error) {
        console.error("Error while emitting status data:", error.message);
        res.status(500).json({ error: "Error while emitting status data" });
    }
}

const getXmlH2H = async (req, res) => {
    try {
        // const filePath = "./data_xml/h2h_data.xml";
        const filePath = "./data_xml/h2h_3_day.xml";
        const xmlData = await readXmlFile(filePath);
        const jsData = await parseXmlToJs(xmlData);
        const scheduleData = jsData['H2H_DATA']['H2H_ITEM'];

        const id = req.params.id;

        const matchedItem = scheduleData.find(item => item['$']['MATCH_ID'] === id);
        if (matchedItem) {
            res.status(200).json(matchedItem);
        } else {
            res.status(404).json({ error: "Matching item not found" });
        }
    } catch (error) {
        console.error("Error while emitting status data:", error.message);
        res.status(500).json({ error: "Error while emitting status data" });
    }
}

const getXmlOddsChangeDetailHistory = async (req, res) => {
    try {
        const filePath = "./data_xml/3in1.xml";
        const xmlData = await readXmlFile(filePath);
        const jsData = await parseXmlToJs(xmlData);
        const oddsData = jsData['ODDS_DATA']['ODDS_ITEM'];

        const id = req.params.id;

        const matchedItem = oddsData.find(item => item['$']['_MATCH_ID'] === id);

        if (matchedItem) {
            res.status(200).json(matchedItem);
        } else {
            res.status(404).json({ error: "Matching item not found" });
        }
    } catch (error) {
        console.error("Error while emitting status data:", error.message);
        res.status(500).json({ error: "Error while emitting status data" });
    }
}

// const getXmlOddsChangeDetailHistory = async (req, res) => {
//     try {
//         const id = req.params.id;

//         const matchedItem = await DBOddsHistory.findOne({ MATCH_ID: id });

//         if (matchedItem) {
//             return res.status(200).json(matchedItem);
//         } else {
//             return res.status(404).json({ error: "Matching item not found" });
//         }
//     } catch (error) {
//         console.error("Error while emitting status data:", error.message);
//         return res.status(500).json({ error: "Error while emitting status data" });
//     }
// }


export { getXmlOddsChange, getXmlStatusChange, getXmlOddsSingleChange, getXmlScheduleSingleChange, getXmlScheduleSingleAll, getXmlOddsSingleAll, getXmlOddsAll, getXmlH2H, getXmlOddsChangeDetailHistory };