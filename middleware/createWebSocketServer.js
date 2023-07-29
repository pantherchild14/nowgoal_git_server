import { Server } from "socket.io";
import { parseXmlToJs, readXmlFile, xml_change_odds, xml_change_schedule } from "./changeXML.js";


const createWebSocketServer = (server) => {
    const io = new Server(server, {
        cors: {
            origin: "*",
        },
    });
    // Function to emit odds data
    const emitOdds = async(socket) => {
        try {
            await xml_change_odds();
            const filePath = "./data_xml/odds_data.xml";
            const xmlData = await readXmlFile(filePath);
            const jsData = await parseXmlToJs(xmlData);
            socket.emit("ODDS", JSON.stringify(jsData));
        } catch (error) {
            console.error("Error while emitting odds data:", error.message);
            socket.emit("ERROR", "An error occurred while emitting odds data.");
            if (error.message.includes("ETIMEDOUT")) {
                setTimeout(async() => await emitOdds(socket), 5000);
            }
        }
    };

    const emitSchedule = async(socket) => {
        try {
            await xml_change_schedule()
            const filePath = "./data_xml/schedule_data.xml";
            const xmlData = await readXmlFile(filePath);
            const jsData = await parseXmlToJs(xmlData);
            socket.emit("SCHEDULE", JSON.stringify(jsData));
        } catch (error) {
            console.error("Error while fetching schedule data:", error.message);
            socket.emit("ERROR", "An error occurred while fetching schedule data.");
            if (error.message.includes("ETIMEDOUT")) {
                setTimeout(async() => await emitSchedule(socket), 5000);
            }
        }
    };
    io.on("connection", async(socket) => {
        try {
            await emitSchedule(socket);
            await emitOdds(socket);

            const intervalOdds = setInterval(async() => await emitOdds(socket), 5000);
            const intervalSchedule = setInterval(async() => await emitSchedule(socket), 60000);
            socket.on("message", (message) => {
                console.log("Received message:", message);
            });
            socket.on("disconnect", () => {
                clearInterval(intervalOdds);
                clearInterval(intervalSchedule);
            });
        } catch (error) {
            console.error("Error while processing socket connection:", error.message);
            socket.emit("ERROR", "An error occurred while processing socket connection.");
        }
    });
};

export { createWebSocketServer };