import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Registration from "./pages/Registration";

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
      </Routes>
    </BrowserRouter>
  );
}

export default App;