import cron from "node-cron";
import { createScheduleMiddleware, updateScheduleByTimeMiddleware } from "../middleware/scheduleMiddleware.js";

export const scheduleCron = async() => {
    cron.schedule("*/30 * * * *", async() => {
        createScheduleMiddleware();
        console.log("Crawling schedule sau 30p...");
    });

    // cron.schedule("*/1 * * * *", async() => {
    //     updateScheduleByTimeMiddleware();
    //     console.log("Crawling schedule sau 1 phút ...");
    // });
}