import userModel from "../models/authModel.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

class userController {
    static userRegistration = async(req, res) => {
        const { USER_NAME, EMAIL, PASSWORD } = req.body;
        try {
            if (USER_NAME && EMAIL && PASSWORD) {
                const isUser = await userModel.findOne({ EMAIL: EMAIL });
                if (isUser) {
                    return res.status(400).json({ message: "User already exists" });
                } else {
                    // Password Hashing
                    const genSalt = await bcryptjs.genSalt(10);
                    const hashedPassword = await bcryptjs.hash(PASSWORD, genSalt);

                    // save the user 
                    const newUser = userModel({
                        USER_NAME,
                        EMAIL,
                        PASSWORD: hashedPassword
                    });

                    const resUser = await newUser.save();
                    if (resUser) {
                        return res
                            .status(201)
                            .json({ message: "Registered Successfully", USER_NAME: resUser });
                    }
                }
            } else {
                return res.status(400).json({ message: "All fields are required" });
            }
        } catch (err) {
            return res.status(400).json({ message: err.message });
        }
    };

    static userLogin = async(req, res) => {
        const { EMAIL, PASSWORD } = req.body;
        try {
            if (EMAIL && PASSWORD) {
                const isUser = await userModel.findOne({ EMAIL: EMAIL });
                if (isUser) {
                    if (
                        EMAIL === isUser.EMAIL &&
                        (await bcryptjs.compare(PASSWORD, isUser.PASSWORD))
                    ) {
                        // Generate token
                        const token = jwt.sign({ userID: isUser._id }, "pleaseSubscribe", {
                            expiresIn: "2d",
                        });
                        return res.status(200).json({ message: "Login Successfully", token: token, USER_NAME: isUser.USER_NAME, EMAIL: isUser.EMAIL, ROLE: isUser.ROLE });
                    } else {
                        return res.status(400).json({ message: "Invalid Credentials" });
                    }
                } else {
                    return res.status(400).json({ message: "User Not Registered" });
                }
            } else {
                return res.status(400).json({ message: "All fields are required" });
            }
        } catch (err) {
            return res.status(400).json({ message: err.message });
        }
    }

    static changePassword = async(req, res) => {
        const { NEW_PASSWORD, CONFIRM_PASSWORD } = req.body;
        try {
            if (NEW_PASSWORD && CONFIRM_PASSWORD) {
                if (NEW_PASSWORD === CONFIRM_PASSWORD) {
                    const genSalt = await bcryptjs.genSalt(10);
                    const hashedPassword = await bcryptjs.hash(NEW_PASSWORD, genSalt);
                    await userModel.findByIdAndUpdate(req.body._id, {
                        PASSWORD: hashedPassword,
                    });
                    return res.status(200).json({ message: " Password Change Successfully" });
                } else {
                    return res.status(400).json({ message: "Password and confirm password dose not match" });
                }
            } else {
                return res.status(400).json({ message: "All fields are required" });
            }
        } catch (err) {
            return res.status(400).json({ message: err.message });
        }
    }

    static getUser = async(req, res) => {
        try {
            const userName = req.params.user;

            const userItem = await userModel.findOne({ USER_NAME: userName });

            if (userItem) {
                res.status(200).json(userItem);
            } else {
                res.status(404).json({ error: "User item not found" });
            }
        } catch (error) {
            console.error("Error while retrieving user data:", error.message);
            res.status(500).json({ error: "Error while retrieving user data" });
        }
    }
}


export default userController;