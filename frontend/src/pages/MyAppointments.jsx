import React, { useEffect, useState } from "react";
import Button from "../components/Button";
import styles from "../styles/Main.module.css";

export default function MyAppointments({ user, onBack }) {
  const [appointments, setAppointments] = useState([]);

  const fetchAppointments = async () => {
    try {
      const res = await fetch(
        `https://service-bot-backend.onrender.com/appointments/${user.telegram_id}`
      );
      if (!res.ok) throw new Error(res.statusText);
      const data = await res.json();
      setAppointments(data.appointments || []);
    } catch (err) {
      console.error("❌ Помилка отримання записів:", err);
    }
  };

  useEffect(() => {
    if (user?.telegram_id) fetchAppointments();
  }, [user]);

  const cancelAppointment = async (appointmentId) => {
    try {
      const res = await fetch(
        `https://service-bot-backend.onrender.com/appointments/${appointmentId}`,
        {
          method: "DELETE",
          headers: { Accept: "application/json" },
        }
      );
      if (!res.ok) throw new Error(`DELETE failed: ${res.status}`);
      await fetchAppointments();
    } catch (err) {
      console.error("❌ Помилка скасування:", err);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>📅 Мої записи</h2>
      <Button onClick={onBack} style={{ marginBottom: 12 }}>
        ⬅️ Назад
      </Button>

      {appointments.length === 0 ? (
        <p>У вас поки нема записів.</p>
      ) : (
        <ul className={styles.list}>
          {appointments.map((a) => (
            <li key={a.id} className={`${styles.card} ${styles.listItem}`}>
              <strong>{a.service_title}</strong> <br />
              👩‍🎨 Майстер: {a.master_name} <br />
              📅 {new Date(a.date).toLocaleDateString()} 🕒 {a.time.slice(0, 5)}{" "}
              <br />
              <Button
                onClick={() => cancelAppointment(a.id)}
                variant="danger"
                style={{ marginTop: 8 }}
              >
                Скасувати
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
