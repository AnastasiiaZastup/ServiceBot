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
      } catch (error) {
        console.error("Помилка отримання майстрів:", error);
      }
    };

    if (service?.id) {
      fetchMasters();
    }
  }, [service]);

  return (
    <div style={{ padding: "16px" }}>
      <h2>Майстри для: {service.name}</h2>
      {masters.length === 0 ? (
        <p>Майстрів не знайдено.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {masters.map((master) => (
            <li key={master.id} style={{ marginBottom: "12px" }}>
              <strong>{master.name}</strong> (@{master.username})
              <br />
              <button
                style={{
                  marginTop: "8px",
                  padding: "6px 12px",
                  backgroundColor: "#10b981",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
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
