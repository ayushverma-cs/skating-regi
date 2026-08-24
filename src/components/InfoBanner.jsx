import infoBanner from "../assets/info-banner.png";

export default function InfoBanner(){

    return(

        <section className="info-section">

            <img
                src={infoBanner}
                className="info-image"
                alt="Info Banner"
            />

        </section>

    )

}