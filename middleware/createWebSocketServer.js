import { Server } from "socket.io";
import { parseXmlToJs, readXmlFile, xml_3in1, xml_change_odds, xml_change_schedule, xml_odds } from "./changeXML.js";


const createWebSocketServer = (server) => {
    const io = new Server(server, {
        cors: {
            origin: "*",
        },
    });

    const emitOdds = async (socket, callback) => {
        try {
            await xml_change_odds();
            const filePath = "./data_xml/odds_data.xml";
            const xmlData = await readXmlFile(filePath);
            const jsData = await parseXmlToJs(xmlData);
            socket.emit("ODDS", JSON.stringify(jsData));

            if (callback) {
                callback();
            }
        } catch (error) {
            console.error("Error emitting odds data:", error.message);
            socket.emit("ERROR", "An error occurred while emitting odds data.");
            if (error.message.includes("ETIMEDOUT")) {
                setTimeout(async () => await emitOdds(socket, callback), 5000);
            }
        }
    };

    const emitSchedule = async (socket) => {
        try {
            // await xml_change_schedule();
            const filePath = "./data_xml/schedule_data.xml";
            const xmlData = await readXmlFile(filePath);
            const jsData = await parseXmlToJs(xmlData);
            socket.emit("SCHEDULE", JSON.stringify(jsData));
        } catch (error) {
            console.error("Error fetching schedule data:", error.message);
            socket.emit("ERROR", "An error occurred while fetching schedule data.");
            if (error.message.includes("ETIMEDOUT")) {
                setTimeout(async () => await emitSchedule(socket), 5000);
            }
        }
    };

    const emitXMLOdds = async (socket) => {
        try {
            // await xml_odds();
            const filePath = "./data_xml/oddsAll_data.xml";
            const xmlData = await readXmlFile(filePath);
            const jsData = await parseXmlToJs(xmlData);
            socket.emit("XML_ODDS", JSON.stringify(jsData));
        } catch (error) {
            console.error("Error fetching xml_odds data:", error.message);
            socket.emit("ERROR", "An error occurred while fetching xml_odds data.");
            if (error.message.includes("ETIMEDOUT")) {
                setTimeout(async () => await emitXMLOdds(socket), 5000);
            }
        }
    };

    const emit3in1 = async (socket) => {
        try {
            const filePath = "./data_xml/3in1.xml";
            const xmlData = await readXmlFile(filePath);
            const jsData = await parseXmlToJs(xmlData);
            socket.emit("3IN1", JSON.stringify(jsData));
        } catch (error) {
            console.error("Error fetching 3in1 data:", error.message);
            socket.emit("ERROR", "An error occurred while fetching 3in1 data.");
            if (error.message.includes("ETIMEDOUT")) {
                setTimeout(async () => await emit3in1(socket), 5000);
            }
        }
    };

    const emith2h = async (socket) => {
        try {
            const filePath = "./data_xml/h2h_data.xml";
            const xmlData = await readXmlFile(filePath);
            const jsData = await parseXmlToJs(xmlData);
            socket.emit("H2H", JSON.stringify(jsData));
        } catch (error) {
            console.error("Error fetching H2H data:", error.message);
            socket.emit("ERROR", "An error occurred while fetching H2H data.");
            if (error.message.includes("ETIMEDOUT")) {
                setTimeout(async () => await emith2h(socket), 5000);
            }
        }
    };

    const emitTimeRun = async (socket) => {
        try {
            const filePath = "./data_xml/time_run.xml";
            const xmlData = await readXmlFile(filePath);
            const jsData = await parseXmlToJs(xmlData);
            socket.emit("TIME_RUN", JSON.stringify(jsData));
        } catch (error) {
            console.error("Error fetching TIME RUN data:", error.message);
            socket.emit("ERROR", "An error occurred while fetching TIME RUN data.");
            if (error.message.includes("ETIMEDOUT")) {
                setTimeout(async () => await emitTimeRun(socket), 5000);
            }
        }
    };


    io.on("connection", async (socket) => {
        try {
            await emitOdds(socket);
            await emitXMLOdds(socket);
            await emitSchedule(socket);
            await emit3in1(socket);

            const intervalOdds = await emitOdds(socket);
            const intervalOddsRT = setInterval(async () => await emitOdds(socket), 5000);
            const intervalSchedule = setInterval(async () => await emitSchedule(socket), 120000);
            const intervalXMLOdds = await emitXMLOdds(socket);
            const intervalXMLOddsRT = setInterval(async () => await emitXMLOdds(socket), 60000);
            const interval3in1 = await emit3in1(socket);
            const interval3in1RT = setInterval(async () => await emit3in1(socket), 120000);
            const intervalH2H = await emith2h(socket);
            const intervalH2HRT = setInterval(async () => await emith2h(socket), 120000);

            const intervalTIMERUN = await emitTimeRun(socket);
            const intervalTIMERUNRT = setInterval(async () => await emitTimeRun(socket), 30000);

            socket.on("message", (message) => {
                console.log("Received message:", message);
            });

            socket.on("disconnect", () => {
                clearInterval(intervalOdds);
                clearInterval(intervalOddsRT);
                clearInterval(intervalSchedule);
                clearInterval(interval3in1);
                clearInterval(intervalXMLOdds);
                clearInterval(intervalXMLOddsRT);
                clearInterval(interval3in1RT);
                clearInterval(intervalH2H);
                clearInterval(intervalH2HRT);
                clearInterval(intervalTIMERUN);
                clearInterval(intervalTIMERUNRT);
            });
        } catch (error) {
            console.error("Error processing socket connection:", error.message);
            socket.emit("ERROR", "An error occurred while processing socket connection.");
        }
    });
};

export { createWebSocketServer };