import schedule from 'node-schedule';
import { xml_h2h, xml_odds, xml_odds_change_detail, xml_change_schedule, xml_schedule } from "../middleware/changeXML.js";
import { createScheduleMiddleware } from "../middleware/scheduleMiddleware.js";

export const scheduleJobs = async () => {
    try {
        await scheduleH2hJob();
        await scheduleOddsChangeDetailJob();
        await scheduleXmlOddsJob();
        await scheduleCreateScheduleMiddlewareJob();
        await scheduleXmlScheduleJob();
        await scheduleXmlChangeScheduleJob();
    } catch (error) {
        console.error("Error while running schedule jobs:", error);
    }
};

async function scheduleH2hJob() {
    schedule.scheduleJob("h2h", "0 */60 * * *", async () => {
        try {
            await xml_h2h();
            console.log("Crawling xml_h2h 60 minutes...");
        } catch (error) {
            console.error("Error while crawling odds h2h:", error);
        }
    });
}

async function scheduleOddsChangeDetailJob() {
    schedule.scheduleJob("odds-change-detail", "*/1 * * * *", async () => {
        try {
            await xml_odds_change_detail();
            console.log("Crawling xml_odds_change_detail 1 minutes...");
        } catch (error) {
            console.error("Error while crawling odds odds change detail:", error);
        }
    });
}

async function scheduleXmlOddsJob() {
    schedule.scheduleJob("odds-xml", "*/30 * * * * *", async () => {
        try {
            await xml_odds();
            console.log("Crawling xml_odds 30 seconds...");
        } catch (error) {
            console.error("Error while crawling odds odds change detail:", error);
        }
    });
}

async function scheduleCreateScheduleMiddlewareJob() {
    schedule.scheduleJob("update-schuduleDB", "*/10 * * * *", async () => {
        try {
            await createScheduleMiddleware();
            console.log("Crawling createScheduleMiddleware 10 minutes...");
        } catch (error) {
            console.error("Error while crawling odds odds change detail:", error);
        }
    });
}

async function scheduleXmlScheduleJob() {
    schedule.scheduleJob("schedule-xml", "*/5 * * * *", async () => {
        try {
            await xml_schedule();
            console.log("Crawling xml_schedule 5 minutes...");
        } catch (error) {
            console.error("Error while crawling odds odds change detail:", error);
        }
    });
}

async function scheduleXmlChangeScheduleJob() {
    schedule.scheduleJob("xml_change_schedule", "*/1 * * * *", async () => {
        try {
            await xml_change_schedule();
            console.log("Crawling xml_change_schedule 1 minutes...");
        } catch (error) {
            console.error("Error while crawling odds odds change detail:", error);
        }
    });
}