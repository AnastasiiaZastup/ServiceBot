// 🔧 ОНОВЛЕНИЙ App.jsx
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

  useEffect(() => {
    const tg = window.Telegram.WebApp;
    tg.expand();
    const userFromTelegram = tg.initDataUnsafe?.user;
    setTelegramUser(userFromTelegram);

    if (userFromTelegram) {
      fetch(
        `https://service-bot-backend.onrender.com/user/${userFromTelegram.id}`
      )
        .then((res) => res.json())
        .then((data) => {
          if (data.user) {
            setUser(data.user);
            setView(data.user.role === "master" ? "masterSetup" : "category");
          } else {
            setView("register");
          }
        });
    }
  }, []);

  const [formName, setFormName] = useState("");
  const [formPhone, setFormPhone] = useState("");

  const handleRegister = async () => {
    try {
      const res = await fetch(
        "https://service-bot-backend.onrender.com/user/register",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            telegram_id: telegramUser.id,
            name: formName,
            username: telegramUser.username,
            phone: formPhone,
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

  if (view === "register") {
    if (telegramUser.username === "zastup_anastasia") {
      return <p>Завантаження...</p>; // вже редіректиться через useEffect
    }
    return (
      <div style={{ padding: "16px" }}>
        <h1>Привіт, {telegramUser.first_name}! 👋</h1>
        <p>Будь ласка, зареєструйтесь як клієнт:</p>
        <input
          placeholder="Ваше ім'я"
          value={formName}
          onChange={(e) => setFormName(e.target.value)}
          style={{ display: "block", marginBottom: 8, width: "100%" }}
        />
        <input
          placeholder="Номер телефону"
          value={formPhone}
          onChange={(e) => setFormPhone(e.target.value)}
          style={{ display: "block", marginBottom: 12, width: "100%" }}
        />
        <button
          onClick={handleRegister}
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            backgroundColor: "#2b82f6",
            color: "white",
            border: "none",
            borderRadius: "8px",
          }}
        >
          Зареєструватися
        </button>
      </div>
    );
  }

  return (
    <>
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
        <div style={{ padding: 16 }}>
          <button onClick={() => setView("category")}>
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
          <button onClick={() => setView("myAppointments")}>
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
          onViewAppointments={() => setView("masterAppointments")}
        />
      )}

      {view === "myAppointments" && user && (
        <MyAppointments user={user} onBack={() => setView("category")} />
      )}

      {view === "masterAppointments" && user && (
        <MyAppointmentsMaster
          user={user}
          onBack={() => setView("masterSetup")}
        />
      )}
    </>
  );
}

export default App;
