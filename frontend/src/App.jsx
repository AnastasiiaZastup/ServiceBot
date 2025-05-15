import React, { useState } from "react";
import Register from "./pages/Register.jsx";
import Services from "./pages/Services.jsx";
import SelectMaster from "./pages/SelectMaster.jsx";

function App() {
  const [, setUser] = useState(null);

  const [view, setView] = useState("register");
  const [selectedService, setSelectedService] = useState(null);

  return (
    <>
      {view === "register" && (
        <Register
          onRegister={(u) => {
            setUser(u);
            setView("services");
          }}
        />
      )}
      {view === "services" && (
        <Services
          onSelectService={(service) => {
            setSelectedService(service);
            setView("selectMaster");
          }}
        />
      )}
      {view === "selectMaster" && selectedService && (
        <SelectMaster service={selectedService} />
      )}
    </>
  );
}

export default App;
