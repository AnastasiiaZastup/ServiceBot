import React, { useEffect, useState } from "react";

export default function MasterSetup({ user, onBack, onSave }) {
  const [services, setServices] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [slotInput, setSlotInput] = useState("");
  const [slots, setSlots] = useState([]);

  // Отримати всі доступні послуги
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

  const toggleService = (serviceId) => {
    if (selectedServices.includes(serviceId)) {
      setSelectedServices(selectedServices.filter((id) => id !== serviceId));
    } else {
      setSelectedServices([...selectedServices, serviceId]);
    }
  };

  const addSlot = () => {
    if (!slotInput) return;
    setSlots([...slots, slotInput]);
    setSlotInput("");
  };

  const saveAll = async () => {
    try {
      // 1. Зберігаємо послуги
      await fetch("https://service-bot-backend.onrender.com/master/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          master_id: user.id,
          service_ids: selectedServices,
        }),
      });

      // 2. Зберігаємо слоти
      await fetch("https://service-bot-backend.onrender.com/master/slots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          master_id: user.id,
          times: slots,
        }),
      });

      alert("✅ Дані збережено!");
      onSave(); // перехід далі
    } catch (err) {
      console.error("❌ Помилка збереження:", err);
      alert("Помилка при збереженні даних");
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

      <h3 style={{ marginTop: 16 }}>Додайте доступні слоти часу:</h3>
      <div style={{ display: "flex", gap: 8 }}>
        <input
          type="time"
          value={slotInput}
          onChange={(e) => setSlotInput(e.target.value)}
        />
        <button onClick={addSlot}>➕ Додати</button>
      </div>

      <ul style={{ marginTop: 12 }}>
        {slots.map((slot, idx) => (
          <li key={idx}>{slot}</li>
        ))}
      </ul>

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
          }}
        >
          💾 Зберегти
        </button>
      </div>
    </div>
  );
}
