import mongoose from "mongoose";

const DBH2HSchema = new mongoose.Schema({
    MATCH_ID: {
        type: String,
        required: false,
    },
    H2H: {
        type: String,
        required: false,
    },
    LAST_MATCH_HOME: {
        type: String,
        required: false,
    },
    LAST_MATCH_AWAY: {
        type: String,
        required: false,
    },
}, {
    timestamps: true
});


export const DBH2H = mongoose.model("DBH2H", DBH2HSchema);