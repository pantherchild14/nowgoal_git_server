import mongoose from "mongoose";

const DBOddsSchema = new mongoose.Schema({
    MATCH_ID: {
        type: String,
        required: false,
    },
    ODDS_ID: {
        type: String,
        required: false,
    },
    ODDS_AH_FT: {
        type: String,
        required: false,
    },
    ODDS_EURO_FT: {
        type: String,
        required: false,
    },
    ODDS_OU_FT: {
        type: String,
        required: false,
    },
    ODDS_AH_HT: {
        type: String,
        required: false,
    },
    ODDS_EURO_HT: {
        type: String,
        required: false,
    },
    ODDS_OU_HT: {
        type: String,
        required: false,
    },
}, {
    timestamps: true
});


export const DBOdds = mongoose.model("DBOdds", DBOddsSchema);