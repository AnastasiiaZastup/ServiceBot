import React, { useEffect, useState } from "react";

export default function MyAppointments({ user, onBack }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `https://service-bot-backend.onrender.com/appointments/${user.telegram_id}`
        );
        const data = await res.json();
        setAppointments(data.appointments || []);
      } catch (err) {
        console.error("❌ Помилка отримання записів:", err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.telegram_id) fetchAppointments();
  }, [user.telegram_id]);

  const formatDateTime = (date, time) => {
    if (!date || !time) return "❌ Невідомо";
    try {
      // Combine date and time as UTC to avoid offset issues
      const isoString = `${date}T${time}${time.endsWith("Z") ? "" : "Z"}`;
      const dateObj = new Date(isoString);
      if (isNaN(dateObj)) return "❌ Невідомо";
      return dateObj.toLocaleString("uk", {
        dateStyle: "short",
        timeStyle: "short",
      });
    } catch (err) {
      console.error("❌ Помилка форматування дати/часу:", err);
      return "❌ Невідомо";
    }
  };

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
              <strong>{a.service_title}</strong>
              <br />
              👩‍🎨 Майстер: {a.master_name}
              <br />
              🕒 Час: {formatDateTime(a.date, a.time)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
