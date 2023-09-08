import { DBSchedule } from "../models/scheduleModel.js";
import { DBOdds } from "../models/oddsModel.js";
import { getOddsGf } from "./oddsController.js";

const getSchedule = async (req, res) => {
    try {
        const timestamp = req.body.timestamp;
        const startDate = new Date(timestamp);
        startDate.setUTCHours(startDate.getUTCHours() - 10, 0, 0, 0);
        const endDate = new Date(timestamp);
        endDate.setUTCHours(23, 59, 59, 999);

        const schedules = await DBSchedule.find({
            TIME_STAMP: {
                $gte: startDate,
                $lte: endDate,
            },
        });

        res.status(200).json(schedules);
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
};

const getScheduleAll = async (arSelect = []) => {
    try {
        let selectFields = arSelect.length > 0 ? arSelect.join(" ") : "";

        const schedules = await DBSchedule.find().select(selectFields).lean();

        return schedules;
    } catch (error) {
        console.error("Error retrieving schedules by time:", error);
        throw error;
    }
};

const getScheduleByTime = async (begin, end, arSelect = []) => {
    try {
        let selectFields = arSelect.length > 0 ? arSelect.join(" ") : "";

        const schedules = await DBSchedule.find({
            TIME_STAMP: {
                $gte: begin,
                $lte: end,
            },
        }).select(selectFields).lean();

        return schedules;
    } catch (error) {
        console.error("Error retrieving schedules by time:", error);
        throw error;
    }
};

const getScheduleMixOdds = async (req, res) => {
    try {
        const timestamp = req.body.timestamp;
        const startDate = new Date(timestamp);
        startDate.setUTCHours(0, 0, 0, 0);
        const endDate = new Date(timestamp);
        endDate.setUTCHours(23, 59, 59, 999);

        const schedules = await DBSchedule.find({
            TIME_STAMP: {
                $gte: startDate,
                $lte: endDate,
            },
        });

        const matchIds = schedules.map((record) => record.MATCH_ID);

        const oddsRecords = await DBOdds.find({
            MATCH_ID: {
                $in: matchIds,
            },
        });

        const schedulesWithOdds = schedules.map((schedule) => {
            const odds = oddsRecords.find((oddsRecord) => oddsRecord.MATCH_ID === schedule.MATCH_ID);
            return {
                ...schedule.toObject(),
                odds: odds || null,
            };
        });

        res.status(200).json(schedulesWithOdds);
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
};

const getScheduleRT = async () => {
    try {
        const data = await getOddsGf();

        return data;
    } catch (error) {
        throw new Error("Internal server error");
    }
};


const updateSchedule = async (scheduleData) => {
    const {
        MATCH_ID,
        HOME_ID,
        AWAY_ID,
        HOME_NAME,
        AWAY_NAME,
        SCORE_HOME,
        SCORE_AWAY,
        TIME_STAMP,
        MATCH_TIME,
        LEAGUE_ID,
        LEAGUE_NAME,
        LEAGUE_SHORT_NAME,
        STATUS,
        H_T,
        F_T,
        C,
    } = scheduleData;

    const updatedSchedule = await DBSchedule.findOneAndUpdate({ MATCH_ID: MATCH_ID }, {
        MATCH_ID,
        HOME_ID,
        AWAY_ID,
        HOME_NAME,
        AWAY_NAME,
        SCORE_HOME,
        SCORE_AWAY,
        TIME_STAMP,
        MATCH_TIME,
        LEAGUE_ID,
        LEAGUE_NAME,
        LEAGUE_SHORT_NAME,
        STATUS,
        H_T,
        F_T,
        C,
    }, { upsert: true, new: true }).lean();

    return updatedSchedule;
};

const deleteScheduledMatchesForDate = async () => {
    const currentDate = new Date();
    currentDate.setDate(currentDate.getDate() - 1);

    const startOfDay = new Date(currentDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(currentDate);
    endOfDay.setHours(23, 59, 59, 999);


    try {
        const deletedMatches = await DBSchedule.deleteMany({
            TIME_STAMP: {
                $gte: (startOfDay),
                $lte: (endOfDay),
            }
        });

        console.log(`Deleted ${deletedMatches.deletedCount} matches.`);
    } catch (error) {
        console.error("Error deleting scheduled matches: ", error);
    }
};


const updateScheduleByTime = async (startTime, endTime, matchId, updatedData) => {
    const updatedSchedule = await DBSchedule.findOneAndUpdate({
        MATCH_ID: matchId,
        TIME_STAMP: { $gte: startTime, $lt: endTime },
    },
        updatedData, { upsert: true, new: true }
    ).lean();

    return updatedSchedule;
};

// const getScheduletest = async() => {
//     try {
//         const data = await getOddsGf();

//         const matchIds = data.map((match) => match.MATCH_ID);
//         const schedules = await DBSchedule.find({
//             MATCH_ID: { $in: matchIds },
//         });

//         const mergedData = data.map((match) => {
//             const schedule = schedules.find((item) => item.MATCH_ID === match.MATCH_ID);
//             return {...match, ...(schedule && schedule.toObject()) };
//         });

//         const extractedData = mergedData.map((match) => {
//             return {
//                 MATCH_ID: match.MATCH_ID,
//                 HOME_NAME: match.HOME_NAME,
//                 AWAY_NAME: match.AWAY_NAME,
//                 SCORE_HOME: match.SCORE_HOME,
//                 SCORE_AWAY: match.SCORE_AWAY,
//                 MATCH_TIME: match.MATCH_TIME,
//                 LEAGUE_ID: match.LEAGUE_ID,
//                 LEAGUE_NAME: match.LEAGUE_NAME,
//                 ODDS: {
//                     Handicap: match.Handicap,
//                     HomeHandicap: match.HomeHandicap,
//                     AwayHandicap: match.AwayHandicap,
//                     HW: match.HW,
//                     D: match.D,
//                     AW: match.AW,
//                     Over: match.Over,
//                     Goals: match.Goals,
//                     Under: match.Under,
//                 }
//             };
//         });

//         return extractedData;
//     } catch (error) {
//         throw new Error("Internal server error");
//     }
// };

export { getSchedule, getScheduleAll, getScheduleByTime, updateSchedule, updateScheduleByTime, getScheduleMixOdds, getScheduleRT, deleteScheduledMatchesForDate };