import mongoose from "mongoose";

const DBOddsHistorySchema = new mongoose.Schema({
    MATCH_ID: {
        type: String,
        required: false,
    },
    ODDS: {
        type: String,
        required: false,
    },
}, {
    timestamps: true
});


export const DBOddsHistory = mongoose.model("DBOddsHistory", DBOddsHistorySchema);