// App.jsx
import React, { useState } from "react";
import Register from "./pages/Register.jsx";
import Services from "./pages/Services.jsx";

function App() {
  const [view, setView] = useState("register");
  const [user, setUser] = useState(null);

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
      {view === "services" && <Services user={user} />}
    </>
  );
}

export default App;
