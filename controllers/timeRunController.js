import { setHours, setMinutes, setSeconds, addHours } from "date-fns";
import { utcToZonedTime } from 'date-fns-tz';

import { crawlTimeRun } from "../crawler/timeRunCrawl.js";
import { parseXmlToJs, readXmlFile } from "../middleware/changeXML.js";

// const getTimesRunXML = async () => {
//     try {
//         const filePath = "./data_xml/scheduleAll_data.xml";
//         const xmlData = await readXmlFile(filePath);
//         const jsData = await parseXmlToJs(xmlData);

//         const scheduleItems = jsData.SCHEDULE_DATA.SCHEDULE_ITEM;
//         const matchIDs = scheduleItems.map((item) => item.$.MATCH_ID);

//         const promises = matchIDs.map((id) => crawlTimeRun(id));
//         const time = await Promise.all(promises);

//         const validTimes = time.filter((time) => time !== null);

//         return Promise.resolve(validTimes);
//     } catch (error) {
//         console.error("Error while fetching Time Run data: ", error);
//         return Promise.resolve([]);
//     }
// };

const getTimesRunXML = async () => {
    try {
        const filePath = "./data_xml/schedule_3_day.xml";
        const xmlData = await readXmlFile(filePath);
        const jsData = await parseXmlToJs(xmlData);

        const scheduleItems = jsData.SCHEDULE_DATA.SCHEDULE_ITEM;

        const currentTime = new Date(); // Thời gian hiện tại
        const currentTimeGMT7 = utcToZonedTime(currentTime, 'Asia/Ho_Chi_Minh'); // Chuyển đổi sang GMT+7

        // Tạo thời gian bắt đầu (12:00 PM) và thời gian kết thúc (12:00 PM ngày tiếp theo) cho việc so sánh
        const todayStart = setSeconds(setMinutes(setHours(currentTimeGMT7, 6), 0), 0);
        const tomorrowStart = setSeconds(setMinutes(setHours(addHours(currentTimeGMT7, 24), 12), 0), 0);
        // // Lọc ra các sự kiện nằm trong khoảng từ 12:00AM hôm nay đến 12:00AM ngày mai
        const validEvents = scheduleItems.filter((item) => {
            const eventTimeGMT7 = utcToZonedTime(new Date(Number(item.$.TIME_STAMP)), 'Asia/Ho_Chi_Minh');
            return eventTimeGMT7 >= todayStart && eventTimeGMT7 <= tomorrowStart;
        });
        const matchIDs = validEvents.map((item) => item.$.MATCH_ID);

        const promises = matchIDs.map((id) => crawlTimeRun(id));
        const time = await Promise.all(promises);

        const validTimes = time.filter((time) => time !== null);

        return Promise.resolve(validTimes);
    } catch (error) {
        console.error("Error while fetching Time Run data: ", error);
        return Promise.resolve([]);
    }
};

export { getTimesRunXML }