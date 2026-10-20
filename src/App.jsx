import { useCallback, useEffect, useState } from "react";
import Hero from "./Hero.jsx";
import Cars from "./Cars.jsx";
import About from "./About.jsx";
import Contact, { UNDECIDED } from "./Contact.jsx";

const SECTION_IDS = ["accueil", "voitures", "a-propos", "contact"];

export default function App() {
  const [activeSection, setActiveSection] = useState("accueil");
  const [selectedCar, setSelectedCar] = useState(UNDECIDED);

  // Track which section sits in the middle of the viewport.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    SECTION_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const handleReserve = useCallback((carName) => {
    setSelectedCar(carName);
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
  }, []);

  return (
    <>
      <Hero activeSection={activeSection} />
      <main>
        <Cars onReserve={handleReserve} />
        <About />
        <Contact car={selectedCar} onCarChange={setSelectedCar} />
      </main>
      <footer className="vl-footer">© 2026 Velora — Tous droits réservés</footer>
    </>
  );
}
