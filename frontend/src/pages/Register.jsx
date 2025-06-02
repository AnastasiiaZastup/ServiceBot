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
            role: "master", // 🔧 важливо!
          }),
        }
      );

      const data = await res.json();

      // Виводимо повну відповідь:
      alert("Сервер повернув:\n" + JSON.stringify(data, null, 2));

      onRegister(data.user); // зберігаємо об'єкт з id
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
