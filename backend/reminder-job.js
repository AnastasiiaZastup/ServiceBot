import dotenv from "dotenv";
import fetch from "node-fetch";
import pg from "pg";

dotenv.config();

const { BOT_TOKEN, DATABASE_URL } = process.env;

const client = new pg.Client({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const sendTelegramMessage = async (chatId, text) => {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text }),
    });
    const result = await res.json();
    if (!result.ok) console.error("❌ Telegram error:", result);
  } catch (err) {
    console.error("❌ Failed to send Telegram message:", err);
  }
};

const runReminder = async () => {
  await client.connect();

  const now = new Date();
  const targetDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const dateStr = targetDate.toISOString().split("T")[0];

  try {
    const result = await client.query(
      `
      SELECT a.date, a.time,
             c.telegram_id AS client_id,
             m.telegram_id AS master_id,
             s.name AS service_name,
             m.name AS master_name,
             c.name AS client_name
      FROM appointments a
      JOIN users c ON a.user_id = c.id
      JOIN users m ON a.master_id = m.id
      JOIN services s ON a.service_id = s.id
      WHERE a.date = $1
    `,
      [dateStr]
    );

    for (const a of result.rows) {
      const time = a.time.slice(0, 5);
      const date = new Date(a.date).toLocaleDateString("uk-UA");
      const message = `⏰ Нагадування!\nПослуга: ${a.service_name}\nДата: ${date}\nЧас: ${time}`;

      if (a.client_id) await sendTelegramMessage(a.client_id, `👤 ${message}`);
      if (a.master_id) await sendTelegramMessage(a.master_id, `🧑‍🎨 ${message}`);
    }

    console.log(`📤 Нагадування на ${dateStr} надіслані!`);
  } catch (err) {
    console.error("❌ Помилка при нагадуванні:", err);
  } finally {
    await client.end();
  }
};

runReminder();
