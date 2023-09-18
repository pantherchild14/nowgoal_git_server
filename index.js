import dotenv from "dotenv";
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import http from "http";
import scheduleRouter from "./routers/scheduleRouter.js";
import oddsRouter from "./routers/oddsRouter.js";
import xmlRouter from "./routers/xmlRouter.js";
import userRouter from "./routers/userRouter.js";
import postRouter from "./routers/postRouter.js";
import optionRouter from "./routers/optionRouter.js";
import connectDb from "./configs/mongooseDb.js";
import { scheduleCron } from "./crons/scheduleCron.js";
import { createWebSocketServer } from "./middleware/createWebSocketServer.js";
import { updateScheduleFor3Days, xml_3in1, xml_3in1_3Day, xml_change_schedule, xml_h2h, xml_h2h_3day, xml_odds, xml_odds_3Day, xml_schedule, xml_schedule3Day, xml_schedule_deleted } from "./middleware/changeXML.js";
import { deleteScheduledMatchesForDate } from "./controllers/scheduleController.js";
import { scheduleJobs } from "./crons/scheduleJob.js";
import { oddsHistoryMiddlerware } from "./middleware/oddsMiddleware.js";
import { crawlMatchH2H, getDetail } from "./crawler/matchDetailCrawl.js";
import { getXmlH2H, getXmlOddsChangeDetailHistory } from "./controllers/xmlController.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json({ limit: '30mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: "30mb" }));
app.use(cors());


app.use("/schedule", scheduleRouter);
app.use("/odds", oddsRouter);
app.use("/ajax/soccerajax", xmlRouter);
app.use("/api/users", userRouter)
app.use("/wp-admin", postRouter)
app.use("/wp-admin/option", optionRouter)


connectDb().then(() => {
    const server = http.createServer(app);
    createWebSocketServer(server);

    server.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });

    scheduleCron();


}).catch((err) => {
    console.log("err", err);
});
