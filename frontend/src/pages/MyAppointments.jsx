import React, { useEffect, useState } from "react";

export default function MyAppointments({ user, onBack }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await fetch(
          `https://service-bot-backend.onrender.com/appointments/${user.telegram_id}`
        );
        const data = await res.json();
        console.log("📅 Отримані записи:", data);
        setAppointments(data.appointments || []);
      } catch (err) {
        console.error("❌ Помилка отримання записів:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [user.telegram_id]);

  if (loading) return <p>Завантаження записів...</p>;

  return (
    <div style={{ padding: "16px" }}>
      <h2>📅 Мої записи</h2>
      <button
        onClick={onBack}
        style={{
          marginBottom: "12px",
          padding: "8px 16px",
          backgroundColor: "#2b2b2b",
          color: "#fff",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
        }}
      >
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
              <strong>{a.service_title}</strong> <br />
              👩‍🎨 Майстер: {a.master_name} <br />
              🕒 Час:{" "}
              {new Date(a.date_time).toLocaleString("uk-UA", {
                dateStyle: "short",
                timeStyle: "short",
              })}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
