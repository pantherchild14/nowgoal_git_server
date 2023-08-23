import express from "express";
import { getXmlH2H, getXmlOddsAll, getXmlOddsChange, getXmlOddsChangeDetailHistory, getXmlOddsSingleAll, getXmlOddsSingleChange, getXmlScheduleSingleAll, getXmlScheduleSingleChange, getXmlStatusChange } from "../controllers/xmlController.js";

const router = express.Router();

router.get(`/ch_odds_xml`, getXmlOddsChange);
router.get(`/ch_odds_all_xml`, getXmlOddsAll);
router.get(`/ch_status_xml`, getXmlStatusChange);


/* ---------------------------------------------- */
/*  status */

router.get(`/ch_oddsSignle_xml/:id`, (req, res) => getXmlOddsSingleChange(req, res));
router.get(`/ch_scheduleSingle_xml/:id`, (req, res) => getXmlScheduleSingleChange(req, res));
router.get(`/odds_change_detail_history_xml/:id`, (req, res) => getXmlOddsChangeDetailHistory(req, res));
/* ---------------------------------------------- */

/* schedule All */

router.get(`/ch_scheduleAll_xml/:id`, (req, res) => getXmlScheduleSingleAll(req, res));
router.get(`/ch_oddsAll_xml/:id`, (req, res) => getXmlOddsSingleAll(req, res));
router.get(`/ch_h2h_xml/:id`, (req, res) => getXmlH2H(req, res));

/* ---------------------------------------------- */
export default router;