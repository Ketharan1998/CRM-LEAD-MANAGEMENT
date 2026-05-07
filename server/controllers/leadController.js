const db = require("../db");

const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Get all leads
const getLeads = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM leads ORDER BY id DESC");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get single lead by ID
const getLeadById = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query("SELECT * FROM leads WHERE id = ?", [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Lead not found" });
    }

    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Create new lead
const createLead = async (req, res) => {
  try {
    const {
      lead_name,
      company_name,
      email,
      phone,
      lead_source,
      assigned_salesperson,
      status,
      estimated_deal_value
    } = req.body;

    if (!lead_name || !company_name || !email || !phone || !status) {
      return res.status(400).json({
        message: "lead_name, company_name, email, phone, and status are required"
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        message: "Please enter a valid email address"
      });
    }

    if (estimated_deal_value !== undefined && isNaN(Number(estimated_deal_value))) {
      return res.status(400).json({
        message: "Estimated deal value must be a valid number"
      });
    }

    const [existingEmail] = await db.query(
      "SELECT id FROM leads WHERE email = ?",
      [email]
    );

    if (existingEmail.length > 0) {
      return res.status(400).json({
        message: "Email already exists"
      });
    }

    const [existingPhone] = await db.query(
      "SELECT id FROM leads WHERE phone = ?",
      [phone]
    );

    if (existingPhone.length > 0) {
      return res.status(400).json({
        message: "Phone already exists"
      });
    }

    const [result] = await db.query(
      `INSERT INTO leads
      (lead_name, company_name, email, phone, lead_source, assigned_salesperson, status, estimated_deal_value)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        lead_name,
        company_name,
        email,
        phone,
        lead_source,
        assigned_salesperson,
        status,
        estimated_deal_value
      ]
    );

    res.status(201).json({
      message: "Lead created successfully",
      id: result.insertId
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update lead
const updateLead = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      lead_name,
      company_name,
      email,
      phone,
      lead_source,
      assigned_salesperson,
      status,
      estimated_deal_value
    } = req.body;

    if (!lead_name || !company_name || !email || !phone || !status) {
      return res.status(400).json({
        message: "lead_name, company_name, email, phone, and status are required"
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        message: "Please enter a valid email address"
      });
    }

    if (estimated_deal_value !== undefined && isNaN(Number(estimated_deal_value))) {
      return res.status(400).json({
        message: "Estimated deal value must be a valid number"
      });
    }

    const [existingEmail] = await db.query(
      "SELECT id FROM leads WHERE email = ? AND id != ?",
      [email, id]
    );

    if (existingEmail.length > 0) {
      return res.status(400).json({
        message: "Email already exists"
      });
    }

    const [existingPhone] = await db.query(
      "SELECT id FROM leads WHERE phone = ? AND id != ?",
      [phone, id]
    );

    if (existingPhone.length > 0) {
      return res.status(400).json({
        message: "Phone already exists"
      });
    }

    const [result] = await db.query(
      `UPDATE leads SET
        lead_name = ?,
        company_name = ?,
        email = ?,
        phone = ?,
        lead_source = ?,
        assigned_salesperson = ?,
        status = ?,
        estimated_deal_value = ?
      WHERE id = ?`,
      [
        lead_name,
        company_name,
        email,
        phone,
        lead_source,
        assigned_salesperson,
        status,
        estimated_deal_value,
        id
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Lead not found" });
    }

    // Fetch and return the updated lead
    const [updatedLead] = await db.query("SELECT * FROM leads WHERE id = ?", [id]);
    res.json(updatedLead[0]);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete lead
const deleteLead = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.query("DELETE FROM leads WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Lead not found" });
    }

    res.json({ message: "Lead deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  getLeads,
  getLeadById,
  createLead,
  updateLead,
  deleteLead
};