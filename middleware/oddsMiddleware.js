import { crawlOdds } from "../crawler/oddsCrawl.js";
import { getScheduleByTimeMiddleware, getScheduleMiddleware } from "./scheduleMiddleware.js";

const oddsMiddlerware = async(req, res, next) => {
    try {
        const arrSchedule = await getScheduleMiddleware();
        for (let i = 0; i < arrSchedule.length; i++) {
            for (let i = 0; i < arrSchedule.length; i++) {
                try {
                    await crawlOdds(arrSchedule[i]);
                } catch (error) {
                    console.error("Error updating odds for MATCH_ID:", arrSchedule[i]);
                }
            }
        }
    } catch (error) {
        console.error("Error retrieving schedules by time:", error);
    }
};


const oddsByTimeMiddlerware = async(req, res, next) => {
    try {
        const arrSchedule = await getScheduleByTimeMiddleware();
        for (let i = 0; i < arrSchedule.length; i++) {
            for (let i = 0; i < arrSchedule.length; i++) {
                try {
                    await crawlOdds(arrSchedule[i]);
                } catch (error) {

                }
            }
        }
    } catch (error) {
        console.error("Error retrieving schedules by time:", error);
    }
};

export { oddsMiddlerware, oddsByTimeMiddlerware }