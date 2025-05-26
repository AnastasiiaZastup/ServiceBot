import React, { useState, useEffect } from "react";

const timeOptions = [
  "2025-05-21T10:00:00",
  "2025-05-21T11:00:00",
  "2025-05-21T12:00:00",
  "2025-05-21T14:00:00",
];

export default function SelectTime({
  user,
  service,
  master,
  onBack,
  onGoToAppointments,
}) {
  const [bookedSlots, setBookedSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Отримуємо вже зайняті слоти для майстра
  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `https://service-bot-backend.onrender.com/appointments/master/${master.id}`
      );
      const data = await res.json();

      const slots = data.appointments.map(
        (a) => `${a.date}T${a.time.slice(0, 8)}`
      );

      setBookedSlots(slots);
    } catch (err) {
      console.error("❌ Помилка отримання записів майстра:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [master.id]);

  // 🧠 Фільтруємо доступні слоти
  const availableTimes = timeOptions.filter(
    (time) => !bookedSlots.includes(time)
  );

  // ✅ Обробка вибору часу
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
        alert("✅ Ви успішно записались!");
        // 🔁 одразу ховаємо слот локально
        setBookedSlots((prev) => [...prev, date_time]);

        // 👉 або одразу перейти на сторінку "Мої записи"
        onGoToAppointments();
      } else {
        alert("🚫 Помилка: " + data.error);
      }
    } catch (err) {
      console.error("❌ Помилка створення запису:", err);
      alert("🚫 Не вдалося створити запис.");
    }
  };

  return (
    <div style={{ padding: "16px" }}>
      <h2>
        Обери час для <br />
        {service.name} з {master.name}
      </h2>

      <button
        onClick={onBack}
        style={{
          marginBottom: "16px",
          padding: "8px 16px",
          backgroundColor: "#eee",
          borderRadius: "8px",
          cursor: "pointer",
        }}
      >
        ⬅️ Назад
      </button>

      {loading ? (
        <p>Завантаження слотів...</p>
      ) : availableTimes.length === 0 ? (
        <p>Усі слоти зайняті.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {availableTimes.map((time) => (
            <li key={time} style={{ marginBottom: "12px" }}>
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
                {new Date(time).toLocaleString("uk", {
                  dateStyle: "short",
                  timeStyle: "short",
                })}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
