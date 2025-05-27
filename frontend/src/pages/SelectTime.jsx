import React, { useState, useEffect } from "react";

// Поля з фіксованими датою та часом
const timeOptionsFull = [
  "2025-05-21T10:00:00",
  "2025-05-21T11:00:00",
  "2025-05-21T12:00:00",
  "2025-05-21T14:00:00",
];

// Витягуємо дату з першого елемента
const datePart = timeOptionsFull[0].split("T")[0];

const timeOptions = timeOptionsFull.map((t) => t.split("T")[1].slice(0, 5));

export default function SelectTime({
  user,
  service,
  master,
  onBack,
  onGoToAppointments,
}) {
  const [bookedTimes, setBookedTimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [justBookedTime, setJustBookedTime] = useState(null);

  // Завантажуємо зайняті слоти майстра
  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `https://service-bot-backend.onrender.com/appointments/master/${master.id}`
      );
      const data = await res.json();
      // Отримаємо масив рядків "HH:MM"
      const times = (data.appointments || []).map((a) => a.time.slice(0, 5));
      setBookedTimes(times);
    } catch (err) {
      console.error("❌ Помилка отримання записів майстра:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (master?.id) fetchAppointments();
  }, [master.id]);

  const handleSelectTime = async (time) => {
    // Додаємо 'Z' щоб трактувати як UTC і уникнути зсуву
    const date_time = `${datePart}T${time}:00Z`;
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
      // Якщо слот зайнятий або інша помилка, просто відмічаємо як зайнятий
      if (!res.ok) {
        if (res.status === 409) {
          setBookedTimes((prev) => [...new Set([...prev, time])]);
        }
        return;
      }
      // Успішний запис
      setJustBookedTime(time);
      setBookedTimes((prev) => [...new Set([...prev, time])]);
    } catch (err) {
      console.error("❌ Помилка створення запису:", err);
      setBookedTimes((prev) => [...new Set([...prev, time])]);
    }
  };

  return (
    <div style={{ padding: "16px" }}>
      <h2>
        Оберіть час для <br />
        {service.name} з {master.name} ({datePart})
      </h2>

      <button
        onClick={onBack}
        style={{
          marginBottom: "16px",
          padding: "8px",
          backgroundColor: "#eee",
          borderRadius: "8px",
          cursor: "pointer",
        }}
      >
        ⬅️ Назад
      </button>

      {justBookedTime && (
        <div style={{ margin: "16px 0", color: "#16a34a" }}>
          ✅ Ви записані на: {justBookedTime}
          <br />
          <button
            onClick={onGoToAppointments}
            style={{
              marginTop: "8px",
              padding: "8px",
              backgroundColor: "#0d9488",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            📅 Перейти до моїх записів
          </button>
        </div>
      )}

      {loading ? (
        <p>Завантаження слотів...</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {timeOptions.map((time) => {
            const isBooked = bookedTimes.includes(time);
            return (
              <li key={time} style={{ marginBottom: "12px" }}>
                <button
                  onClick={() => !isBooked && handleSelectTime(time)}
                  disabled={isBooked}
                  style={{
                    padding: "10px 20px",
                    borderRadius: "8px",
                    border: "none",
                    backgroundColor: isBooked ? "#d1d5db" : "#22c55e",
                    color: isBooked ? "#6b7280" : "#fff",
                    cursor: isBooked ? "not-allowed" : "pointer",
                  }}
                >
                  {time}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
