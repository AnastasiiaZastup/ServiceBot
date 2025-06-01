import Fastify from "fastify";
import fastifyPostgres from "@fastify/postgres";
import fastifyCors from "@fastify/cors";
import dotenv from "dotenv";

dotenv.config();
console.log("✅ DATABASE_URL:", process.env.DATABASE_URL);

const fastify = Fastify({ logger: true });

// Налаштування CORS для підтримки DELETE-запитів
fastify.register(fastifyCors, {
  origin: "*", // можна вказати домен фронтенду замість '*'
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
});

fastify.register(fastifyPostgres, {
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
const roleCheck = (allowedRoles) => {
  return async (req, reply) => {
    const telegram_id = req.params.telegram_id || req.body?.telegram_id;
    if (!telegram_id) {
      return reply.code(400).send({ error: "telegram_id is required" });
    }

    const client = await fastify.pg.connect();
    const { rows } = await client.query(
      "SELECT role FROM users WHERE telegram_id = $1",
      [telegram_id]
    );
    client.release();

    if (rows.length === 0) {
      return reply.code(404).send({ error: "User not found" });
    }

    const userRole = rows[0].role;
    if (!allowedRoles.includes(userRole)) {
      return reply.code(403).send({ error: "Access denied" });
    }
  };
};

fastify.get("/ping", async () => ({ message: "pong" }));

fastify.get("/test-db", async (req, reply) => {
  try {
    const client = await fastify.pg.connect();
    const { rows } = await client.query("SELECT NOW()");
    client.release();
    return { db_time: rows[0].now };
  } catch (err) {
    console.error("DB error:", err);
    reply.code(500).send({ error: "Database connection failed" });
  }
});

fastify.post("/user/register", async (req, reply) => {
  const { telegram_id, name, username, phone, role } = req.body;

  if (!telegram_id) {
    return reply.code(400).send({ error: "telegram_id is required" });
  }

  try {
    const client = await fastify.pg.connect();

    const { rows } = await client.query(
      "SELECT * FROM users WHERE telegram_id = $1",
      [telegram_id]
    );

    if (rows.length > 0) {
      // 🔄 оновлюємо роль, якщо інша
      await client.query("UPDATE users SET role = $1 WHERE telegram_id = $2", [
        role || "client",
        telegram_id,
      ]);

      const { rows: updatedUser } = await client.query(
        "SELECT * FROM users WHERE telegram_id = $1",
        [telegram_id]
      );

      client.release();
      return reply.code(200).send({
        message: "User already existed — role updated",
        user: updatedUser[0],
      });
    }

    const insertQuery = `
      INSERT INTO users (telegram_id, name, username, phone, role)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;

    const { rows: newUser } = await client.query(insertQuery, [
      telegram_id,
      name || null,
      username || null,
      phone || null,
      role || "client",
    ]);

    client.release();

    return reply.code(201).send({ message: "User created", user: newUser[0] });
  } catch (error) {
    console.error("Error registering user:", error);
    return reply.code(500).send({ error: "Server error" });
  }
});

fastify.get("/user/:telegram_id", async (req, reply) => {
  const telegram_id = req.params.telegram_id;

  try {
    const client = await fastify.pg.connect();
    const { rows } = await client.query(
      "SELECT * FROM users WHERE telegram_id = $1",
      [telegram_id]
    );
    client.release();

    if (rows.length === 0) {
      return reply.code(404).send({ error: "User not found" });
    }

    return reply.code(200).send({ user: rows[0] });
  } catch (err) {
    console.error("Error fetching user:", err);
    return reply.code(500).send({ error: "Server error" });
  }
});

fastify.get("/services", async (req, reply) => {
  try {
    const client = await fastify.pg.connect();
    const { rows } = await client.query("SELECT * FROM services");
    client.release();
    return reply.code(200).send({ services: rows });
  } catch (err) {
    console.error("Error fetching services:", err);
    return reply.code(500).send({ error: "Server error" });
  }
});

fastify.get("/services/:id", async (req, reply) => {
  const id = req.params.id;

  try {
    const client = await fastify.pg.connect();
    const { rows } = await client.query(
      "SELECT * FROM services WHERE id = $1",
      [id]
    );
    client.release();

    if (rows.length === 0) {
      return reply.code(404).send({ error: "Service not found" });
    }

    return reply.code(200).send({ service: rows[0] });
  } catch (err) {
    console.error("Error fetching service:", err);
    return reply.code(500).send({ error: "Server error" });
  }
});

fastify.post("/appointments", async (req, reply) => {
  const { telegram_id, service_id, master_id, date_time } = req.body;

  if (!telegram_id || !service_id || !master_id || !date_time) {
    return reply.code(400).send({ error: "Missing required fields" });
  }

  try {
    const client = await fastify.pg.connect();

    const { rows: userRows } = await client.query(
      "SELECT id FROM users WHERE telegram_id = $1",
      [telegram_id]
    );

    if (userRows.length === 0) {
      client.release();
      return reply.code(404).send({ error: "User not found" });
    }

    const user_id = userRows[0].id;

    const dateObj = new Date(date_time);
    const date = dateObj.toISOString().split("T")[0];
    const time = dateObj.toTimeString().split(" ")[0];

    // ✅ Перевірка на конфлікт
    const conflictCheck = await client.query(
      `SELECT * FROM appointments
       WHERE master_id = $1 AND date = $2 AND time = $3`,
      [master_id, date, time]
    );

    if (conflictCheck.rows.length > 0) {
      client.release();
      return reply.code(409).send({ error: "Цей слот вже зайнятий." });
    }

    const insertQuery = `
      INSERT INTO appointments (user_id, master_id, service_id, date, time)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;

    const { rows: newAppointment } = await client.query(insertQuery, [
      user_id,
      master_id,
      service_id,
      date,
      time,
    ]);

    client.release();

    return reply
      .code(201)
      .send({ message: "Appointment created", appointment: newAppointment[0] });
  } catch (err) {
    console.error("Error creating appointment:", err);
    return reply.code(500).send({ error: "Server error" });
  }
});

fastify.get("/masters/:serviceId", async (req, reply) => {
  const { serviceId } = req.params;

  try {
    const client = await fastify.pg.connect();

    const { rows } = await client.query(
      `
      SELECT DISTINCT ON (users.id) users.id, users.name, users.username, users.phone, users.telegram_id
      FROM users
      JOIN masters_services ON users.id = masters_services.master_id
      WHERE masters_services.service_id = $1 AND users.role = 'master'
      `,
      [serviceId]
    );

    client.release();
    return reply.send({ masters: rows });
  } catch (err) {
    console.error("❌ Error fetching masters by service:", err);
    return reply.code(500).send({ error: "Server error" });
  }
});

fastify.get(
  "/appointments/:telegram_id",
  { preHandler: roleCheck(["client"]) },
  async (req, reply) => {
    const telegram_id = req.params.telegram_id;

    try {
      const client = await fastify.pg.connect();

      const { rows: userRows } = await client.query(
        "SELECT id FROM users WHERE telegram_id = $1",
        [telegram_id]
      );

      if (userRows.length === 0) {
        client.release();
        return reply.code(404).send({ error: "User not found" });
      }

      const user_id = userRows[0].id;

      const { rows: appointments } = await client.query(
        `
  SELECT 
    appointments.id,
    appointments.date,
    TO_CHAR(appointments.time, 'HH24:MI:SS') AS time,
    services.name AS service_title,
    users.name AS master_name
  FROM appointments
  JOIN services ON appointments.service_id = services.id
  JOIN users ON appointments.master_id = users.id
  WHERE appointments.user_id = $1
  ORDER BY appointments.date, appointments.time
  `,
        [user_id]
      );

      client.release();

      return reply.code(200).send({ appointments });
    } catch (err) {
      console.error("Error fetching appointments:", err);
      return reply.code(500).send({ error: "Server error" });
    }
  }
);

fastify.get("/appointments/master/:id", async (req, reply) => {
  const master_id = req.params.id;

  try {
    const client = await fastify.pg.connect();
    const { rows } = await client.query(
      `
      SELECT * FROM appointments
      WHERE master_id = $1
      `,
      [master_id]
    );
    client.release();

    return reply.code(200).send({ appointments: rows });
  } catch (err) {
    console.error("Error fetching master appointments:", err);
    return reply.code(500).send({ error: "Server error" });
  }
});

fastify.get("/masters-by-service/:serviceId", async (req, reply) => {
  const { serviceId } = req.params;

  try {
    const client = await fastify.pg.connect();

    const { rows } = await client.query(
      `
      SELECT u.id, u.name, u.username, u.phone, u.telegram_id
      FROM users u
      JOIN masters_services ms ON ms.master_id = u.id
      WHERE ms.service_id = $1 AND u.role = 'master'
      `,
      [serviceId]
    );

    client.release();
    return reply.send({ masters: rows });
  } catch (err) {
    console.error("Error fetching masters by service:", err);
    return reply.code(500).send({ error: "Server error" });
  }
});

fastify.get(
  "/master/appointments/:telegram_id",
  { preHandler: roleCheck(["master"]) },
  async (req, reply) => {
    const telegram_id = req.params.telegram_id;

    try {
      const client = await fastify.pg.connect();

      const { rows: userRows } = await client.query(
        "SELECT id FROM users WHERE telegram_id = $1",
        [telegram_id]
      );

      if (userRows.length === 0) {
        client.release();
        return reply.code(404).send({ error: "User not found" });
      }

      const master_id = userRows[0].id;

      const { rows: appointments } = await client.query(
        `
        SELECT appointments.*, services.name AS service_title, users.name AS client_name
        FROM appointments
        JOIN services ON appointments.service_id = services.id
        JOIN users ON appointments.user_id = users.id
        WHERE appointments.master_id = $1
        ORDER BY appointments.date, appointments.time
        `,
        [master_id]
      );

      client.release();

      return reply.code(200).send({ appointments });
    } catch (err) {
      console.error("Error fetching master appointments:", err);
      return reply.code(500).send({ error: "Server error" });
    }
  }
);
//нове

fastify.post("/master/services", async (req, reply) => {
  const { master_id, service_ids } = req.body;

  if (!master_id || !Array.isArray(service_ids)) {
    return reply
      .code(400)
      .send({ error: "master_id and service_ids required" });
  }

  try {
    const client = await fastify.pg.connect();
    for (const service_id of service_ids) {
      await client.query(
        "INSERT INTO masters_services (master_id, service_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
        [master_id, service_id]
      );
    }
    client.release();
    return reply.send({ message: "Послуги додано" });
  } catch (err) {
    console.error("Error adding services:", err);
    return reply.code(500).send({ error: "Server error" });
  }
});

fastify.post("/master/slots", async (req, reply) => {
  const { master_id, slots } = req.body;

  if (!master_id || !Array.isArray(slots)) {
    return reply.code(400).send({ error: "master_id and slots[] required" });
  }

  try {
    const client = await fastify.pg.connect();

    for (const slot of slots) {
      let { date, time } = slot;

      if (!date || !time) continue;

      // 🛠 Нормалізація
      const normalizedDate = new Date(date).toISOString().split("T")[0];
      const normalizedTime = time.length === 5 ? `${time}:00` : time;

      console.log("🛠 Додавання слота:", {
        master_id,
        date: normalizedDate,
        time: normalizedTime,
      });

      await client.query(
        "INSERT INTO available_slots (master_id, date, time) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING",
        [master_id, normalizedDate, normalizedTime]
      );
    }

    client.release();
    return reply.send({ message: "Слоти додано" });
  } catch (err) {
    console.error("❌ Error adding slots:", err);
    return reply.code(500).send({ error: "Server error" });
  }
});

fastify.get("/available-slots/:master_id/:date", async (req, reply) => {
  const { master_id, date } = req.params;

  try {
    const client = await fastify.pg.connect();
    const { rows } = await client.query(
      `
      SELECT time FROM available_slots
      WHERE master_id = $1 AND date = $2
      ORDER BY time
      `,
      [master_id, date]
    );
    client.release();
    return reply.send({ slots: rows });
  } catch (err) {
    console.error("❌ Error fetching available slots:", err);
    return reply.code(500).send({ error: "Server error" });
  }
});

fastify.get("/master/slots/:master_id", async (req, reply) => {
  const master_id = req.params.master_id;

  try {
    const client = await fastify.pg.connect();
    const { rows } = await client.query(
      `SELECT date, time FROM available_slots WHERE master_id = $1 ORDER BY date, time`,
      [master_id]
    );
    client.release();
    return reply.send({ slots: rows });
  } catch (err) {
    console.error("❌ Error fetching master slots:", err);
    return reply.code(500).send({ error: "Server error" });
  }
});

fastify.patch("/user/role", async (req, reply) => {
  const { telegram_id, new_role } = req.body;

  if (!telegram_id || !["client", "master"].includes(new_role)) {
    return reply.code(400).send({ error: "Невірні дані" });
  }

  try {
    const client = await fastify.pg.connect();

    const { rowCount } = await client.query(
      "UPDATE users SET role = $1 WHERE telegram_id = $2",
      [new_role, telegram_id]
    );

    client.release();

    if (rowCount === 0) {
      return reply.code(404).send({ error: "Користувача не знайдено" });
    }

    return reply.send({ message: "Роль змінено", role: new_role });
  } catch (err) {
    console.error("❌ Error updating role:", err);
    return reply.code(500).send({ error: "Server error" });
  }
});

//всьо

fastify.get("/categories", async (req, reply) => {
  try {
    const client = await fastify.pg.connect();
    const { rows } = await client.query("SELECT * FROM categories");
    client.release();
    return reply.code(200).send({ categories: rows });
  } catch (err) {
    console.error("Error fetching categories:", err);
    return reply.code(500).send({ error: "Server error" });
  }
});

fastify.get("/services-by-category/:category_id", async (req, reply) => {
  const { category_id } = req.params;

  try {
    const client = await fastify.pg.connect();
    const { rows } = await client.query(
      "SELECT * FROM services WHERE category_id = $1",
      [category_id]
    );
    client.release();
    return reply.code(200).send({ services: rows });
  } catch (err) {
    console.error("Error fetching services by category:", err);
    return reply.code(500).send({ error: "Server error" });
  }
});

// Видалення запису (скасування)
fastify.delete("/appointments/:id", async (req, reply) => {
  const id = parseInt(req.params.id, 10);
  try {
    const client = await fastify.pg.connect();
    await client.query("DELETE FROM appointments WHERE id = $1", [id]);
    client.release();
    return reply.code(204).send();
  } catch (err) {
    fastify.log.error("Error deleting appointment:", err);
    return reply.code(500).send({ error: "Server error" });
  }
});

fastify.patch("/appointments/:id/status", async (req, reply) => {
  const id = parseInt(req.params.id, 10);
  const { status } = req.body;

  if (!["pending", "confirmed", "canceled"].includes(status)) {
    return reply.code(400).send({ error: "Invalid status" });
  }

  try {
    const client = await fastify.pg.connect();
    await client.query("UPDATE appointments SET status = $1 WHERE id = $2", [
      status,
      id,
    ]);
    client.release();
    return reply.send({ message: "Appointment updated" });
  } catch (err) {
    console.error("Error updating appointment:", err);
    return reply.code(500).send({ error: "Server error" });
  }
});

fastify.get("/appointments/booked/:masterId/:date", async (req, reply) => {
  const { masterId, date } = req.params;
  const client = await fastify.pg.connect();
  try {
    const { rows } = await client.query(
      "SELECT time FROM appointments WHERE master_id = $1 AND date = $2",
      [masterId, date]
    );
    reply.send({ slots: rows });
  } catch (err) {
    console.error("❌ Помилка отримання зайнятих слотів:", err);
    reply.code(500).send({ error: "Помилка сервера" });
  } finally {
    client.release();
  }
});

// Тут можна додати маршрути для майстрів, категорій, сервісів тощо

const start = async () => {
  try {
    await fastify.listen({ port: process.env.PORT || 3000, host: "0.0.0.0" });
    console.log("🚀 Server is running");
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
