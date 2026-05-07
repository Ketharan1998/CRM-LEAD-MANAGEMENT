const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const db = require("./db");
const authMiddleware = require("./middleware/authMiddleware");
const leadRoutes = require("./routes/leadRoutes");
const leadNoteRoutes = require("./routes/leadNoteRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// Leads routes
app.use("/api/leads", leadRoutes);

// Lead notes routes
app.use("/api/lead-notes", leadNoteRoutes);

// Health check route
app.get("/api/health", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT 1 AS ok");
    res.json({ success: true, message: "Server is running", db: rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: "Database error", error: error.message });
  }
});

console.log("protected route code loaded");

// Login route
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);

    if (rows.length === 0) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Protected route
app.get("/api/protected", authMiddleware, (req, res) => {
  res.json({
    message: "Protected route accessed successfully",
    user: req.user,
  });
});


// Protected route
app.get("/api/protected", authMiddleware, (req, res) => {
  res.json({
    message: "Protected route accessed successfully",
    user: req.user,
  });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

server.on("error", (error) => {
  console.error("Server error:", error);
});

process.on("exit", (code) => {
  console.log("Process exit code:", code);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
});

process.on("unhandledRejection", (error) => {
  console.error("Unhandled Rejection:", error);
});