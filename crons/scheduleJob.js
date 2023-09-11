import schedule from 'node-schedule';
import { xml_odds, xml_change_schedule, xml_schedule, xml_3in1 } from "../middleware/changeXML.js";
import { createScheduleMiddleware } from "../middleware/scheduleMiddleware.js";
import { H2HMiddlerware, oddsAllDataMiddlerware, oddsHistoryMiddlerware } from '../middleware/oddsMiddleware.js';

let xmlOddsJobScheduled = false;
let oddsAllDataJobScheduled = false;
let xmlChangeScheduleJobScheduled = false;
let xml3in1JobScheduled = false;
let oddsHistoryJobScheduled = false;
let h2hJobScheduled = false;
let xmlScheduleJobScheduled = false;
let createScheduleMiddlewareJobScheduled = false;

export const scheduleJobs = async () => {
    try {
        await scheduleXmlOddsJob();
    } catch (error) {
        console.error("Error while running schedule jobs:", error);
    }
};

async function scheduleXmlOddsJob() {
    if (!xmlOddsJobScheduled) {
        schedule.scheduleJob("cron-odds-3-minutes", "*/30 * * * * *", async () => {
            try {
                await xml_odds();
                console.log("Crawling xml_odds 30 seconds...");
                xmlOddsJobScheduled = true;
                await scheduleOddsAllDataMiddlerware();
            } catch (error) {
                console.error("Error while crawling odds odds change detail:", error);
            }
        });
    }
}

async function scheduleOddsAllDataMiddlerware() {
    if (!oddsAllDataJobScheduled) {
        schedule.scheduleJob("cron-oddsAllDataMiddlerware-3-minutes", "*/2 * * * *", async () => {
            try {
                await oddsAllDataMiddlerware();
                console.log("Crawling oddsAllDataMiddlerware every 2 minutes...");
                oddsAllDataJobScheduled = true;
                await scheduleXmlChangeScheduleJob();
            } catch (error) {
                console.error("Error while oddsAllDataMiddlerware:", error);
            }
        });
    }
}

async function scheduleXmlChangeScheduleJob() {
    if (!xmlChangeScheduleJobScheduled) {
        schedule.scheduleJob("cron-xmlChangeSchedule-1-minutes", "*/3 * * * *", async () => {
            try {
                await xml_change_schedule();
                console.log("Crawling xml_change_schedule 3 minutes...");
                xmlChangeScheduleJobScheduled = true;
                await scheduleXml3in1();
            } catch (error) {
                console.error("Error while crawling xml_change_schedule:", error);
            }
        });
    }
}

async function scheduleXml3in1() {
    if (!xml3in1JobScheduled) {
        schedule.scheduleJob("cron-xmlOddsChangeDetail-2-minutes", "*/2 * * * *", async () => {
            try {
                await xml_3in1();
                console.log("Crawling xml_odds_change_detail sau 2 phút ...");
                xml3in1JobScheduled = true;
                await scheduleOddsHistoryMiddlerware();
            } catch (error) {
                console.error("Error while crawling xml_odds_change_detail:", error);
            }
        });
    }
}

async function scheduleOddsHistoryMiddlerware() {
    if (!oddsHistoryJobScheduled) {
        schedule.scheduleJob("cron-oddsHistoryMiddlerware-3-minutes", "*/3 * * * *", async () => {
            try {
                await oddsHistoryMiddlerware();
                console.log("Crawling oddsHistoryMiddlerware every 3 minutes...");
                oddsHistoryJobScheduled = true;
                await scheduleH2HMiddlerware();
            } catch (error) {
                console.error("Error while crawling oddsHistoryMiddlerware", error);
            }
        });
    }
}

async function scheduleH2HMiddlerware() {
    if (!h2hJobScheduled) {
        schedule.scheduleJob("cron-H2HMiddlerware-6-minutes", "*/6 * * * *", async () => {
            try {
                await H2HMiddlerware();
                console.log("Crawling  H2HMiddlerware every 6 minutes...");
                h2hJobScheduled = true;
                await scheduleXmlScheduleJob();
            } catch (error) {
                console.error("Error while H2HMiddlerware", error);
            }
        });
    }
}

async function scheduleXmlScheduleJob() {
    if (!xmlScheduleJobScheduled) {
        schedule.scheduleJob("cron-xmlSchedule-5-minutes", "*/5 * * * *", async () => {
            try {
                await xml_schedule();
                console.log("Crawling xml_schedule 5 minutes...");
                xmlScheduleJobScheduled = true;
                await scheduleCreateScheduleMiddlewareJob();
            } catch (error) {
                console.error("Error while crawling odds odds change detail:", error);
            }
        });
    }
}

async function scheduleCreateScheduleMiddlewareJob() {
    if (!createScheduleMiddlewareJobScheduled) {
        schedule.scheduleJob("cron-createScheduleMiddleware-10-minutes", "*/6 * * * *", async () => {
            try {
                await createScheduleMiddleware();
                console.log("Crawling createScheduleMiddleware 10 minutes...");
                createScheduleMiddlewareJobScheduled = true;
            } catch (error) {
                console.error("Error while crawling odds odds change detail:", error);
            }
        });
    }
}
