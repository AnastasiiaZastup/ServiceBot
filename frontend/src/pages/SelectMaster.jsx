import React, { useEffect, useState } from "react";
import Button from "../components/Button";

export default function SelectMaster({ service, onBack, onSelectMaster }) {
  const [masters, setMasters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMasters = async () => {
      try {
        const res = await fetch(
          `https://service-bot-backend.onrender.com/masters/${service.id}`
        );
        const data = await res.json();
        setMasters(data.masters || []);
      } catch (err) {
        console.error("❌ Помилка завантаження майстрів:", err);
      } finally {
        setLoading(false);
      }
    };

    if (service) fetchMasters();
  }, [service]);

  return (
    <div style={{ padding: 16 }}>
      <h2>👩‍🎨 Оберіть майстра</h2>

      {loading ? (
        <p>Завантаження...</p>
      ) : (
        <>
          {masters.length === 0 ? (
            <p>Немає майстрів для цієї послуги</p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0 }}>
              {masters.map((master) => (
                <li key={master.id} style={{ marginBottom: 12 }}>
                  <Button
                    onClick={() => onSelectMaster(master)}
                    style={{
                      width: "100%",
                      padding: "12px",
                      borderRadius: "8px",
                      border: "1px solid #ccc",
                      backgroundColor: "#f9fafb",
                      textAlign: "left",
                      cursor: "pointer",
                    }}
                  >
                    <strong>{master.name}</strong>
                    {master.username && (
                      <span style={{ color: "#6b7280", marginLeft: 8 }}>
                        @{master.username}
                      </span>
                    )}
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      <Button
        onClick={onBack}
        style={{
          marginTop: 24,
          padding: "8px 16px",
          borderRadius: 8,
          border: "none",
          backgroundColor: "#d1d5db",
        }}
      >
        ⬅️ Назад
      </Button>
    </div>
  );
}
