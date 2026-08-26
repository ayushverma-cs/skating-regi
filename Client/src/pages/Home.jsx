import Navbar from "../components/Navbar";
import EventDetails from "../components/EventDetails";
import InfoBanner from "../components/InfoBanner";
import upperBanner from "../assets/UPPER_BANNER.jpg";
import mainBanner from "../assets/MAINBANNER.png";
import categoryImage from "../assets/category.png";
import { Link } from "react-router-dom";
import { CalendarDays, MessageCircle } from "lucide-react";

const WHATSAPP_NUMBER = "917409073201";
const WHATSAPP_GROUP_URL = "https://chat.whatsapp.com/Fspoi05B05aHRGgmdVqxkJ?mode=gi_t";
const ageGroups = ["4-6 Years (2021-2022)", "6-8 Years (2019-2020)", "8-10 Years (2017-2018)", "10-12 Years (2015-2016)", "12-15 Years (2012-2014)", "15-18 Years (2009-2011)", "AB - 18 Years (2008 and Below)"];

export default function Home() {
  return <><Navbar /><main className="home-banners" id="home"><img className="upper-banner" src={upperBanner} alt="Roller Sport Association Mathura" /><img className="main-banner" src={mainBanner} alt="1st Agra Regional Skating Championship" /></main><section className="championship-intro" aria-label="Championship registration"><div className="intro-copy"><span className="intro-kicker">REGISTRATIONS ARE NOW OPEN</span><h1>Roll into your next victory.</h1><p>Join the 1st Agra Regional Skating Championship and compete for the podium.</p></div><div className="intro-actions"><Link className="intro-register" to="/registration">Register <span aria-hidden="true">→</span></Link><span className="intro-deadline">Last date: 3 September 2026</span></div><div className="intro-highlights"><div><strong>6</strong><span>September 2026</span></div><div><strong>4</strong><span>Skating disciplines</span></div><div><strong>₹500</strong><span>Per participant</span></div></div></section><section className="home-quick-actions" aria-label="Contact actions"><div className="quick-event-date"><CalendarDays size={22} /><span><b>6 September 2026</b><small>Championship Day</small></span></div><a className="quick-action whatsapp-action" href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noreferrer"><MessageCircle size={19} /> WhatsApp Us</a><a className="quick-action whatsapp-action" href={WHATSAPP_GROUP_URL} target="_blank" rel="noreferrer"><MessageCircle size={19} /> Join WhatsApp Group</a></section><section className="home-category-section" aria-labelledby="category-heading"><div><span className="intro-kicker">CHOOSE YOUR CATEGORY</span><h2 id="category-heading">Skate categories & age groups</h2><p>Age is considered as on 31 December 2026.</p><div className="home-age-groups">{ageGroups.map((group) => <span key={group}>{group}</span>)}</div></div><img src={categoryImage} alt="Adjustable, quad, inline and toy inline skate categories" /></section><EventDetails /><InfoBanner /></>;
}
