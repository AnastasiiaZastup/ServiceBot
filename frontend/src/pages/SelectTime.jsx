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
}) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [availableTimes, setAvailableTimes] = useState([]);

  const [loading, setLoading] = useState(false);
  const [selectedTime, setSelectedTime] = useState(null);

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
    } finally {
      setLoading(false);
    }
  }, [master.id, selectedDate]);

  useEffect(() => {
    if (master && selectedDate) fetchAvailableSlots();
  }, [fetchAvailableSlots]);

  const handleBooking = async () => {
    if (!selectedTime) return;
    try {
      const res = await fetch(
        "https://service-bot-backend.onrender.com/appointments",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: user.id,
            master_id: master.id,
            service_id: service.id,
            date: formatLocalDate(selectedDate),
            time: selectedTime,
          }),
        }
      );
      if (!res.ok) throw new Error("Запис не вдався");
      onGoToAppointments();
    } catch (err) {
      console.error("❌ Помилка запису:", err);
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <h2>🕒 Оберіть дату та час</h2>
      <Button onClick={onBack} type="grey" style={{ marginBottom: 12 }}>
        ⬅️ Назад
      </Button>

      <p>
        <strong>Послуга:</strong> {service.name}
      </p>
      <p>
        <strong>Ціна:</strong> {service.price} грн
      </p>

      <Calendar
        onChange={setSelectedDate}
        value={selectedDate}
        minDate={new Date()}
      />

      {loading ? (
        <p>Завантаження доступного часу...</p>
      ) : (
        <>
          <h4 style={{ marginTop: 16 }}>Доступний час:</h4>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {availableTimes.length === 0 ? (
              <p>Немає доступного часу на цю дату.</p>
            ) : (
              availableTimes.map((time) => (
                <Button
                  key={time}
                  onClick={() => setSelectedTime(time)}
                  type={selectedTime === time ? "success" : "light"}
                >
                  {time}
                </Button>
              ))
            )}
          </div>
        </>
      )}

      {selectedTime && (
        <Button
          onClick={handleBooking}
          type="success"
          style={{ marginTop: 24 }}
        >
          ✅ Записатись на {selectedTime}
        </Button>
      )}
    </div>
  );
}
