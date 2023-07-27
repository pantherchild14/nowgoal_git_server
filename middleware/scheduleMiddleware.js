import { addDays, startOfDay, addHours, startOfHour } from "date-fns";
import { getScheduleAll, getScheduleByTime } from "../controllers/scheduleController.js";
import { crawlSchedule, crawlStatusSchedule } from "../crawler/scheduleCrawl.js";

const createScheduleMiddleware = async(req, res, next) => {
    try {
        const currentDate = new Date();
        // currentDate.setDate(currentDate.getDate() - 1);

        function formatDate(date) {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        }

        const formattedDate = formatDate(currentDate);

        await crawlSchedule(formattedDate);
    } catch (error) {
        console.error("Error retrieving createScheduleMiddleware: ", error);
    }
};

const updateScheduleByTimeMiddleware = async(req, res, next) => {
    try {
        const currentDate = new Date();
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, '0');
        const date = String(currentDate.getDate()).padStart(2, '0');

        const formattedDate = `${year}-${month}-${date}`;

        crawlStatusSchedule(formattedDate);

    } catch (error) {
        console.error("Error retrieving updateScheduleByTimeMiddleware: ", error);
    }
}

const getScheduleMiddleware = async(req, res, next) => {
    try {
        const schedules = await getScheduleAll(["MATCH_ID"]);
        const arrSchedule = schedules.map((schedule) => schedule.MATCH_ID);
        return arrSchedule;
    } catch (error) {
        console.error("Error retrieving getScheduleMiddleware:", error);
    }
};

const getScheduleByTimeMiddleware = async(req, res, next) => {
    try {
        const currentDate = new Date();
        const startTime = new Date(currentDate.getTime() - 8 * 60 * 60 * 1000);
        const endTime = new Date(currentDate);
        // const endTime = new Date(currentDate.getTime() + 7 * 60 * 60 * 1000);

        const schedules = await getScheduleByTime(startTime, endTime, ["MATCH_ID"]);
        const arrSchedule = schedules.map((schedule) => schedule.MATCH_ID);
        return arrSchedule;
    } catch (error) {
        console.error("Error retrieving getScheduleByTimeMiddleware:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};


export { createScheduleMiddleware, getScheduleMiddleware, getScheduleByTimeMiddleware, updateScheduleByTimeMiddleware }