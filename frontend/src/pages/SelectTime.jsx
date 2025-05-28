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
  const [bookedSlots, setBookedSlots] = useState([]);
  const [loading, setLoading] = useState(false);

  const timeOptions = ["10:00", "11:00", "12:00", "14:00"];
  const formatDate = (date) => date.toISOString().split("T")[0];

  // Завантаження слотуів із урахуванням дати і майстра
  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `https://service-bot-backend.onrender.com/appointments`
      );
      const { appointments } = await res.json();
      const dateStr = formatDate(selectedDate);

      // Фільтруємо записи за датою та майстром
      const slots = appointments
        .filter((a) => {
          const [day] = a.date_time.split("T"); // "YYYY-MM-DD"
          const isSameMaster =
            a.master_id === master.id || a.master?.id === master.id;
          return day === dateStr && isSameMaster;
        })
        // Витягаємо час із поля `time` ("HH:mm:ss" → "HH:mm")
        .map((a) => a.time.slice(0, 5));

      setBookedSlots(slots);
    } catch (err) {
      console.error("Помилка завантаження слотів:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedDate, master.id]);

  // Запуск при зміні дати або майстра
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

      // Після бронювання оновлюємо доступні слоти для тієї ж дати
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
