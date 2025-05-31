import React, { useState, useEffect, useCallback } from "react";
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
  const [availableTimes, setAvailableTimes] = useState([]);
  const [loading, setLoading] = useState(false);

  // Форматуємо дату у локальному часовому поясі як YYYY-MM-DD
  const formatLocalDate = (date) => {
    return date.toLocaleDateString("sv-SE"); // формат YYYY-MM-DD гарантовано
  };

  const fetchAvailableSlots = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `https://service-bot-backend.onrender.com/available-slots/${
          master.id
        }/${formatLocalDate(selectedDate)}`
      );
      const data = await res.json();
      setAvailableTimes(data.slots.map((s) => s.time.slice(0, 5))); // формат HH:MM
    } catch (err) {
      console.error("❌ Помилка завантаження слотів:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedDate, master.id]);

  useEffect(() => {
    fetchAvailableSlots();
  }, [fetchAvailableSlots]);

  const handleSelectTime = async (time) => {
    const dateTime = `${formatLocalDate(selectedDate)}T${time}:00`;
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

      alert("✅ Запис створено!");
      onGoToAppointments();
    } catch (err) {
      console.error("❌ Помилка створення запису:", err);
      alert("Не вдалося створити запис.");
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
        🕒 Доступні часи на {formatLocalDate(selectedDate)}
      </h3>

      {loading ? (
        <p>Завантаження...</p>
      ) : availableTimes.length === 0 ? (
        <p>Немає доступних слотів на цю дату.</p>
      ) : (
        <div
          style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}
        >
          {availableTimes.map((time) => (
            <button
              key={time}
              onClick={() => handleSelectTime(time)}
              style={{
                padding: "8px 12px",
                borderRadius: 8,
                border: "none",
                backgroundColor: "#10b981",
                color: "#fff",
                cursor: "pointer",
              }}
            >
              {time}
            </button>
          ))}
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
