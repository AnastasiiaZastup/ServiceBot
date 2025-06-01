import React, { useState, useEffect } from "react";
import SelectCategory from "./pages/SelectCategory.jsx";
import Services from "./pages/Services.jsx";
import SelectMaster from "./pages/SelectMaster.jsx";
import SelectTime from "./pages/SelectTime.jsx";
import MyAppointments from "./pages/MyAppointments.jsx";
import MyAppointmentsMaster from "./pages/MyAppointmentsMaster.jsx";
import MasterSetup from "./pages/MasterSetup.jsx";

function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState("register");
  const [telegramUser, setTelegramUser] = useState(null);

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedMaster, setSelectedMaster] = useState(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    const tg = window.Telegram.WebApp;
    tg.expand();
    const userFromTelegram = tg.initDataUnsafe?.user;
    setTelegramUser(userFromTelegram);

    if (userFromTelegram) {
      const isMaster = userFromTelegram.username === "zastup_anastasia";

      if (isMaster) {
        fetch("https://service-bot-backend.onrender.com/user/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            telegram_id: userFromTelegram.id,
            name: userFromTelegram.first_name,
            username: userFromTelegram.username,
            phone: null,
            role: "master",
          }),
        })
          .then((res) => res.json())
          .then((data) => {
            setUser(data.user);
            setView("masterSetup");
          });
      } else {
        setView("register");
      }
    }
  }, []);

  const handleClientRegister = async () => {
    try {
      const res = await fetch(
        "https://service-bot-backend.onrender.com/user/register",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            telegram_id: telegramUser.id,
            name,
            username: telegramUser.username,
            phone,
            role: "client",
          }),
        }
      );

      const data = await res.json();
      setUser(data.user);
      setView("category");
    } catch (err) {
      console.error("❌ Помилка реєстрації:", err);
      alert("Не вдалося зареєструватися.");
    }
  };

  if (!telegramUser) return <p>Завантаження Telegram-користувача...</p>;

  return (
    <>
      {view === "register" && (
        <div style={{ padding: "16px" }}>
          <h1>Привіт, {telegramUser.first_name}! 👋</h1>
          <p>Будь ласка, зареєструйтесь як клієнт:</p>

          <input
            type="text"
            placeholder="Ваше ім’я"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ padding: "8px", marginBottom: "8px", width: "100%" }}
          />
          <input
            type="tel"
            placeholder="Номер телефону"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            style={{ padding: "8px", marginBottom: "12px", width: "100%" }}
          />

          <button
            onClick={handleClientRegister}
            style={{
              padding: "10px 20px",
              fontSize: "16px",
              backgroundColor: "#2b82f6",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              width: "100%",
            }}
          >
            Зареєструватися
          </button>
        </div>
      )}

      {view === "category" && (
        <div style={{ padding: 16 }}>
          <SelectCategory
            onSelectCategory={(category) => {
              setSelectedCategory(category);
              setView("services");
            }}
            onViewAppointments={() => setView("myAppointments")}
          />
        </div>
      )}

      {view === "services" && user && selectedCategory && (
        <div style={{ padding: "16px" }}>
          <button
            onClick={() => setView("category")}
            style={{
              marginBottom: "16px",
              padding: "8px 16px",
              backgroundColor: "#2b2b2b",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            ⬅ Назад до категорій
          </button>

          <Services
            user={user}
            category={selectedCategory}
            onSelectService={(service) => {
              setSelectedService(service);
              setView("selectMaster");
            }}
          />

          <button
            onClick={() => setView("myAppointments")}
            style={{
              marginTop: "16px",
              padding: "10px 20px",
              backgroundColor: "#3b82f6",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            📅 Мої записи
          </button>
        </div>
      )}

      {view === "selectMaster" && selectedService && (
        <SelectMaster
          user={user}
          service={selectedService}
          onBack={() => setView("services")}
          onSelectMaster={(master) => {
            setSelectedMaster(master);
            setView("selectTime");
          }}
        />
      )}

      {view === "selectTime" && selectedService && selectedMaster && (
        <SelectTime
          user={user}
          service={selectedService}
          master={selectedMaster}
          onBack={() => setView("selectMaster")}
          onGoToAppointments={() => setView("myAppointments")}
        />
      )}

      {view === "masterSetup" && user && (
        <MasterSetup
          user={user}
          onBack={() => setView("register")}
          onSave={() => setView("masterAppointments")}
        />
      )}

      {view === "myAppointments" && user && (
        <MyAppointments user={user} onBack={() => setView("category")} />
      )}

      {view === "masterAppointments" && user && (
        <MyAppointmentsMaster user={user} onBack={() => setView("register")} />
      )}
    </>
  );
}

export default App;
