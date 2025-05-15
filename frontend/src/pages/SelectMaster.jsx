import React, { useEffect, useState } from "react";

export default function SelectMaster({ service }) {
  const [masters, setMasters] = useState([]);

  useEffect(() => {
    const fetchMasters = async () => {
      try {
        const res = await fetch(
          `https://service-bot-backend.onrender.com/masters-by-service/${service.id}`
        );
        const data = await res.json();
        setMasters(data.masters || []);
      } catch (err) {
        console.error("Помилка отримання майстрів", err);
      }
    };

    fetchMasters();
  }, [service]);

  return (
    <div style={{ padding: "16px" }}>
      <h2>Майстри для послуги: {service.name}</h2>
      {masters.length === 0 ? (
        <p>Майстрів не знайдено.</p>
      ) : (
        <ul style={{ padding: 0, listStyle: "none" }}>
          {masters.map((m) => (
            <li key={m.id} style={{ marginBottom: "12px" }}>
              👩‍🎨 <strong>{m.name}</strong> ({m.experience} років досвіду)
              <br />
              <button
                style={{
                  marginTop: "6px",
                  padding: "6px 12px",
                  background: "#10b981",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                }}
                onClick={() => alert(`Обрано майстра: ${m.name}`)}
              >
                Обрати
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
