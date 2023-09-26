import xmlbuilder from "xmlbuilder";
import { promises as fs } from "fs";


import { getTimesRunXML } from "../controllers/timeRunController.js";


const xml_timeRun = async (req, res, next) => {
    try {
        let data;
        try {
            data = await getTimesRunXML();
        } catch (error) {
            console.error("Error fetching time data: ", error);
            return;
        }

        if (!Array.isArray(data)) {
            console.error("Invalid odds data format. Expected an array.");
            return;
        }

        const root = xmlbuilder.create("TIMES_DATA");
        for (const item of data) {
            if (!item || typeof item !== "object") {
                continue;
            }

            const oddsItem = root.ele("TIME_ITEM");
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

        const filePath = "./data_xml/time_run.xml";
        await fs.writeFile(filePath, xmlString);
        console.log("XML file successfully generated.");
    } catch (error) {
        console.error("Error crawl time run xml: ", error);
        return;
    }
};

export { xml_timeRun }