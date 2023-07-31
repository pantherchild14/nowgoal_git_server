import express from "express";
import { getXmlOddsChange, getXmlStatusChange } from "../controllers/xmlController.js";

const router = express.Router();

router.get(`/ch_odds_xml`, getXmlOddsChange);

router.get(`/ch_status_xml`, getXmlStatusChange);

export default router;