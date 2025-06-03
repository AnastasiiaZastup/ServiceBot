// components/MasterPrice.jsx
import React, { useEffect, useState } from "react";
import Card from "../components/Card";
import Button from "../components/Button";

export default function MasterPrice({ master, onSelectService, onBack }) {
  const [services, setServices] = useState([]);

  useEffect(() => {
    fetch(
      `https://service-bot-backend.onrender.com/services/by-master/${master.id}`
    )
      .then((res) => res.json())
      .then((data) => setServices(data.services || []))
      .catch((err) => console.error("Помилка завантаження прайсу:", err));
  }, [master.id]);

  return (
    <div style={{ padding: 16 }}>
      <h2>💼 Прайс майстра: {master.name}</h2>

      <Button onClick={onBack} type="grey" style={{ marginBottom: 12 }}>
        ⬅ Назад
      </Button>

      {services.length === 0 ? (
        <p>Цей майстер поки не має прив’язаних послуг.</p>
      ) : (
        services.map((s) => (
          <Card key={s.id} style={{ marginBottom: 12 }}>
            <strong>{s.name}</strong> <br />
            🕒 {s.duration} хв | 💵 {s.price} грн <br />
            {s.description && <small>📌 {s.description}</small>} <br />
            <Button
              type="success"
              style={{ marginTop: 8 }}
              onClick={() => onSelectService(s)}
            >
              ✅ Обрати цю послугу
            </Button>
          </Card>
        ))
      )}
    </div>
  );
}
