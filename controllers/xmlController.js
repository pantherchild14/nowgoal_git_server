import { parseXmlToJs, readXmlFile } from "../middleware/changeXML.js";

const getXmlOddsChange = async(req, res) => {
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

const getXmlStatusChange = async(req, res) => {
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

export { getXmlOddsChange, getXmlStatusChange };