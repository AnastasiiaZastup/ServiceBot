// src/App.jsx
import React, { useState } from "react";
import Register from "./pages/Register.jsx";
import SelectCategory from "./pages/SelectCategory.jsx";
import Services from "./pages/Services.jsx";
import SelectMaster from "./pages/SelectMaster.jsx";
import SelectTime from "./pages/SelectTime.jsx";
import MyAppointments from "./pages/MyAppointments.jsx";

export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState("register");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedMaster, setSelectedMaster] = useState(null);

  const handleRegister = (registeredUser) => {
    setUser(registeredUser);
    setView("category");
  };

  const handleSelectCategory = (category) => {
    setSelectedCategory(category);
    setView("services");
  };

  const handleSelectService = (service) => {
    setSelectedService(service);
    setView("selectMaster");
  };

  const handleSelectMaster = (master) => {
    setSelectedMaster(master);
    setView("selectTime");
  };

  return (
    <div style={{ padding: 16 }}>
      {/* 1. Реєстрація в Telegram */}
      {view === "register" && <Register onRegister={handleRegister} />}

      {/* 2. Вибір категорії послуги */}
      {view === "category" && user && (
        <SelectCategory
          onSelectCategory={handleSelectCategory}
          onViewAppointments={() => setView("myAppointments")}
        />
      )}

      {/* 3. Список послуг у вибраній категорії */}
      {view === "services" && selectedCategory && (
        <Services
          category={selectedCategory}
          onSelectService={handleSelectService}
        />
      )}

      {/* 4. Вибір майстра */}
      {view === "selectMaster" && selectedService && (
        <SelectMaster
          service={selectedService}
          onBack={() => setView("services")}
          onSelectMaster={handleSelectMaster}
        />
      )}

      {/* 5. Вибір дати та часу */}
      {view === "selectTime" && selectedMaster && (
        <SelectTime
          user={user}
          service={selectedService}
          master={selectedMaster}
          onBack={() => setView("selectMaster")}
          onGoToAppointments={() => setView("myAppointments")}
        />
      )}

      {/* 6. Мої записи */}
      {view === "myAppointments" && user && (
        <MyAppointments user={user} onBack={() => setView("category")} />
      )}
    </div>
  );
}
