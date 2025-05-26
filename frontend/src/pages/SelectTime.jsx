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
  const [justBooked, setJustBooked] = useState(null);

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

      console.log("📥 Заброньовані слоти:", slots);
      setBookedSlots(slots);
    } catch (err) {
      console.error("❌ Помилка отримання записів майстра:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (master?.id) {
      fetchAppointments();
    }
  }, [master?.id]);

  const handleSelectTime = async (date_time) => {
    if (!user || !service || !master) {
      console.error("❗️Немає даних для запису:", { user, service, master });
      return;
    }

    console.log("▶️ Спроба запису на:", date_time);

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

      let data = {};
      try {
        data = await res.json();
      } catch {
        console.warn("⚠️ Не вдалося розпарсити JSON");
      }

      if (res.ok) {
        console.log("✅ Успішно записано:", data);
        setJustBooked(date_time);
        await fetchAppointments(); // оновити слоти
      } else {
        console.warn("🚫 Сервер повернув помилку:", res.status, data?.error);
      }
    } catch (err) {
      console.error("❌ Помилка запиту:", err);
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

      {justBooked && (
        <div style={{ marginBottom: "16px", color: "#16a34a" }}>
          ✅ Ви записались на:{" "}
          {new Date(justBooked).toLocaleString("uk", {
            dateStyle: "short",
            timeStyle: "short",
          })}
          <br />
          <button
            onClick={onGoToAppointments}
            style={{
              marginTop: "12px",
              padding: "10px 20px",
              backgroundColor: "#0d9488",
              color: "white",
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
            const isBooked = bookedSlots.includes(time);
            return (
              <li key={time} style={{ marginBottom: "12px" }}>
                <button
                  disabled={isBooked}
                  onClick={() => handleSelectTime(time)}
                  style={{
                    padding: "10px 20px",
                    borderRadius: "8px",
                    border: "none",
                    backgroundColor: isBooked ? "#d1d5db" : "#22c55e",
                    color: isBooked ? "#6b7280" : "white",
                    cursor: isBooked ? "not-allowed" : "pointer",
                  }}
                >
                  {new Date(time).toLocaleString("uk", {
                    dateStyle: "short",
                    timeStyle: "short",
                  })}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
