import React, { useEffect, useState } from "react";
import Button from "../components/Button";

export default function MyAppointmentsMaster({ user, onBack }) {
  const [appointments, setAppointments] = useState([]);

  const fetchAppointments = async () => {
    try {
      const res = await fetch(
        `https://service-bot-backend.onrender.com/master/appointments/${user.telegram_id}`
      );
      if (!res.ok) throw new Error("Не вдалося завантажити записи");
      const data = await res.json();
      setAppointments(data.appointments || []);
    } catch (err) {
      console.error("❌ Помилка отримання записів майстра:", err);
    }
  };

  useEffect(() => {
    if (user?.telegram_id) fetchAppointments();
  }, [user]);

  const updateStatus = async (id, status) => {
    try {
      const res = await fetch(
        `https://service-bot-backend.onrender.com/appointments/${id}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        }
      );
      if (!res.ok) throw new Error("Помилка оновлення статусу");
      await fetchAppointments();
    } catch (err) {
      console.error("❌ Статус не оновлено:", err);
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <h2>🧑‍🎨 Ваші записи (майстер)</h2>
      <Button onClick={onBack} style={{ marginBottom: 12 }} type="grey">
        ⬅️ Назад
      </Button>

      {appointments.length === 0 ? (
        <p>Наразі у вас немає записів.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {appointments.map((a) => (
            <li
              key={a.id}
              style={{
                marginBottom: 16,
                padding: 12,
                backgroundColor: "#f0f0f0",
                borderRadius: 8,
              }}
            >
              <strong>{a.service_title}</strong> <br />
              👤 Клієнт: {a.client_name} <br />
              📅 {new Date(a.date).toLocaleDateString()} 🕒 {a.time.slice(0, 5)}{" "}
              <br />
              📌 Статус: <strong>{a.status}</strong> <br />
              <div style={{ marginTop: 8 }}>
                <Button
                  onClick={() => updateStatus(a.id, "confirmed")}
                  style={{
                    marginRight: 8,
                    backgroundColor: "#10b981",
                    color: "#fff",
                    border: "none",
                    borderRadius: 6,
                    padding: "6px 10px",
                    cursor: "pointer",
                  }}
                  type="success"
                >
                  ✅ Підтвердити
                </Button>
                <Button
                  onClick={() => updateStatus(a.id, "canceled")}
                  style={{
                    backgroundColor: "#ef4444",
                    color: "#fff",
                    border: "none",
                    borderRadius: 6,
                    padding: "6px 10px",
                    cursor: "pointer",
                  }}
                  type="danger"
                >
                  ❌ Скасувати
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
