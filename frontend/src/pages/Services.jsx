import React, { useEffect, useState } from "react";

export default function Services({ onSelectService, category }) {
  const [services, setServices] = useState([]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await fetch(
          `https://service-bot-backend.onrender.com/services-by-category/${category.id}`
        );
        const data = await res.json();
        setServices(data.services || []);
      } catch (error) {
        console.error("Помилка отримання послуг:", error);
      }
    };

    fetchServices();
  }, [category]);

  return (
    <div style={{ padding: "16px" }}>
      <h2>Послуги категорії: {category.name}</h2>
      {services.length === 0 ? (
        <p>Послуги не знайдено.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {services.map((service) => (
            <li key={service.id} style={{ marginBottom: "12px" }}>
              <strong>{service.name}</strong>
              <br />
              <button
                onClick={() => onSelectService(service)}
                style={{
                  marginTop: "8px",
                  padding: "6px 12px",
                  backgroundColor: "#2b82f6",
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
