import { app } from "./app";
import { config } from "./config";
import { pool } from "./db";

async function start() {
  try {
    await pool.query("SELECT 1");
    app.listen(config.port, () => {
      console.log(`API running on http://localhost:${config.port}`);
    });
  } catch (error) {
    console.error("Failed to start server", error);
    process.exit(1);
  }
}

void start();
