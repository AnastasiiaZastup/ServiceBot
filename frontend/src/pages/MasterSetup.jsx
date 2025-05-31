import React, { useEffect, useState } from "react";

export default function MasterSetup({ user, onBack, onSave }) {
  const [services, setServices] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);

  const [slotDate, setSlotDate] = useState("");
  const [slotTime, setSlotTime] = useState("");
  const [slots, setSlots] = useState([]);

  // 1. Отримати список доступних послуг
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

  // 2. Вибір послуг
  const toggleService = (serviceId) => {
    setSelectedServices((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  // 3. Додавання слота
  const addSlot = () => {
    if (!slotDate || !slotTime) return;
    setSlots([...slots, { date: slotDate, time: slotTime }]);
    setSlotDate("");
    setSlotTime("");
  };

  // 4. Збереження
  const saveAll = async () => {
    try {
      // 4.1 Зберігаємо обрані послуги
      await fetch("https://service-bot-backend.onrender.com/master/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          master_id: user.id,
          service_ids: selectedServices,
        }),
      });

      // 4.2 Зберігаємо слоти з датами
      await fetch("https://service-bot-backend.onrender.com/master/slots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          master_id: user.id,
          slots: slots,
        }),
      });

      alert("✅ Дані збережено!");
      onSave(); // перейти до записів
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

      <ul>
        {slots.map((slot, idx) => (
          <li key={idx}>
            📅 {slot.date} ⏰ {slot.time}
          </li>
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
            cursor: "pointer",
          }}
        >
          💾 Зберегти
        </button>
      </div>
    </div>
  );
}
