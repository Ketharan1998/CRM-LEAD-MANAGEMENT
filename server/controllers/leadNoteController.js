const db = require("../db");

const addLeadNote = async (req, res) => {
  try {
    const { lead_id, user_id, note_content } = req.body;

    if (!lead_id || !note_content) {
      return res.status(400).json({ message: "lead_id and note_content are required" });
    }

    const [result] = await db.query(
      `INSERT INTO lead_notes (lead_id, user_id, note_content) VALUES (?, ?, ?)`,
      [lead_id, user_id || null, note_content]
    );

    res.status(201).json({
      message: "Note added successfully",
      id: result.insertId,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getLeadNotes = async (req, res) => {
  try {
    const { leadId } = req.params;

    const [rows] = await db.query(
      `SELECT id, lead_id, user_id, note_content, created_at FROM lead_notes WHERE lead_id = ? ORDER BY created_at DESC`,
      [leadId]
    );

    res.json(rows || []);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  addLeadNote,
  getLeadNotes,
};