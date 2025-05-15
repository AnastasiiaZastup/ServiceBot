import React, { useState, useEffect } from "react";
import Register from "./pages/Register.jsx";
import Services from "./pages/Services.jsx";
import SelectMaster from "./pages/SelectMaster.jsx";

function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState("register"); // "register" | "services" | "selectMaster"
  const [selectedService, setSelectedService] = useState(null);

  useEffect(() => {
    const tg = window.Telegram.WebApp;
    tg.expand();

    const tgUser = tg.initDataUnsafe?.user;
    if (!tgUser) {
      alert("Не вдалося отримати дані Telegram користувача.");
      return;
    }

    const registerUser = async () => {
      try {
        const res = await fetch(
          "https://service-bot-backend.onrender.com/user/register",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              telegram_id: tgUser.id,
              name: tgUser.first_name,
              username: tgUser.username,
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

    registerUser();
  }, []);

  // Поки користувач не завантажився
  if (!user) return <p>Завантаження...</p>;

  return (
    <>
      {view === "services" && (
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
          // Можеш додати onSelectMaster={() => setView("booking")} потім
        />
      )}
    </>
  );
}

export default App;
