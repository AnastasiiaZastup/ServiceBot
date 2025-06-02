import React, { useEffect, useState } from "react";
import Button from "../components/Button";

export default function MyAppointments({ user, onBack }) {
  const [appointments, setAppointments] = useState([]);

  // 1) підвантажуємо список
  const fetchAppointments = async () => {
    try {
      const res = await fetch(
        `https://service-bot-backend.onrender.com/appointments/${user.telegram_id}`
      );
      if (!res.ok) throw new Error(res.statusText);
      const data = await res.json();
      setAppointments(data.appointments || []);
    } catch (err) {
      console.error("❌ Помилка отримання записів:", err);
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
          // без тіла, тому заголовків мінімум
          headers: { Accept: "application/json" },
        }
      );
      if (!res.ok) throw new Error(`DELETE failed: ${res.status}`);
      // після успішного скасування — оновлюємо список
      await fetchAppointments();
    } catch (err) {
      console.error("❌ Помилка скасування:", err);
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <h2>📅 Мої записи</h2>
      <Button onClick={onBack} style={{ marginBottom: 12 }} type="grey">
        ⬅️ Назад
      </Button>

      {appointments.length === 0 ? (
        <p>У вас поки нема записів.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {appointments.map((a) => (
            <li
              key={a.id}
              style={{
                marginBottom: 16,
                padding: 12,
                backgroundColor: "#f3f3f3",
                borderRadius: 8,
              }}
            >
              <strong>{a.service_title}</strong> <br />
              👩‍🎨 Майстер: {a.master_name} <br />
              📅 {new Date(a.date).toLocaleDateString()} 🕒 {a.time.slice(0, 5)}{" "}
              <br />
              <Button
                onClick={() => cancelAppointment(a.id)}
                style={{
                  marginTop: 8,
                  padding: "6px 12px",
                  backgroundColor: "#ef4444",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  cursor: "pointer",
                }}
                type="danger"
              >
                Скасувати
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
