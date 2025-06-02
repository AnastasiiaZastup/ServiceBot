import React, { useEffect, useState } from "react";
import Button from "../components/Button";
import Card from "../components/Card";

export default function MyAppointmentsMaster({ user, onBack, showToast }) {
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
      showToast("❌ Помилка завантаження записів", "error");
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
      showToast(
        status === "confirmed" ? "✅ Запис підтверджено" : "❌ Запис скасовано",
        status === "confirmed" ? "success" : "error"
      );
    } catch (err) {
      console.error("❌ Статус не оновлено:", err);
      showToast("❌ Не вдалося оновити статус", "error");
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <h2>🧑‍🎨 Ваші записи (майстер)</h2>
      <Button onClick={onBack} type="grey" style={{ marginBottom: 12 }}>
        ⬅️ Назад
      </Button>

      {appointments.length === 0 ? (
        <p>Наразі у вас немає записів.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {appointments.map((a) => (
            <li key={a.id} style={{ marginBottom: 16 }}>
              <Card>
                <strong>{a.service_title}</strong> <br />
                👤 Клієнт: {a.client_name} <br />
                📅 {new Date(a.date).toLocaleDateString()} 🕒{" "}
                {a.time.slice(0, 5)} <br />
                📌 Статус: <strong>{a.status}</strong> <br />
                <div style={{ marginTop: 8 }}>
                  <Button
                    onClick={() => updateStatus(a.id, "confirmed")}
                    type="success"
                    style={{ marginRight: 8 }}
                  >
                    ✅ Підтвердити
                  </Button>
                  <Button
                    onClick={() => updateStatus(a.id, "canceled")}
                    type="danger"
                  >
                    ❌ Скасувати
                  </Button>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
