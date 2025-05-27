import React, { useEffect, useState } from "react";

export default function MyAppointments({ user, onBack }) {
  const [appointments, setAppointments] = useState([]);

  // Завантажуємо список записів клієнта
  const fetchAppointments = async () => {
    try {
      const res = await fetch(
        `https://service-bot-backend.onrender.com/appointments/${user.telegram_id}`
      );
      const data = await res.json();
      setAppointments(data.appointments || []);
    } catch (err) {
      console.error("❌ Помилка отримання записів:", err);
    }
  };

  // Підвантажуємо при старті та при зміні user.telegram_id
  useEffect(() => {
    if (user?.telegram_id) fetchAppointments();
  }, [user.telegram_id]);

  // Скасування запису
  const cancelAppointment = async (id) => {
    try {
      const res = await fetch(
        `https://service-bot-backend.onrender.com/appointments/${id}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        fetchAppointments();
      } else {
        console.error("❌ Помилка скасування запису:", await res.text());
      }
    } catch (err) {
      console.error("❌ Помилка скасування запису:", err);
    }
  };

  return (
    <div style={{ padding: "16px" }}>
      <h2>📅 Мої записи</h2>
      <button onClick={onBack} style={{ marginBottom: "12px" }}>
        ⬅️ Назад
      </button>

      {appointments.length === 0 ? (
        <p>У вас поки немає записів.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {appointments.map((a) => (
            <li
              key={a.id}
              style={{
                marginBottom: "16px",
                padding: "12px",
                backgroundColor: "#f3f3f3",
                borderRadius: "8px",
              }}
            >
              <strong>{a.service_title}</strong>
              <br />
              👩‍🎨 Майстер: {a.master_name}
              <br />
              🕒 {a.date} {a.time}
              <br />
              <button
                onClick={() => cancelAppointment(a.id)}
                style={{
                  marginTop: "8px",
                  padding: "6px 12px",
                  backgroundColor: "#ef4444",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
              >
                Скасувати
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
