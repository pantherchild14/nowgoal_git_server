import cron from "node-cron";
import { oddsByTimeMiddlerware, oddsMiddlerware } from "../middleware/oddsMiddleware.js";

export const oddsCron = async() => {
    cron.schedule("*/5 * * * *", async() => {
        oddsMiddlerware();
        console.log("Crawling odds 5p...");
    });

    // cron.schedule("*/10 * * * * *", async() => {
    //     oddsByTimeMiddlerware();
    //     console.log("Crawling odds 10s...");
    // });
}