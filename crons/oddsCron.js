import schedule from 'node-schedule';
import { xml_h2h, xml_odds } from "../middleware/changeXML.js";

let oddsH2HCron;
let oddsOddsCron;

export const oddsCron = async() => {
    // Schedule the cron jobs and store them in the variables
    oddsH2HCron = schedule.scheduleJob("odds-h2h", "0 */60 * * *", async() => {
        await xml_h2h();
        console.log("Crawling odds h2h every 60 minutes...");
    });

    oddsOddsCron = schedule.scheduleJob("odds-odds", "*/30 * * * * *", async() => {
        await xml_odds();
        console.log("Crawling odds every 30 seconds...");
    });
};