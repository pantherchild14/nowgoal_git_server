import mongoose from "mongoose";

const optionSchema = new mongoose.Schema({
    option_name: {
        type: String,
        required: true,
    },
    option_value: {
        type: String,
        required: false,
    },
}, {
    timestamps: true
});

export const Options = mongoose.model("Options", optionSchema);
