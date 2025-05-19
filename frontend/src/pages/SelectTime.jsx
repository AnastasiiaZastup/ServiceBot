// pages/SelectTime.jsx
import React from "react";

const timeOptions = [
  "2025-05-21T10:00:00",
  "2025-05-21T11:00:00",
  "2025-05-21T12:00:00",
  "2025-05-21T14:00:00",
];

export default function SelectTime({ user, service, master, onBack }) {
  const handleSelectTime = async (date_time) => {
    try {
      const res = await fetch(
        "https://service-bot-backend.onrender.com/appointments",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            telegram_id: user.telegram_id,
            service_id: service.id,
            master_id: master.id,
            date_time,
          }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        alert("✅ Запис створено!");
        window.Telegram.WebApp.close(); // закриває мініапп
      } else {
        alert("🚫 Помилка: " + data.error);
      }
    } catch (err) {
      console.error("Помилка створення запису:", err);
      alert("🚫 Помилка запису.");
    }
  };

  return (
    <div style={{ padding: "16px" }}>
      <h2>
        Обери час для <br />
        {service.name} з {master.name}
      </h2>
      <button onClick={onBack}>⬅️ Назад</button>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {timeOptions.map((time) => (
          <li key={time} style={{ margin: "12px 0" }}>
            <button
              onClick={() => handleSelectTime(time)}
              style={{
                padding: "10px 20px",
                borderRadius: "8px",
                border: "none",
                backgroundColor: "#22c55e",
                color: "white",
                cursor: "pointer",
              }}
            >
              {new Date(time).toLocaleString("uk-UA", {
                dateStyle: "short",
                timeStyle: "short",
              })}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
