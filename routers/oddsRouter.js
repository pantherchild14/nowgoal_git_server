import express from "express";
import { getOdds } from "../controllers/oddsController.js";

const router = express.Router();

router.get("/", (req, res) => {
    const currentDate = new Date();
    getOdds(currentDate, res);
});



export default router;