import schedule from 'node-schedule';
import { xml_h2h, xml_odds } from "../middleware/changeXML.js";
import { H2HMiddlerware, oddsHistoryMiddlerware } from '../middleware/oddsMiddleware.js';

export const oddsCron = async () => {
    // Schedule the cron jobs and store them in the variables
    schedule.scheduleJob("every-10-minutes", "/10 * * * *", async () => {
        await xml_h2h();
        console.log("Crawling odds h2h every 10 minutes...");
    });

    schedule.scheduleJob("every-15-minutes", "/15 * * * *", async () => {
        await H2HMiddlerware();
        console.log("Crawling  H2HMiddlerware every 15 minutes...");
    });

    schedule.scheduleJob("every-3-minutes", "/3 * * * *", async () => {
        await oddsHistoryMiddlerware();
        console.log("Crawling oddsHistoryMiddlerware every 3 minutes...");
    });

    schedule.scheduleJob("every-30-seconds", "*/30 * * * * *", async () => {
        await xml_odds();
        console.log("Crawling odds every 30 seconds...");
    });
};