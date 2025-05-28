import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

export default function SelectTime({
  user,
  service,
  master,
  onBack,
  onGoToAppointments,
}) {
  // Стан обраної дати
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [bookedSlots, setBookedSlots] = useState([]);
  const [loading, setLoading] = useState(false);

  // Фіксований набір часових опцій
  const timeOptions = ["10:00", "11:00", "12:00", "14:00"];

  // Форматування дати в YYYY-MM-DD
  const formatDate = (date) => date.toISOString().split("T")[0];

  // Підвантажуємо зайняті слоти на обрану дату
  useEffect(() => {
    const fetchAppointments = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `https://service-bot-backend.onrender.com/appointments/master/${master.id}`
        );
        const { appointments } = await res.json();
        // Фільтруємо за обраною датою
        const dateStr = formatDate(selectedDate);
        const slots = appointments
          .filter((a) => a.date === dateStr)
          .map((a) => a.time);
        setBookedSlots(slots);
      } catch (err) {
        console.error("Помилка завантаження занять:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, [selectedDate, master.id]);

  // Обробник вибору слоту
  const handleSelectTime = async (time) => {
    const dateTime = `${formatDate(selectedDate)}T${time}:00`;
    try {
      const res = await fetch(
        `https://service-bot-backend.onrender.com/appointments`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            telegram_id: user.telegram_id,
            service_id: service.id,
            master_id: master.id,
            date_time: dateTime,
          }),
        }
      );
      if (!res.ok) throw new Error(`Запит не вдався: ${res.status}`);
      onGoToAppointments(); // переходимо до списку своїх записів
    } catch (err) {
      console.error("Помилка створення запису:", err);
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <h2>🗓️ Виберіть дату</h2>
      <Calendar
        onChange={setSelectedDate}
        value={selectedDate}
        minDate={new Date()}
        next2Label={null}
      />

      <h3 style={{ marginTop: 24 }}>
        🕑 Доступні часи на {formatDate(selectedDate)}
      </h3>
      {loading ? (
        <p>Завантажуємо слоти...</p>
      ) : (
        <div
          style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}
        >
          {timeOptions.map((time) => {
            const isBooked = bookedSlots.includes(`${time}:00`);
            return (
              <button
                key={time}
                disabled={isBooked}
                onClick={() => handleSelectTime(time)}
                style={{
                  padding: "8px 12px",
                  borderRadius: 8,
                  border: "none",
                  backgroundColor: isBooked ? "#e5e7eb" : "#10b981",
                  color: isBooked ? "#6b7280" : "#fff",
                  cursor: isBooked ? "not-allowed" : "pointer",
                }}
              >
                {time}
              </button>
            );
          })}
        </div>
      )}

      <button
        onClick={onBack}
        style={{ marginTop: 24, padding: "6px 12px", borderRadius: 8 }}
      >
        ⬅️ Назад
      </button>
    </div>
  );
}
