import dotenv from "dotenv";
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import http from "http";
import scheduleRouter from "./routers/scheduleRouter.js";
import oddsRouter from "./routers/oddsRouter.js";
import xmlRouter from "./routers/xmlRouter.js";
import connectDb from "./configs/mongooseDb.js";
import { scheduleCron } from "./crons/scheduleCron.js";
import { oddsCron } from "./crons/oddsCron.js";
import { createWebSocketServer } from "./middleware/createWebSocketServer.js";
import { createScheduleMiddleware } from "./middleware/scheduleMiddleware.js";
import { xml_h2h, xml_odds, xml_schedule } from "./middleware/changeXML.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true, limit: "30mb" }));
app.use(cors());


app.use("/schedule", scheduleRouter);
app.use("/odds", oddsRouter);
app.use("/ajax/soccerajax", xmlRouter);

connectDb().then(() => {
    const server = http.createServer(app);
    createWebSocketServer(server);

    server.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });

    // Lập lịch các công việc
    scheduleCron();
    oddsCron();

}).catch((err) => {
    console.log("err", err);
});