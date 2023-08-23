import express from "express";
import { getSchedule, getScheduleMixOdds } from "../controllers/scheduleController.js";

const router = express.Router();

router.get("/", (req, res) => {
    const currentDate = new Date();
    const timestamp = currentDate.toISOString();
    const reqWithTimestamp = { body: { timestamp } };
    getSchedule(reqWithTimestamp, res);
});

router.get("/scheduleMixOdds", (req, res) => {
    const currentDate = new Date();
    const timestamp = currentDate.toISOString();
    const reqWithTimestamp = { body: { timestamp } };
    getScheduleMixOdds(reqWithTimestamp, res);
});



export default router;