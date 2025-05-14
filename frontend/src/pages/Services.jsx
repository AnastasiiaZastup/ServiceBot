import React, { useEffect, useState } from "react";

export default function Services() {
  const [services, setServices] = useState([]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await fetch(
          "https://service-bot-backend.onrender.com/services"
        );
        const data = await res.json();
        setServices(data.services || []);
      } catch (error) {
        console.error("Помилка завантаження послуг", error);
      }
    };

    fetchServices();
  }, []);

  return (
    <div style={{ padding: "16px" }}>
      <h2>Список послуг</h2>
      {services.length === 0 ? (
        <p>Послуги не знайдено.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {services.map((service) => (
            <li key={service.id} style={{ marginBottom: "12px" }}>
              <strong>{service.name}</strong> — {service.description}
              <br />
              <button
                style={{
                  marginTop: "8px",
                  padding: "6px 12px",
                  border: "none",
                  borderRadius: "8px",
                  background: "#2b82f6",
                  color: "white",
                }}
                onClick={() => alert(`Обрана послуга: ${service.name}`)}
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
