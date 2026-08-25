import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import islLogo from "../assets/ISLOGO.png";
import uprsaLogo from "../assets/uprsa.png";

export default function Navbar() {
  const navigate = useNavigate();

  return (
    <nav className="main-navbar">
      <div className="navbar-inner">
        <div className="logo-group" onClick={() => navigate("/")}>
          <img src={logo} alt="Skating logo" className="logo-img" />
          <img src={islLogo} alt="ISL logo" className="logo-img" />
          <img src={uprsaLogo} alt="UPRSA logo" className="logo-img" />
        </div>

        <div className="nav-actions">
          <button className="admin-nav-button" onClick={() => navigate("/admin")}>Admin Login</button>
        </div>
      </div>
    </nav>
  );
}
