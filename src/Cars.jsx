import SafeImage from "./SafeImage.jsx";

const IMG_PARAMS = "?w=1200&q=80&auto=format&fit=crop";
const img = (id) => `https://images.unsplash.com/photo-${id}${IMG_PARAMS}`;

export const CARS = [
  {
    name: "Porsche 911 Carrera",
    category: "Sportive",
    specs: "385 ch · Automatique · 4 places",
    price: 450,
    image: img("1594502184342-2e12f877aa73"),
    alt: "Porsche 911 grise garée sur un parking",
  },
  {
    name: "Lamborghini Huracán",
    category: "Sportive",
    specs: "640 ch · Automatique · 2 places",
    price: 1200,
    image: img("1612825173281-9a193378527e"),
    alt: "Lamborghini Huracán orange",
  },
  {
    name: "Ferrari Roma",
    category: "Coupé",
    specs: "620 ch · Automatique · 4 places",
    price: 990,
    image: img("1614200187524-dc4b892acf16"),
    alt: "Ferrari rouge devant une porte de garage",
  },
  {
    name: "Mercedes-AMG G 63",
    category: "SUV",
    specs: "585 ch · Automatique · 5 places",
    price: 750,
    image: img("1520031441872-265e4ff70366"),
    alt: "Mercedes-AMG Classe G grise dans une rue pavée",
  },
  {
    name: "Range Rover Sport",
    category: "SUV",
    specs: "400 ch · Automatique · 5 places",
    price: 520,
    image: img("1563720223185-11003d516935"),
    alt: "Range Rover Sport noir dans un garage",
  },
  {
    name: "Bentley Continental GTC",
    category: "Cabriolet",
    specs: "550 ch · Automatique · 4 places",
    price: 890,
    image: img("1507136566006-cfc505b114fc"),
    alt: "Coupé de luxe rouge garé devant un bâtiment",
  },
];

const formatPrice = (value) => `${new Intl.NumberFormat("fr-FR").format(value)} €`;

export default function Cars({ onReserve }) {
  return (
    <section className="vl-section" id="voitures">
      <div className="vl-container">
        <span className="vl-eyebrow">Notre flotte</span>
        <h2 className="vl-title">Nos voitures d'exception</h2>
        <p className="vl-lead">
          Une sélection de modèles prestigieux, entretenus avec soin et prêts à
          prendre la route.
        </p>

        <div className="vl-cars-grid">
          {CARS.map((car) => (
            <article className="vl-card vl-car" key={car.name}>
              <SafeImage src={car.image} alt={car.alt} fallbackLabel={car.name} />
              <div className="vl-car-body">
                <span className="vl-tag">{car.category}</span>
                <h3>{car.name}</h3>
                <p className="vl-specs">{car.specs}</p>
                <div className="vl-car-footer">
                  <p className="vl-price">
                    {formatPrice(car.price)} <small>/ jour</small>
                  </p>
                  <button
                    type="button"
                    className="vl-btn"
                    onClick={() => onReserve(car.name)}
                    aria-label={`Réserver la ${car.name}`}
                  >
                    Réserver <span>→</span>
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
