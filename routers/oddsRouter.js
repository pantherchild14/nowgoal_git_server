import express from "express";
import { getOdds } from "../controllers/oddsController.js";
import crawlGfOdds from "../crawler/gfdataoddsCrawl.js";
import { getScheduleRT, getScheduletest } from "../controllers/scheduleController.js";

const router = express.Router();

router.get("/", (req, res) => {
    const currentDate = new Date();
    getOdds(currentDate, res);
});

// router.get("/xml_data", getScheduleRT);

router.get(`/ch_goal_xml`, getScheduletest);


export default router;