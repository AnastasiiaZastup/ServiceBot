import React, { useState, useEffect } from "react";
import Register from "./pages/Register.jsx";
import Services from "./pages/Services.jsx";
import SelectMaster from "./pages/SelectMaster.jsx";

function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState("register"); // "register" | "services" | "selectMaster"
  const [telegramUser, setTelegramUser] = useState(null);
  const [selectedService, setSelectedService] = useState(null);

  useEffect(() => {
    const tg = window.Telegram.WebApp;
    tg.expand();
    setTelegramUser(tg.initDataUnsafe?.user || null);
  }, []);

  const handleRegister = async () => {
    try {
      const res = await fetch(
        "https://service-bot-backend.onrender.com/user/register",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            telegram_id: telegramUser.id,
            name: telegramUser.first_name,
            username: telegramUser.username,
            phone: null,
          }),
        }
      );

      const data = await res.json();
      setUser(data.user);
      setView("services");
    } catch (err) {
      console.error("Помилка реєстрації:", err);
      alert("Не вдалося зареєструватися.");
    }
  };

  if (!telegramUser) return <p>Завантаження Telegram-користувача...</p>;

  return (
    <>
      {view === "register" && (
        <div style={{ padding: "16px" }}>
          <h1>Привіт, {telegramUser.first_name}! 👋</h1>
          <p>Щоб продовжити, зареєструйся:</p>
          <button
            onClick={handleRegister}
            style={{
              padding: "10px 20px",
              fontSize: "16px",
              backgroundColor: "#2b82f6",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            Зареєструватися
          </button>
        </div>
      )}

      {view === "services" && user && (
        <Services
          user={user}
          onSelectService={(service) => {
            setSelectedService(service);
            setView("selectMaster");
          }}
        />
      )}

      {view === "selectMaster" && selectedService && (
        <SelectMaster
          user={user}
          service={selectedService}
          onBack={() => setView("services")}
        />
      )}
    </>
  );
}

export default App;
