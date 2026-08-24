import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

export default function Navbar() {
  const navigate = useNavigate();

  return (
    <nav className="main-navbar">
      <div className="navbar-inner">
        <div className="logo-group" onClick={() => navigate("/")}>
          <img src={logo} alt="Skating logo" className="logo-img" />
        </div>

        <ul className="nav-links">
          <li><a href="#home">Home</a></li>
          <li><a href="#about">About Us</a></li>
          <li><a href="#contact">Contact</a></li>
        </ul>

        <div className="nav-actions">
          <button className="button-primary" onClick={() => navigate("/registration")}>Register Now</button>
        </div>
      </div>
    </nav>
  );
}
