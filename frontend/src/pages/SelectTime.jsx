import React, { useState, useEffect, useCallback } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import Button from "../components/Button";

export default function SelectTime({
  user,
  service,
  master,
  onBack,
  onGoToAppointments,
  showToast, // 🆕
}) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [availableTimes, setAvailableTimes] = useState([]);
  const [bookedTimes, setBookedTimes] = useState([]);
  const [loading, setLoading] = useState(false);

  const formatLocalDate = (date) => {
    return date.toLocaleDateString("sv-SE"); // YYYY-MM-DD
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
      setAvailableTimes(data.slots.map((s) => s.time.slice(0, 5)));
    } catch (err) {
      console.error("❌ Помилка завантаження слотів:", err);
      showToast("❌ Помилка завантаження слотів", "error");
    } finally {
      setLoading(false);
    }
  }, [master.id, selectedDate, showToast]);

  const fetchBookedSlots = useCallback(async () => {
    try {
      const res = await fetch(
        `https://service-bot-backend.onrender.com/appointments/booked/${
          master.id
        }/${formatLocalDate(selectedDate)}`
      );
      const data = await res.json();
      setBookedTimes(data.slots.map((s) => s.time.slice(0, 5)));
    } catch (err) {
      console.error("❌ Помилка отримання зайнятих слотів:", err);
      showToast("❌ Помилка завантаження зайнятих слотів", "error");
    }
  }, [master.id, selectedDate, showToast]);

  useEffect(() => {
    fetchAvailableSlots();
    fetchBookedSlots();
  }, [fetchAvailableSlots, fetchBookedSlots]);

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

      showToast("✅ Запис створено!", "success");
      onGoToAppointments();
    } catch (err) {
      console.error("❌ Помилка створення запису:", err);
      showToast("❌ Не вдалося створити запис", "error");
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
          {availableTimes.map((time) => {
            const isBooked = bookedTimes.includes(time);
            return (
              <button
                key={time}
                onClick={() => !isBooked && handleSelectTime(time)}
                style={{
                  padding: "8px 12px",
                  borderRadius: 8,
                  border: "none",
                  backgroundColor: isBooked ? "#d1d5db" : "#10b981",
                  color: isBooked ? "#6b7280" : "#fff",
                  cursor: isBooked ? "not-allowed" : "pointer",
                }}
                disabled={isBooked}
              >
                {time}
              </button>
            );
          })}
        </div>
      )}

      <div style={{ display: "flex", gap: 8, marginTop: 24 }}>
        <Button
          onClick={onBack}
          style={{ padding: "6px 12px", borderRadius: 8 }}
        >
          ⬅️ Назад
        </Button>
        <Button
          onClick={onGoToAppointments}
          style={{ padding: "6px 12px", borderRadius: 8 }}
        >
          📋 Мої записи
        </Button>
      </div>
    </div>
  );
}
