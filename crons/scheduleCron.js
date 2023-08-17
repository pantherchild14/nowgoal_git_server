// import cron from "node-cron";
import schedule from 'node-schedule';
import { createScheduleMiddleware, updateScheduleByTimeMiddleware } from "../middleware/scheduleMiddleware.js";
import { xml_change_schedule, xml_schedule } from "../middleware/changeXML.js";

export const scheduleCron = async() => {
    // // Lập lịch chạy một lần mỗi ngày vào lúc 12:00 AM
    // schedule.scheduleJob("daily", "0 0 * * *", async() => {
    //     createScheduleMiddleware();
    //     console.log("Crawling schedule DB sau 1 ngày...");
    // });

    schedule.scheduleJob("every-10-minutes", "*/10 * * * *", async() => {
        await createScheduleMiddleware();
        console.log("Crawling schedule DB sau 10 ngày...");
    });

    // Lập lịch chạy mỗi 60 phút
    schedule.scheduleJob("every-5-minutes", "*/5 * * * *", async() => {
        await xml_schedule();
        console.log("Crawling schedule XML sau 5 phút ...");
    });

    // Lập lịch chạy mỗi 1 phút
    schedule.scheduleJob("every-1-minute", "*/1 * * * *", async() => {
        await xml_change_schedule();
        console.log("Crawling schedule XML sau 1 phút ...");
    });
}