import React, { useEffect, useState } from "react";
import Button from "../components/Button";
import Input from "../components/Input";
import Label from "../components/Label";
import Card from "../components/Card";

export default function MasterSetup({
  user,
  onBack,
  onSave,
  onViewAppointments,
  onViewPrice, // 🆕 callback to switch to price view
  showToast,
}) {
  const [services, setServices] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [slotDate, setSlotDate] = useState("");
  const [slotTime, setSlotTime] = useState("");
  const [slots, setSlots] = useState([]);

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
        showToast("❌ Помилка завантаження послуг", "error");
      }
    };
    fetchServices();
  }, [showToast]);

  const toggleService = (serviceId) => {
    setSelectedServices((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const addSlot = () => {
    if (!slotDate || !slotTime) return;
    setSlots([...slots, { date: slotDate, time: slotTime }]);
    setSlotDate("");
    setSlotTime("");
  };

  const saveAll = async () => {
    try {
      await fetch("https://service-bot-backend.onrender.com/master/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          master_id: user.id,
          service_ids: selectedServices,
        }),
      });

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

      showToast("✅ Дані успішно збережено!", "success");
      onSave();
    } catch (err) {
      console.error("❌ Помилка при збереженні:", err);
      showToast("❌ Сталася помилка при збереженні", "error");
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <h2>🔧 Налаштування майстра</h2>

      <h3>Оберіть послуги, які ви надаєте:</h3>
      <Card>
        {services.map((service) => (
          <div key={service.id} style={{ marginBottom: 6 }}>
            <label>
              <input
                type="checkbox"
                checked={selectedServices.includes(service.id)}
                onChange={() => toggleService(service.id)}
              />{" "}
              {service.name}
            </label>
          </div>
        ))}
      </Card>

      <h3 style={{ marginTop: 16 }}>Додайте доступні слоти (дата + час):</h3>
      <Card>
        <div
          style={{
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
            alignItems: "flex-end",
          }}
        >
          <div style={{ flex: 1 }}>
            <Label htmlFor="slotDate">Дата</Label>
            <Input
              id="slotDate"
              type="date"
              value={slotDate}
              onChange={(e) => setSlotDate(e.target.value)}
            />
          </div>

          <div style={{ flex: 1 }}>
            <Label htmlFor="slotTime">Час</Label>
            <Input
              id="slotTime"
              type="time"
              value={slotTime}
              onChange={(e) => setSlotTime(e.target.value)}
            />
          </div>

          <Button onClick={addSlot}>➕ Додати</Button>
        </div>
      </Card>

      {slots.length > 0 && (
        <Card>
          <h4>🗓️ Додані слоти:</h4>
          <ul style={{ paddingLeft: 20 }}>
            {slots.map((s, idx) => (
              <li key={idx}>
                📅 {s.date} ⏰ {s.time}
              </li>
            ))}
          </ul>
        </Card>
      )}

      <div
        style={{
          marginTop: 24,
          display: "flex",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <Button onClick={onBack} type="grey">
          ⬅️ Назад
        </Button>
        <Button onClick={saveAll} type="success">
          💾 Зберегти
        </Button>
        <Button onClick={onViewAppointments}>📅 Переглянути записи</Button>
        <Button onClick={onViewPrice} type="primary">
          💰 Мій прайс
        </Button>
      </div>
    </div>
  );
}
