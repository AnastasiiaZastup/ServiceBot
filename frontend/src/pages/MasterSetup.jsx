import React, { useEffect, useState } from "react";

export default function MasterSetup({ user, onBack, onSave }) {
  const [services, setServices] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [slotDate, setSlotDate] = useState("");
  const [slotTime, setSlotTime] = useState("");
  const [slots, setSlots] = useState([]);

  // Отримати список послуг
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await fetch(
          "https://service-bot-backend.onrender.com/services"
        );
        const data = await res.json();
        setServices(data.services || []);
      } catch (err) {
        console.error("❌ Помилка завантаження послуг:", err);
      }
    };
    fetchServices();
  }, []);

  // Додати або прибрати послугу
  const toggleService = (serviceId) => {
    setSelectedServices((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  // Додати слот до списку
  const addSlot = () => {
    if (!slotDate || !slotTime) return;
    setSlots([...slots, { date: slotDate, time: slotTime }]);
    setSlotDate("");
    setSlotTime("");
  };

  // Зберегти всі дані
  const saveAll = async () => {
    try {
      // Зберігаємо обрані послуги
      await fetch("https://service-bot-backend.onrender.com/master/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          master_id: user.id,
          service_ids: selectedServices,
        }),
      });

      // Зберігаємо слоти з коректними форматами
      await fetch("https://service-bot-backend.onrender.com/master/slots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          master_id: user.id,
          slots: slots.map((s) => ({
            date: new Date(s.date).toISOString().split("T")[0],
            time: s.time.length === 5 ? s.time + ":00" : s.time,
          })),
        }),
      });

      alert("✅ Дані успішно збережено!");
      onSave();
    } catch (err) {
      console.error("❌ Помилка при збереженні:", err);
      alert("Сталася помилка при збереженні.");
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <h2>🔧 Налаштування майстра</h2>

      <h3>Оберіть послуги, які ви надаєте:</h3>
      {services.map((service) => (
        <div key={service.id}>
          <label>
            <input
              type="checkbox"
              checked={selectedServices.includes(service.id)}
              onChange={() => toggleService(service.id)}
            />
            {service.name}
          </label>
        </div>
      ))}

      <h3 style={{ marginTop: 16 }}>Додайте доступні слоти (дата + час):</h3>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <input
          type="date"
          value={slotDate}
          onChange={(e) => setSlotDate(e.target.value)}
        />
        <input
          type="time"
          value={slotTime}
          onChange={(e) => setSlotTime(e.target.value)}
        />
        <button onClick={addSlot}>➕ Додати</button>
      </div>

      {slots.length > 0 && (
        <>
          <h4>🗓️ Додані слоти:</h4>
          <ul>
            {slots.map((s, idx) => (
              <li key={idx}>
                📅 {s.date} ⏰ {s.time}
              </li>
            ))}
          </ul>
        </>
      )}

      <div style={{ marginTop: 24 }}>
        <button onClick={onBack} style={{ marginRight: 12 }}>
          ⬅️ Назад
        </button>
        <button
          onClick={saveAll}
          style={{
            backgroundColor: "#10b981",
            color: "#fff",
            padding: "6px 12px",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
          }}
        >
          💾 Зберегти
        </button>
      </div>
    </div>
  );
}
