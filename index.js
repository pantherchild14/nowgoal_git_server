import dotenv from "dotenv";
dotenv.config();
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import scheduleRouter from "./routers/scheduleRouter.js";
import oddsRouter from "./routers/oddsRouter.js";
import connectDb from "./configs/mongooseDb.js";
import { scheduleCron } from "./crons/scheduleCron.js";
import { oddsCron } from "./crons/oddsCron.js";
import http from "http";
import { Server } from "socket.io";
import { createWebSocketServer } from "./middleware/createWebSocketServer.js";
import { createScheduleMiddleware } from "./middleware/scheduleMiddleware.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true, limit: "30mb" }));
app.use(cors());


app.use("/schedule", scheduleRouter);
app.use("/odds", oddsRouter);

connectDb().then(() => {
    const server = http.createServer(app);
    createWebSocketServer(server);

    server.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
    createScheduleMiddleware();
    scheduleCron();
    oddsCron();

}).catch((err) => {
    console.log("err", err);
});
// io.on("connection", async(socket) => {
//         const emitOdds = async() => {
//             try {
//                 const data = await getOddsGf();
//                 socket.emit("ODDS", data);
//             } catch (error) {
//                 console.error("Error while getting odds data:", error.message);
//                 socket.emit("ERROR", "An error occurred while fetching odds data.");
//             }
//         };

//         const emitSchedule = async() => {
//             try {
//                 const checkID = await getScheduleMiddleware();
//                 const promises = checkID.map(e => getDetail(e));
//                 const results = await Promise.allSettled(promises);
//                 const filteredSchedules = results
//                     .filter(result => result.status === "fulfilled")
//                     .map(result => result.value);
//                 socket.emit("SCHEDULE", filteredSchedules);
//             } catch (error) {
//                 console.error("Error while fetching schedule data:", error.message);
//                 socket.emit("ERROR", "An error occurred while fetching schedule data.");
//             }
//         };

//         // emitSchedule();
//         emitOdds();

//         const intervalId = setInterval(emitOdds, 5000);
//         // const intervalSchedule = setInterval(emitSchedule, 60000);

//         socket.on("message", (message) => {
//             console.log("Received message:", message);
//         });

//         socket.on("disconnect", () => {
//             clearInterval(intervalId);
//             // clearInterval(intervalSchedule);
//         });
//     });