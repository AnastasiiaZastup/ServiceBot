import React, { useEffect, useState } from "react";

export default function SelectMaster({ service, onBack, onSelectMaster }) {
  const [masters, setMasters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMasters = async () => {
      try {
        const res = await fetch(
          `https://service-bot-backend.onrender.com/masters-by-service/${service.id}`
        );
        const data = await res.json();
        console.log("Отримано майстрів:", data);
        setMasters(data.masters || []);
      } catch (error) {
        console.error("Помилка отримання майстрів:", error);
      } finally {
        setLoading(false);
      }
    };

    if (service?.id) {
      fetchMasters();
    }
  }, [service]);

  if (loading) return <p>Завантаження майстрів...</p>;

  return (
    <div style={{ padding: "16px" }}>
      <h2>Майстри для послуги: {service.name}</h2>
      <button onClick={onBack}>⬅️ Назад</button>
      {masters.length === 0 ? (
        <p>Майстрів не знайдено.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {masters.map((m) => (
            <li key={m.id} style={{ marginBottom: "12px" }}>
              <strong>{m.name}</strong> (@{m.username})
              <br />
              <button onClick={() => onSelectMaster(m)}>Обрати</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
