import Navbar from "../components/Navbar";
import Fee from "../components/Fee";
import EventDetails from "../components/EventDetails";
import InfoBanner from "../components/InfoBanner";
import banner from "../assets/banner.png";

export default function Home() {
  return (
    <>
      <Navbar />

      <main
  className="hero-banner"
  id="home"
  style={{ backgroundImage: `url(${banner})` }}
>
  <div className="hero-overlay" />

  <div className="hero-content"></div>
</main>

      <Fee />

      <EventDetails />

      <InfoBanner />
    </>
  );
}