import { Server } from "socket.io";
import { getOddsGf } from "../controllers/oddsController.js";
import { getScheduleMiddleware } from "./scheduleMiddleware.js";
import { getDetail } from "../crawler/matchDetailCrawl.js";

const createWebSocketServer = (server) => {
    const io = new Server(server, {
        cors: {
            origin: "*",
        },
    });
    // Function to emit odds data
    const emitOdds = async(socket) => {
        try {
            const data = await getOddsGf();
            socket.emit("ODDS", data);
        } catch (error) {
            console.error("Error while getting odds data:", error.message);
            socket.emit("ERROR", "An error occurred while fetching odds data.");
        }
    };

    // Function to emit schedule data
    const emitSchedule = async(socket) => {
        try {
            const checkID = await getScheduleMiddleware();
            const promises = checkID.map((e) => getDetail(e));
            const results = await Promise.allSettled(promises);
            const filteredSchedules = results
                .filter((result) => result.status === "fulfilled")
                .map((result) => result.value);
            socket.emit("SCHEDULE", filteredSchedules);
        } catch (error) {
            console.error("Error while fetching schedule data:", error.message);
            socket.emit("ERROR", "An error occurred while fetching schedule data.");
        }
    };
    io.on("connection", async(socket) => {
        emitOdds(socket);
        emitSchedule(socket);

        const intervalOdds = setInterval(() => emitOdds(socket), 5000);
        const intervalSchedule = setInterval(() => emitSchedule(socket), 60000);
        socket.on("message", (message) => {
            console.log("Received message:", message);
        });
        socket.on("disconnect", () => {
            clearInterval(intervalOdds);
            clearInterval(intervalSchedule);
        });
    });
};

export { createWebSocketServer };