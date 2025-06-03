import React, { useState, useEffect } from "react";

import SelectCategory from "./pages/SelectCategory.jsx";
import Services from "./pages/Services.jsx";
import SelectMaster from "./pages/SelectMaster.jsx";
import SelectTime from "./pages/SelectTime.jsx";
import MyAppointments from "./pages/MyAppointments.jsx";
import MyAppointmentsMaster from "./pages/MyAppointmentsMaster.jsx";
import MasterSetup from "./pages/MasterSetup.jsx";

import Button from "./components/Button.jsx";
import Loader from "./components/Loader.jsx";
import Card from "./components/Card";
import Input from "./components/Input";
import Label from "./components/Label";
import Toast from "./components/Toast.jsx";

function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState("register");
  const [telegramUser, setTelegramUser] = useState(null);

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedMaster, setSelectedMaster] = useState(null);
  const [toast, setToast] = useState(null); // { message: '', type: 'success' }

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  const hideToast = () => {
    setToast(null);
  };

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
      showToast("✅ Реєстрація успішна!", "success");
    } catch (err) {
      console.error("❌ Помилка реєстрації:", err);
      showToast("❌ Не вдалося зареєструватися.", "error");
    }
  };

  if (!telegramUser) return <Loader />;

  if (view === "register") {
    if (telegramUser.username === "zastup_anastasia") {
      return <p>Завантаження...</p>;
    }

    return (
      <div
        style={{
          padding: 16,
          maxWidth: 400,
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <h1>Привіт, {telegramUser.first_name}! 👋</h1>
        <p>Будь ласка, зареєструйтесь як клієнт:</p>

        <Card>
          <Label htmlFor="name">Ваше ім’я</Label>
          <Input
            id="name"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            placeholder="Ім’я"
          />

          <Label htmlFor="phone" style={{ marginTop: "12px" }}>
            Номер телефону
          </Label>
          <Input
            id="phone"
            value={formPhone}
            onChange={(e) => setFormPhone(e.target.value)}
            placeholder="+380..."
          />
        </Card>

        <Button onClick={handleRegister} type="success">
          Зареєструватися
        </Button>
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
          <Button onClick={() => setView("category")}>
            ⬅️ Назад до категорій
          </Button>
          <Services
            user={user}
            category={selectedCategory}
            onSelectService={(service) => {
              setSelectedService(service);
              setView("selectMaster");
            }}
          />
          <Button onClick={() => setView("myAppointments")}>
            📅 Мої записи
          </Button>
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
          showToast={showToast}
        />
      )}

      {view === "masterSetup" && user && (
        <MasterSetup
          user={user}
          onBack={() => setView("register")}
          onSave={() => setView("masterAppointments")}
          onViewAppointments={() => setView("masterAppointments")}
          showToast={showToast} // 🔥
        />
      )}

      {view === "myAppointments" && user && (
        <MyAppointments
          user={user}
          onBack={() => setView("category")}
          showToast={showToast} // ✅
        />
      )}

      {view === "masterAppointments" && user && (
        <MyAppointmentsMaster
          user={user}
          onBack={() => setView("masterSetup")}
          showToast={showToast} // ✅
        />
      )}

      {view === "masterPrice" && (
        <MasterPrice user={user} onBack={() => setView("masterPanel")} />
      )}

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={hideToast} />
      )}
    </>
  );
}

export default App;
