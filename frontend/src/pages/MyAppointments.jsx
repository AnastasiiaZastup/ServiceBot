import React, { useEffect, useState } from "react";
import Button from "../components/Button";
import Card from "../components/Card";

export default function MyAppointments({ user, onBack, showToast }) {
  const [appointments, setAppointments] = useState([]);

  const fetchAppointments = async () => {
    try {
      const res = await fetch(
        `https://service-bot-backend.onrender.com/appointments/${user.telegram_id}`
      );
      if (!res.ok) throw new Error(res.statusText);

      const data = await res.json();
      setAppointments(data.appointments || []);
      console.log("📦 Отримано записи:", data.appointments);
    } catch (err) {
      console.error("❌ Помилка отримання записів:", err);
      showToast("❌ Помилка завантаження записів", "error");
    }
  };

  useEffect(() => {
    if (user?.telegram_id) fetchAppointments();
  }, [user]);

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
    <div style={{ padding: 16, maxWidth: 600, margin: "0 auto" }}>
      <h2>📅 Мої записи</h2>
      <Button onClick={onBack} type="grey" style={{ marginBottom: 12 }}>
        ⬅️ Назад
      </Button>

      {appointments.length === 0 ? (
        <p>У вас поки нема записів.</p>
      ) : (
        <>
          <ul
            style={{ listStyle: "none", padding: 0, margin: 0, width: "100%" }}
          >
            {appointments.map((a) => (
              <li key={a.id} style={{ marginBottom: 16, width: "100%" }}>
                <Card style={{ width: "100%" }}>
                  <strong>{a.service_title}</strong> — 💰 {a.price} грн <br />
                  👩‍🎨 Майстер: {a.master_name} <br />
                  📅 {new Date(a.date).toLocaleDateString()} 🕒{" "}
                  {a.time.slice(0, 5)} <br />
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

          <p
            style={{
              textAlign: "center",
              color: "#666",
              marginTop: 32,
              fontSize: 14,
              fontStyle: "italic",
            }}
          >
            💖 Ви неймовірні! Дякуємо, що з нами 💇‍♀️
          </p>
        </>
      )}
    </div>
  );
}
