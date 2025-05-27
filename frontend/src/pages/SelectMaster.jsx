import React, { useState, useEffect } from "react";

const DAYS_AHEAD = 7; // скільки днів показувати
const timeOptions = ["10:00", "11:00", "12:00", "14:00"];

export default function SelectTime({
  user,
  service,
  master,
  onBack,
  onGoToAppointments,
}) {
  const [bookedSlots, setBookedSlots] = useState([]); // [{date: "...", time: "..."}]
  const [loading, setLoading] = useState(true);
  const [justBooked, setJustBooked] = useState(null);

  // Генеруємо список дат у форматі YYYY-MM-DD
  const dateOptions = Array.from({ length: DAYS_AHEAD }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d.toISOString().split("T")[0];
  });

  // Завантажуємо всі апоїнтменти майстра
  useEffect(() => {
    const fetchAppointments = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `https://service-bot-backend.onrender.com/appointments/master/${master.id}`
        );
        const data = await res.json();
        // Перетворюємо у {date, time} (time в форматі HH:MM)
        const slots = (data.appointments || []).map((a) => ({
          date: a.date,
          time: a.time.slice(0, 5),
        }));
        setBookedSlots(slots);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (master?.id) fetchAppointments();
  }, [master.id]);

  const handleSelect = async (date, time) => {
    const date_time = `${date}T${time}:00Z`;
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
      if (res.ok) {
        setJustBooked({ date, time });
        setBookedSlots((prev) => [...prev, { date, time }]);
      } else if (res.status === 409) {
        // конфлікт — теж позначимо як зайнято
        setBookedSlots((prev) => [...prev, { date, time }]);
      }
    } catch (e) {
      console.error(e);
      setBookedSlots((prev) => [...prev, { date, time }]);
    }
  };

  const isBooked = (date, time) =>
    bookedSlots.some((bs) => bs.date === date && bs.time === time);

  return (
    <div style={{ padding: 16 }}>
      <h2>
        Слоти для {service.name} у майстра {master.name}
      </h2>
      <button onClick={onBack} style={{ marginBottom: 16 }}>
        ⬅️ Назад
      </button>

      {justBooked && (
        <div style={{ marginBottom: 16, color: "green" }}>
          ✅ Ви записані: {justBooked.date} о {justBooked.time}
          <br />
          <button onClick={onGoToAppointments}>📅 До моїх записів</button>
        </div>
      )}

      {loading ? (
        <p>Завантаження...</p>
      ) : (
        dateOptions.map((date) => (
          <div key={date} style={{ marginBottom: 24 }}>
            <h3>
              {new Date(date).toLocaleDateString("uk", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </h3>
            <ul style={{ listStyle: "none", padding: 0 }}>
              {timeOptions.map((time) => {
                const booked = isBooked(date, time);
                return (
                  <li key={time} style={{ margin: "4px 0" }}>
                    <button
                      onClick={() => !booked && handleSelect(date, time)}
                      disabled={booked}
                      style={{
                        padding: "8px 16px",
                        borderRadius: 8,
                        border: "none",
                        backgroundColor: booked ? "#e5e7eb" : "#22c55e",
                        color: booked ? "#6b7280" : "#fff",
                        cursor: booked ? "not-allowed" : "pointer",
                        marginRight: 8,
                      }}
                    >
                      {time}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))
      )}
    </div>
  );
}
