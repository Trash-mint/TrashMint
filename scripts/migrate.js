const { Client } = require("pg");
const fs = require("fs");
const path = require("path");

async function migrate() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  const sql = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8");
  await client.query(sql);
  console.log("Migration complete.");
  await client.end();
}

migrate().catch((e) => { console.error(e); process.exit(1); });
