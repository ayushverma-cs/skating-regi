import Navbar from "../components/Navbar";
import Fee from "../components/Fee";
import EventDetails from "../components/EventDetails";
import InfoBanner from "../components/InfoBanner";
import upperBanner from "../assets/UPPER_BANNER.jpg";
import mainBanner from "../assets/MAINBANNER.jpg";

export default function Home() {
  return (
    <>
      <Navbar />

      <main className="home-banners" id="home">
        <img
          className="upper-banner"
          src={upperBanner}
          alt="1st Agra Regional Skating Championship event information"
        />
        <img
          className="main-banner"
          src={mainBanner}
          alt="1st Agra Regional Skating Championship"
        />
      </main>

      <Fee />

      <EventDetails />

      <InfoBanner />
    </>
  );
}
