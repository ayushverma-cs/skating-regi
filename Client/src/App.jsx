import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Registration from "./pages/Registration";
import Admin from "./pages/Admin";
import RegistrationConfirmation from "./pages/RegistrationConfirmation";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Home Page */}
        <Route path="/" element={<Home />} />

        {/* Registration Page */}
        <Route
          path="/registration"
          element={<Registration />}
        />
        <Route path="/admin" element={<Admin />} />
        <Route path="/registration-confirmation" element={<RegistrationConfirmation />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
