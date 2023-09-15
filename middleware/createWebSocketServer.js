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
            await xml_change_schedule();
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
            await xml_odds();
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

    // const emit3in1 = async (socket) => {
    //     try {
    //         await xml_3in1();
    //         const filePath = "./data_xml/3in1.xml";
    //         const xmlData = await readXmlFile(filePath);
    //         const jsData = await parseXmlToJs(xmlData);
    //         socket.emit("3IN1", JSON.stringify(jsData));
    //     } catch (error) {
    //         console.error("Error fetching 3in1 data:", error.message);
    //         socket.emit("ERROR", "An error occurred while fetching 3in1 data.");
    //         if (error.message.includes("ETIMEDOUT")) {
    //             setTimeout(async () => await emit3in1(socket), 5000);
    //         }
    //     }
    // };

    io.on("connection", async (socket) => {
        try {
            await emitOdds(socket, async () => {
                await emitSchedule(socket);
                // await emit3in1(socket)
                await emitXMLOdds(socket)
            });

            const intervalOdds = setInterval(async () => await emitOdds(socket), 5000);
            const intervalSchedule = setInterval(async () => await emitSchedule(socket), 120000);
            const intervalXMLOdds = setInterval(async () => await emitXMLOdds(socket), 60000);
            // const interval3in1 = setInterval(async () => await emit3in1(socket), 90000);

            socket.on("message", (message) => {
                console.log("Received message:", message);
            });

            socket.on("disconnect", () => {
                clearInterval(intervalOdds);
                clearInterval(intervalSchedule);
                // clearInterval(interval3in1);
                clearInterval(intervalXMLOdds);
            });
        } catch (error) {
            console.error("Error processing socket connection:", error.message);
            socket.emit("ERROR", "An error occurred while processing socket connection.");
        }
    });
};

export { createWebSocketServer };