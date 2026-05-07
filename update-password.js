const mysql = require("mysql2/promise");

async function updatePassword() {
  const pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "",
    database: "crm_lead_management",
  });

  const hash = "$2b$10$5obitvd4TqjJS0kNRF6Db.hhzjcsItamZM75SsHteb.IVJMsPe99i";
  
  try {
    const connection = await pool.getConnection();
    await connection.execute("UPDATE users SET password_hash = ? WHERE id = 1", [hash]);
    console.log("Password updated successfully");
    connection.release();
  } catch (err) {
    console.error("Error:", err);
  }
  
  await pool.end();
}

updatePassword();
