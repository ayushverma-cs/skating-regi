import Navbar from "../components/Navbar";
import EventDetails from "../components/EventDetails";
import InfoBanner from "../components/InfoBanner";
import upperBanner from "../assets/UPPER_BANNER.jpg";
import mainBanner from "../assets/MAINBANNER.png";
import { Link } from "react-router-dom";
import { CalendarDays, MessageCircle } from "lucide-react";

const WHATSAPP_NUMBER = "917409073201";

export default function Home() { return <><Navbar /><main className="home-banners" id="home"><img className="upper-banner" src={upperBanner} alt="Roller Sport Association Mathura" /><img className="main-banner" src={mainBanner} alt="1st Agra Regional Skating Championship" /></main><section className="championship-intro" aria-label="Championship registration"><div className="intro-copy"><span className="intro-kicker">REGISTRATIONS ARE NOW OPEN</span><h1>Roll into your next victory.</h1><p>Join the 1st Agra Regional Skating Championship and compete for the podium.</p></div><div className="intro-actions"><Link className="intro-register" to="/registration">Register for ₹500 <span aria-hidden="true">→</span></Link><span className="intro-deadline">Last date: 3 September 2026</span></div><div className="intro-highlights"><div><strong>13</strong><span>September 2026</span></div><div><strong>4</strong><span>Skating disciplines</span></div><div><strong>₹500</strong><span>Per participant</span></div></div></section><section className="home-quick-actions" aria-label="Contact actions"><div className="quick-event-date"><CalendarDays size={22} /><span><b>13 September 2026</b><small>Championship Day</small></span></div><a className="quick-action whatsapp-action" href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noreferrer"><MessageCircle size={19} /> WhatsApp Us</a></section><EventDetails /><InfoBanner /></>; }
