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
  const [selectedRole, setSelectedRole] = useState("client");

  useEffect(() => {
    const tg = window.Telegram.WebApp;
    tg.expand();
    const userFromTelegram = tg.initDataUnsafe?.user || null;
    console.log("🟢 Telegram user:", userFromTelegram);
    setTelegramUser(userFromTelegram);
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
            role: selectedRole,
          }),
        }
      );

      const data = await res.json();
      console.log("🟢 Зареєстрований користувач:", data.user);
      setUser(data.user);
      if (data.user.role === "master") {
        setView("masterSetup");
      } else {
        setView("category");
      }
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
          <p>Вибери свою роль для тестування:</p>

          <div style={{ marginBottom: "12px" }}>
            <label>
              <input
                type="radio"
                value="client"
                checked={selectedRole === "client"}
                onChange={(e) => setSelectedRole(e.target.value)}
              />
              Я клієнт 👤
            </label>
            <br />
            <label>
              <input
                type="radio"
                value="master"
                checked={selectedRole === "master"}
                onChange={(e) => setSelectedRole(e.target.value)}
              />
              Я майстер 🧑‍🎨
            </label>
          </div>

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
            Зареєструватися як{" "}
            {selectedRole === "master" ? "майстер" : "клієнт"}
          </button>
        </div>
      )}

      {view === "category" && (
        <div style={{ padding: 16 }}>
          <SelectCategory
            onSelectCategory={(category) => {
              console.log("🟢 Обрано категорію:", category);
              setSelectedCategory(category);
              setView("services");
            }}
            onViewAppointments={() => setView("myAppointments")}
          />

          {user?.role === "client" && (
            <button
              onClick={async () => {
                try {
                  const res = await fetch(
                    "https://service-bot-backend.onrender.com/user/role",
                    {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        telegram_id: user.telegram_id,
                        new_role: "master",
                      }),
                    }
                  );

                  const data = await res.json();
                  if (res.ok) {
                    // 🆕 Отримуємо оновленого користувача з бекенду
                    const updated = await fetch(
                      `https://service-bot-backend.onrender.com/user/${user.telegram_id}`
                    );
                    const updatedData = await updated.json();

                    alert("🎉 Ви тепер майстер!");
                    setUser(updatedData.user);
                    setView("masterSetup");
                  } else {
                    alert("❌ Помилка: " + (data?.error || "Невідомо"));
                  }
                } catch (err) {
                  console.error("Помилка оновлення ролі:", err);
                  alert("Помилка при переході в режим майстра.");
                }
              }}
              style={{
                marginTop: 24,
                padding: "10px 16px",
                backgroundColor: "#f59e0b",
                color: "#fff",
                border: "none",
                borderRadius: 8,
              }}
            >
              🎨 Стати майстром
            </button>
          )}
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
            ⬅️Назад до категорій
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
            console.log("🟢 Обрано майстра:", master);
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
