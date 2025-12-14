import pool from "../config/db";

export const createNewTable = async () => {
  try {
    const query = `
      CREATE TABLE IF NOT EXISTS coopRegistration (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        saveStepProgress VARCHAR(20) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await pool.query(query);
    console.log("✅ Table 'coopRegistration' created successfully!");
  } catch (error) {
    console.error("❌ Error creating table:", error);
  }
};

// run immediately when file is executed
createNewTable();
