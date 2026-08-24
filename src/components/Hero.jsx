import banner from "../assets/banner.png";

export default function Hero() {
  return (
    <section
      style={{
        marginTop: "72px",
        background: "#fff",
      }}
    >
      <img
        src={banner}
        alt="banner"
        style={{
          width: "100%",
          display: "block",
          filter: "brightness(1.3)",
        }}
      />
    </section>
  );
}