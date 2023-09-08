// import cron from "node-cron";
import schedule from 'node-schedule';
import { createScheduleMiddleware } from "../middleware/scheduleMiddleware.js";
import { updateScheduleFor3Days, xml_3in1, xml_3in1_3Day, xml_change_schedule, xml_h2h, xml_odds, xml_odds_3Day, xml_schedule, xml_schedule3Day } from "../middleware/changeXML.js";
import { H2HMiddlerware, oddsAllDataMiddlerware, oddsHistoryMiddlerware } from '../middleware/oddsMiddleware.js';
import { getOddsXML } from '../controllers/oddsController.js';
import { deleteScheduledMatchesForDate } from '../controllers/scheduleController.js';

export const scheduleCron = async () => {
    // cron-odds-10-seconds
    // */30 * * * * *

    schedule.scheduleJob("cron-odds-3-minutes", "*/1 * * * *", async () => {
        await xml_odds();
        console.log("Crawling odds every 3 minutes...");
    });

    schedule.scheduleJob("cron-oddsAllDataMiddlerware-3-minutes", "*/2 * * * *", async () => {
        await oddsAllDataMiddlerware();
        console.log("Crawling oddsAllDataMiddlerware every 4 minutes...");
    });

    schedule.scheduleJob("cron-xmlChangeSchedule-1-minutes", "*/3 * * * *", async () => {
        await xml_change_schedule();
        console.log("Crawling schedule XML sau 1 phút ...");
    });
    // /* -------------- */
    // /* Odd History */

    schedule.scheduleJob("cron-xmlOddsChangeDetail-2-minutes", "*/2 * * * *", async () => {
        await xml_3in1();
        console.log("Crawling xml_odds_change_detail sau 2 phút ...");
    });

    schedule.scheduleJob("cron-oddsHistoryMiddlerware-3-minutes", "*/3 * * * *", async () => {
        await oddsHistoryMiddlerware();
        console.log("Crawling oddsHistoryMiddlerware every 3 minutes...");
    });

    /* -------------- */
    /* H2H */

    schedule.scheduleJob("cron-xmlH2h-10-minutes", "/4 * * * *", async () => {
        await xml_h2h();
        console.log("Crawling odds h2h every 4 minutes...");
    });

    schedule.scheduleJob("cron-H2HMiddlerware-15-minutes", "/6 * * * *", async () => {
        await H2HMiddlerware();
        console.log("Crawling  H2HMiddlerware every 6 minutes...");
    });

    /* -------------- */
    /* Schedule */


    schedule.scheduleJob("cron-xmlSchedule-5-minutes", "*/5 * * * *", async () => {
        await xml_schedule();
        console.log("Crawling schedule XML sau 5 phút ...");
    });

    schedule.scheduleJob("cron-createScheduleMiddleware-10-minutes", "*/6 * * * *", async () => {
        await createScheduleMiddleware();
        console.log("Crawling schedule DB sau 10 minutes...");
    });
    /* -------------- */

    schedule.scheduleJob("cron-xmlSchedule3Day-daily", "0 0 * * *", async () => {
        await xml_schedule3Day();
        console.log("Crawling xml_schedule3Day sau cron daily...");
    });

    schedule.scheduleJob("cron-updateScheduleFor3Days-daily", "2 0 * * *", async () => {
        await updateScheduleFor3Days();
        console.log("Crawling updateScheduleFor3Days sau cron daily...");
    });

    schedule.scheduleJob("cron-deleteScheduledMatchesForDate-daily", "4 0 * * *", async () => {
        await deleteScheduledMatchesForDate();
        console.log("Crawling deleteScheduledMatchesForDate sau cron daily...");
    });

    schedule.scheduleJob("cron-xml_odds_3Day-30-minutes", "5 0 * * *", async () => {
        await xml_odds_3Day();
        console.log("Crawling xml_odds_3Day sau cron daily...");
    });

    schedule.scheduleJob("cron-xml3in13Day-30-minutes", "6 0 * * *", async () => {
        await xml_3in1_3Day();
        console.log("Crawling xml3in13Day sau cron daily...");
    });

}