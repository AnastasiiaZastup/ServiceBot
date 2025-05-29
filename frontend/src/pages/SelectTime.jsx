import React, { useState, useCallback, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./SelectTime.css";

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

  const formatDate = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    const dateStr = formatDate(selectedDate);
    try {
      const res = await fetch(
        `https://service-bot-backend.onrender.com/appointments/master/${master.id}/${dateStr}`
      );
      const { booked } = await res.json();
      console.log("Booked for", dateStr, "→", booked);
      setBookedSlots(booked);
    } catch (err) {
      console.error("❌ fetchAppointments error:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedDate, master.id]);

  // <-- ТУТ ПІДКЛЮЧАЄМО FETCH НА ЗАПУСК І ПРИ ЗМІНІ ДАТИ / МАЙСТРА
  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

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
      // після успіху перезавантажуємо слоти
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
                className={
                  isBooked ? "slot-button slot-button--booked" : "slot-button"
                }
                onClick={() => handleSelectTime(time)}
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
