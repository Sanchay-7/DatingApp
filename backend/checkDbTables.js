import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';

dotenv.config();

const client = new Client({
  user: 'postgres',
  password: '123',
  host: 'localhost',
  port: 5432,
  database: 'dating',
});

async function main() {
  try {
    await client.connect();
    console.log("✅ Connected to PostgreSQL");

    // Get all tables
    const result = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    console.log("Tables in 'dating' database:");
    result.rows.forEach((row) => {
      console.log("  -", row.table_name);
    });

    if (result.rows.length === 0) {
      console.log("  (no tables found)");
    }

    // Check for specific tables
    const conversationExists = result.rows.some((row) => row.table_name === "Conversation");
    const messageExists = result.rows.some((row) => row.table_name === "Message");
    const participantExists = result.rows.some((row) => row.table_name === "ConversationParticipant");

    console.log("\nTarget tables:");
    console.log("  Conversation:", conversationExists ? "✅ EXISTS" : "❌ MISSING");
    console.log("  ConversationParticipant:", participantExists ? "✅ EXISTS" : "❌ MISSING");
    console.log("  Message:", messageExists ? "✅ EXISTS" : "❌ MISSING");

  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await client.end();
  }
}

main();
