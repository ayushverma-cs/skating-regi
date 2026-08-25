import mainBanner from "../assets/MAINBANNER.jpg";

export default function Hero() {
  return (
    <section className="hero-banner">
      <img
        src={mainBanner}
        alt="1st Agra Regional Skating Championship"
        style={{ width: "100%", display: "block" }}
      />
    </section>
  );
}
