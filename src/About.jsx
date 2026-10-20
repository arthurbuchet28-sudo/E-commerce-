import SafeImage from "./SafeImage.jsx";

const STATS = [
  { value: "50+", label: "Voitures de prestige" },
  { value: "2 000+", label: "Clients satisfaits" },
  { value: "24h/24", label: "Assistance dédiée" },
];

const FEATURES = [
  {
    title: "Livraison à domicile",
    text: "Nous livrons votre voiture à l'adresse de votre choix.",
  },
  {
    title: "Assurance tous risques",
    text: "Roulez l'esprit tranquille, vous êtes couvert.",
  },
  {
    title: "Réservation flexible",
    text: "Modification ou annulation gratuite jusqu'à 48 h avant.",
  },
];

const ABOUT_IMAGE =
  "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=1200&q=80&auto=format&fit=crop";

export default function About() {
  return (
    <section className="vl-section" id="a-propos">
      <div className="vl-container">
        <div className="vl-about-grid">
          <div className="vl-about-text">
            <span className="vl-eyebrow">À propos</span>
            <h2 className="vl-title">Velora, l'art de la location d'exception</h2>
            <p>
              Fondée à Paris, Velora met à votre disposition une flotte de
              voitures de prestige soigneusement sélectionnées, pour un
              week-end, un événement ou un voyage d'affaires.
            </p>
            <p>
              Notre engagement : un service personnalisé, des véhicules
              impeccables et des prix transparents, sans frais cachés.
            </p>

            <div className="vl-stats">
              {STATS.map((stat) => (
                <div className="vl-stat" key={stat.label}>
                  <strong>{stat.value}</strong>
                  <span>{stat.label}</span>
                </div>
              ))}
            </div>
          </div>

          <SafeImage
            className="vl-about-media"
            src={ABOUT_IMAGE}
            alt="Voiture de luxe noire garée sur un port, devant des yachts"
            fallbackLabel="Velora"
          />
        </div>

        <div className="vl-features">
          {FEATURES.map((feature) => (
            <div className="vl-card vl-feature" key={feature.title}>
              <h3>{feature.title}</h3>
              <p>{feature.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
