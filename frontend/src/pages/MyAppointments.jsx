import React, { useEffect, useState } from "react";
import Button from "../components/Button";
import Card from "../components/Card";

export default function MyAppointments({ user, onBack, showToast }) {
  const [appointments, setAppointments] = useState([]);

  // 1) підвантажуємо список
  const fetchAppointments = async () => {
    try {
      const res = await fetch(
        `https://service-bot-backend.onrender.com/appointments/${user.telegram_id}`
      );
      if (!res.ok) throw new Error(`Status ${res.status}`);

      const data = await res.json();
      const appointments = data.appointments || [];

      const filtered = appointments.filter((a) => a.status !== "canceled");
      setAppointments(filtered);
    } catch (err) {
      console.error("❌ Помилка отримання записів:", err);
      showToast("❌ Помилка завантаження записів", "error");
    }
  };

  // 2) запускаємо один раз на маунті
  useEffect(() => {
    if (user?.telegram_id) fetchAppointments();
  }, [user]);

  // 3) обробник скасування
  const cancelAppointment = async (appointmentId) => {
    try {
      const res = await fetch(
        `https://service-bot-backend.onrender.com/appointments/${appointmentId}`,
        {
          method: "DELETE",
          headers: { Accept: "application/json" },
        }
      );
      if (!res.ok) throw new Error(`DELETE failed: ${res.status}`);
      await fetchAppointments();
      showToast("❌ Запис скасовано", "error");
    } catch (err) {
      console.error("❌ Помилка скасування:", err);
      showToast("❌ Не вдалося скасувати запис", "error");
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <h2>📅 Мої записи</h2>
      <Button onClick={onBack} type="grey" style={{ marginBottom: 12 }}>
        ⬅️ Назад
      </Button>

      {appointments.length === 0 ? (
        <p>У вас поки нема записів.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {appointments.map((a) => (
            <li key={a.id} style={{ marginBottom: 16, width: "100%" }}>
              <Card style={{ width: "100%" }}>
                <strong>{a.service_title}</strong> <br />
                👩‍🎨 Майстер: {a.master_name} <br />
                📅 {new Date(a.date).toLocaleDateString()} 🕒{" "}
                {a.time.slice(0, 5)} <br />
                📌 Статус:{" "}
                <strong>
                  {a.status === "confirmed"
                    ? "✅ Підтверджено"
                    : "⏳ Очікує підтвердження"}
                </strong>
                <br />
                <Button
                  onClick={() => cancelAppointment(a.id)}
                  type="danger"
                  style={{ marginTop: 8 }}
                >
                  Скасувати
                </Button>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
