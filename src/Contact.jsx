import { useState } from "react";
import { CARS } from "./Cars.jsx";

export const UNDECIDED = "Je ne sais pas encore";

const EMPTY_FORM = {
  name: "",
  email: "",
  phone: "",
  start: "",
  end: "",
  message: "",
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const today = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
};

function validate(form) {
  const errors = {};
  if (!form.name.trim()) errors.name = "Veuillez indiquer votre nom";
  if (!form.email.trim()) errors.email = "Veuillez indiquer votre adresse e-mail";
  else if (!EMAIL_RE.test(form.email.trim())) errors.email = "Adresse e-mail invalide";
  if (form.phone.trim() && !/^[+\d][\d\s.()-]{5,}$/.test(form.phone.trim())) {
    errors.phone = "Numéro de téléphone invalide";
  }
  if (!form.start) errors.start = "Veuillez choisir une date de début";
  if (!form.end) errors.end = "Veuillez choisir une date de fin";
  else if (form.start && form.end <= form.start) {
    errors.end = "La date de fin doit être après la date de début";
  }
  return errors;
}

export default function Contact({ car, onCarChange }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);

  const update = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    if (errors[field]) setErrors((errs) => ({ ...errs, [field]: undefined }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length === 0) setSent(true);
  };

  const reset = () => {
    setForm(EMPTY_FORM);
    setErrors({});
    onCarChange(UNDECIDED);
    setSent(false);
  };

  const field = (name, label, input, optional = false) => (
    <div className={`vl-field${errors[name] ? " has-error" : ""}`}>
      <label htmlFor={`vl-${name}`}>
        {label} {optional && <em>(optionnel)</em>}
      </label>
      {input}
      {errors[name] && (
        <p className="vl-error" id={`vl-${name}-error`} role="alert">
          {errors[name]}
        </p>
      )}
    </div>
  );

  const inputProps = (name) => ({
    id: `vl-${name}`,
    name,
    value: form[name],
    onChange: update(name),
    "aria-invalid": errors[name] ? "true" : undefined,
    "aria-describedby": errors[name] ? `vl-${name}-error` : undefined,
  });

  return (
    <section className="vl-section" id="contact">
      <div className="vl-container vl-contact-grid">
        <div>
          <span className="vl-eyebrow">Contact</span>
          <h2 className="vl-title">Réservez votre voiture</h2>
          <p className="vl-lead">
            Remplissez le formulaire, nous vous répondons sous 24 h.
          </p>

          <ul className="vl-contact-list">
            <li>
              <span>Adresse</span>
              <a
                href="https://www.google.com/maps/search/?api=1&query=12+avenue+Montaigne+75008+Paris"
                target="_blank"
                rel="noreferrer"
              >
                12 avenue Montaigne, 75008 Paris
              </a>
            </li>
            <li>
              <span>Téléphone</span>
              <a href="tel:+33123456789">+33 1 23 45 67 89</a>
            </li>
            <li>
              <span>E-mail</span>
              <a href="mailto:contact@velora.fr">contact@velora.fr</a>
            </li>
            <li>
              <span>Horaires</span>
              <p>Lundi – Samedi, 9h – 19h</p>
            </li>
          </ul>
        </div>

        {sent ? (
          <div className="vl-card vl-success" role="status">
            <h3>Merci !</h3>
            <p>
              Votre demande a bien été envoyée. Nous vous recontactons sous
              24 h.
            </p>
            <button type="button" className="vl-btn" onClick={reset}>
              Nouvelle demande
            </button>
          </div>
        ) : (
          <form
            className="vl-card vl-form"
            onSubmit={handleSubmit}
            noValidate
            aria-label="Formulaire de demande de réservation"
          >
            {field(
              "name",
              "Nom complet",
              <input type="text" autoComplete="name" placeholder="Jean Dupont" {...inputProps("name")} />
            )}
            <div className="vl-form-row">
              {field(
                "email",
                "E-mail",
                <input type="email" autoComplete="email" placeholder="jean.dupont@exemple.fr" {...inputProps("email")} />
              )}
              {field(
                "phone",
                "Téléphone",
                <input type="tel" autoComplete="tel" placeholder="06 12 34 56 78" {...inputProps("phone")} />,
                true
              )}
            </div>
            <div className="vl-field">
              <label htmlFor="vl-car">Voiture souhaitée</label>
              <select
                id="vl-car"
                name="car"
                value={car}
                onChange={(e) => onCarChange(e.target.value)}
              >
                {CARS.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
                <option value={UNDECIDED}>{UNDECIDED}</option>
              </select>
            </div>
            <div className="vl-form-row">
              {field(
                "start",
                "Date de début",
                <input type="date" min={today()} {...inputProps("start")} />
              )}
              {field(
                "end",
                "Date de fin",
                <input type="date" min={form.start || today()} {...inputProps("end")} />
              )}
            </div>
            {field(
              "message",
              "Message",
              <textarea rows={4} placeholder="Précisez vos besoins : lieu de livraison, horaires…" {...inputProps("message")} />,
              true
            )}
            <button type="submit" className="vl-btn">
              Envoyer la demande <span>→</span>
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
