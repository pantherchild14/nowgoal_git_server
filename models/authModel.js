import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    USER_NAME: {
        type: String,
    },
    EMAIL: {
        type: String,
    },
    PASSWORD: {
        type: String,
    },
    ROLE: {
        type: String,
        default: "Subscriber",
    },
});

const userModel = mongoose.model("user", userSchema);

export default userModel;