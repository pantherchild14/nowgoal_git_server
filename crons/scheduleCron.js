// import cron from "node-cron";
import schedule from 'node-schedule';
import { createScheduleMiddleware } from "../middleware/scheduleMiddleware.js";
import { updateScheduleFor3Days, xml_3in1, xml_3in1_3Day, xml_change_schedule, xml_h2h, xml_h2h_3day, xml_odds, xml_odds_3Day, xml_schedule, xml_schedule3Day } from "../middleware/changeXML.js";
import { H2HMiddlerware, oddsAllDataMiddlerware, oddsHistoryMiddlerware } from '../middleware/oddsMiddleware.js';
import { getOddsXML } from '../controllers/oddsController.js';
import { deleteScheduledMatchesForDate } from '../controllers/scheduleController.js';
import { xml_timeRun } from '../middleware/timeRunMiddleware.js';

export const scheduleCron = async () => {


    /* **********************************       SOCKET         **************************************************** */
    // schedule.scheduleJob("cron-xmlChangeSchedule-1-minutes", "*/3 * * * *", async () => {
    //     await xml_change_schedule();
    //     console.log("Crawling schedule XML sau 1 phút ...");
    // });

    /* **********************************       XML         **************************************************** */

    // Cron /data_xml/oddsAll_data.xml 1 per day 1 phút
    schedule.scheduleJob("cron-odds-1-minutes", "*/1 * * * *", async () => {
        await xml_odds();
        console.log("Crawling odds every 1 minutes...");
    });

    schedule.scheduleJob("cron-timeRun-50-seconds", "*/50 * * * * *", async () => {
        await xml_timeRun();
        console.log("Crawling time run every 50 seconds...");
    });

    // Cron /data_xml/3in1.xml 1 per day 2 phút
    schedule.scheduleJob("cron-xmlOddsChangeDetail-2-minutes", "*/2 * * * *", async () => {
        await xml_3in1();
        console.log("Crawling xml_odds_change_detail sau 2 phút ...");
    });

    // Cron /data_xml/scheduleAll_data.xml 1 per day 4 phút
    schedule.scheduleJob("cron-xmlChangeSchedule-4-minutes", "*/4 * * * *", async () => {
        await xml_change_schedule();
        console.log("Crawling schedule XML sau 4 phút ...");
    });

    // Cron /data_xml/scheduleAll_data.xml 1 per day 4 phút
    schedule.scheduleJob("cron-xmlSchedule-6-minutes", "*/6 * * * *", async () => {
        await xml_schedule();
        console.log("Crawling schedule XML sau 8 phút ...");
    });

    // Cron /data_xml/h2h_data.xml 1 per day 6 phút
    schedule.scheduleJob("cron-xmlH2h-8-minutes", "*/8 * * * *", async () => {
        await xml_h2h();
        console.log("Crawling odds h2h every 8 minutes...");
    });

    // 0 * * * * 1 tiếng mỗi lần
    // Cron xml_odds_3Day 30 phút 
    schedule.scheduleJob("cron-xml_odds_3Day-30-minutes", "*/30 * * * *", async () => {
        await xml_odds_3Day();
        console.log("Crawling xml_odds_3Day every 30 minutes...");
    });

    /* ****************************************************************************************** */

    // // Cron /data_xml/schedule_3_day.xml every day  00: 00
    schedule.scheduleJob("cron-xmlSchedule3Day-daily", "0 0 * * *", async () => {
        await xml_schedule3Day();
        console.log("Crawling xml_schedule3Day sau cron daily...");
    });


    // // Cron xml_odds_3Day every day 00: 06
    // schedule.scheduleJob("cron-xml_odds_3Day-30-minutes", "6 0 * * *", async () => {
    //     await xml_odds_3Day();
    //     console.log("Crawling xml_odds_3Day sau cron daily...");
    // });

    // // Cron xml_h2h_3day every day 00:12
    schedule.scheduleJob("cron-xmlH2h-3-day-20-minutes", "4 0 * * *", async () => {
        await xml_h2h_3day();
        console.log("Crawling odds h2h every 20 minutes...");
    });

    // Deleted xml_h2h_3day every day 00:20
    // schedule.scheduleJob("cron-xml_schedule_deleted-20-minutes", "0 12 * * *", async () => {
    //     await xml_schedule_deleted();
    //     console.log("Crawling xml_schedule_deleted every 20 minutes...");
    // });

    // // Cron xml_3in1_3Day every day 00: 08
    schedule.scheduleJob("cron-xml3in13Day-30-minutes", "8 0 * * *", async () => {
        await xml_3in1_3Day();
        console.log("Crawling xml3in13Day sau cron daily...");
    });
    /* **********************************       DATABASE         **************************************************** */
    /* --------------------  many time per day   -------------------- */

    // Update on DB of file oddsAllDataMiddlerware every 3 minutes
    // schedule.scheduleJob("cron-oddsAllDataMiddlerware-3-minutes", "*/3 * * * *", async () => {
    //     await oddsAllDataMiddlerware();
    //     console.log("Crawling oddsAllDataMiddlerware every 3 minutes...");
    // });

    // Update on DB of file createScheduleMiddleware every 5 minutes
    // schedule.scheduleJob("cron-createScheduleMiddleware-5-minutes", "*/5 * * * *", async () => {
    //     await createScheduleMiddleware();
    //     console.log("Crawling schedule DB sau 5 minutes...");
    // });

    // Update on DB of file /data_xml/h2h_data.xml every 7 minutes
    // schedule.scheduleJob("cron-H2HMiddlerware-7-minutes", "*/7 * * * *", async () => {
    //     await H2HMiddlerware();
    //     console.log("Crawling  H2HMiddlerware every 7 minutes...");
    // });

    // Update on DB of file /data_xml/3in1.xml every 9 minutes
    // schedule.scheduleJob("cron-oddsHistoryMiddlerware-9-minutes", "*/9 * * * *", async () => {
    //     await oddsHistoryMiddlerware();
    //     console.log("Crawling oddsHistoryMiddlerware every 9 minutes...");
    // });

    /* --------------------  1 time per day   -------------------- */

    // Cron updateScheduleFor3Days 1 per day 00: 04
    schedule.scheduleJob("cron-updateScheduleFor3Days-daily", "6 0 * * *", async () => {
        await updateScheduleFor3Days();
        console.log("Crawling updateScheduleFor3Days sau cron daily...");
    });

    // Cron deleteScheduledMatchesForDate 1 per day 00: 02
    schedule.scheduleJob("cron-deleteScheduledMatchesForDate-daily", "*0 12 * * *", async () => {
        await deleteScheduledMatchesForDate();
        console.log("Crawling deleteScheduledMatchesForDate sau cron daily...");
    });
}