const express = require("express");
const router = express.Router();
const { addLeadNote, getLeadNotes } = require("../controllers/leadNoteController");

router.post("/", addLeadNote);
router.get("/:leadId", getLeadNotes);

module.exports = router;