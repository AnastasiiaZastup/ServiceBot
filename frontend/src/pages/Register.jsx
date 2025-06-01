import React, { useEffect, useState } from "react";

export default function Register({ onRegister }) {
  const [telegramUser, setTelegramUser] = useState(null);

  useEffect(() => {
    const tg = window.Telegram.WebApp;
    tg.expand();
    setTelegramUser(tg.initDataUnsafe?.user);
  }, []);

  const registerUser = async () => {
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

      // Покажемо id в alert:
      alert(`Зареєстровано з ID: ${data.user?.id}`);

      onRegister(data.user); // обовʼязково передаємо user далі
    } catch {
      alert("Помилка реєстрації");
    }
  };

  return (
    <div>
      <h1>Привіт 👋</h1>
      <button onClick={registerUser}>Зареєструватися</button>
    </div>
  );
}
