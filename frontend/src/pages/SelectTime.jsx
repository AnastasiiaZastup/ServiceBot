import React, { useState, useCallback } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

export default function SelectTime({
  user,
  service,
  master,
  onBack,
  onGoToAppointments,
}) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [bookedSlots, setBookedSlots] = useState([]);
  const [loading, setLoading] = useState(false);

  const timeOptions = ["10:00", "11:00", "12:00", "14:00"];

  // Форматування локальної дати без зсуву по UTC
  const formatDate = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`; // "YYYY-MM-DD"
  };

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    const dateStr = formatDate(selectedDate); // "YYYY-MM-DD"
    console.log("➤ fetchAppointments:", {
      masterId: master.id,
      date: dateStr,
    });
    try {
      const res = await fetch(
        `https://service-bot-backend.onrender.com/appointments/master/${master.id}`
      );
      const { appointments } = await res.json();
      console.log("➤ got appointments:", appointments);
      // якщо бекенд повертає тільки поле date_time:
      const slots = appointments
        .filter((a) => a.date_time.split("T")[0] === dateStr)
        .map((a) => a.date_time.split("T")[1].slice(0, 5));
      // якщо бекенд повертає date та time окремо, то:
      // const slots = appointments
      //   .filter(a => a.date === dateStr)
      //   .map(a => a.time.slice(0,5))
      console.log("➤ computed slots:", slots);
      setBookedSlots(slots);
    } catch (err) {
      console.error("❌ fetchAppointments error:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedDate, master.id]);

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

      // Оновлюємо доступні слоти на поточну дату
      await fetchAppointments();
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
            const isBooked = bookedSlots.includes(time);
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

      <div style={{ display: "flex", gap: 8, marginTop: 24 }}>
        <button
          onClick={onBack}
          style={{ padding: "6px 12px", borderRadius: 8 }}
        >
          ⬅️ Назад
        </button>
        <button
          onClick={onGoToAppointments}
          style={{ padding: "6px 12px", borderRadius: 8 }}
        >
          📋 Мої записи
        </button>
      </div>
    </div>
  );
}
