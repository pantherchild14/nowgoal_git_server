import express from "express";
import { getXmlOddsChange, getXmlOddsSingleChange, getXmlScheduleSingleChange, getXmlStatusChange } from "../controllers/xmlController.js";

const router = express.Router();

router.get(`/ch_odds_xml`, getXmlOddsChange);

router.get(`/ch_oddsSignle_xml/:id`, (req, res) => getXmlOddsSingleChange(req, res));

router.get(`/ch_status_xml`, getXmlStatusChange);
router.get(`/ch_scheduleSingle_xml/:id`, (req, res) => getXmlScheduleSingleChange(req, res));

export default router;