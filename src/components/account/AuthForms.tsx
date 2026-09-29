"use client";

import Link from "next/link";
import { useActionState } from "react";

import {
  deleteAccount,
  requestPasswordReset,
  sendMagicLink,
  signIn,
  signUp,
  updatePassword,
  updateProfile,
  type FormState,
} from "@/app/compte/actions";
import { Button } from "@/components/ui/Button";
import { Checkbox, TextField } from "@/components/ui/Field";

import { FormMessage } from "./FormMessage";
import { PasswordField } from "./PasswordField";

const idle: FormState = { status: "idle" };
const PASSWORD_HINT = "Au moins 10 caractères, dont une lettre et un chiffre.";

export function SignInForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState(signIn, idle);
  return (
    <form action={action} className="flex flex-col gap-5" noValidate>
      <FormMessage state={state} />
      <input type="hidden" name="next" value={next ?? "/compte"} />
      <TextField
        id="connexion-email"
        name="email"
        defaultValue={state.values?.email}
        label="Adresse e-mail"
        type="email"
        autoComplete="email"
        required
        error={state.fieldErrors?.email}
      />
      <PasswordField
        id="connexion-mdp"
        name="password"
        label="Mot de passe"
        autoComplete="current-password"
        error={state.fieldErrors?.password}
      />
      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" disabled={pending}>
          {pending ? "Connexion…" : "Me connecter"}
        </Button>
        <Link href="/compte/mot-de-passe" className="link text-small">
          Mot de passe oublié ?
        </Link>
      </div>
    </form>
  );
}

export function MagicLinkForm() {
  const [state, action, pending] = useActionState(sendMagicLink, idle);
  return (
    <form action={action} className="flex flex-col gap-5" noValidate>
      <FormMessage state={state} />
      <TextField
        id="lien-email"
        name="email"
        defaultValue={state.values?.email}
        label="Adresse e-mail"
        type="email"
        autoComplete="email"
        required
        error={state.fieldErrors?.email}
      />
      <div>
        <Button type="submit" variant="secondary" disabled={pending}>
          {pending ? "Envoi…" : "Recevoir un lien de connexion"}
        </Button>
      </div>
    </form>
  );
}

export function SignUpForm() {
  const [state, action, pending] = useActionState(signUp, idle);
  if (state.status === "success") return <FormMessage state={state} />;
  return (
    <form action={action} className="flex flex-col gap-5" noValidate>
      <FormMessage state={state} />
      <TextField
        id="inscription-nom"
        name="displayName"
        defaultValue={state.values?.displayName}
        label="Prénom ou pseudonyme"
        autoComplete="given-name"
        hint="Facultatif. Il apparaît sur votre tableau de bord et vos attestations de suivi."
        error={state.fieldErrors?.displayName}
      />
      <TextField
        id="inscription-email"
        name="email"
        defaultValue={state.values?.email}
        label="Adresse e-mail"
        type="email"
        autoComplete="email"
        required
        error={state.fieldErrors?.email}
      />
      <PasswordField
        id="inscription-mdp"
        name="password"
        label="Mot de passe"
        autoComplete="new-password"
        hint={PASSWORD_HINT}
        error={state.fieldErrors?.password}
      />
      <Checkbox
        id="inscription-cgu"
        name="cgu"
        defaultChecked={state.values?.cgu === "on"}
        label={
          <>
            J’accepte les{" "}
            <Link href="/cgu" className="link">
              conditions générales d’utilisation
            </Link>{" "}
            et j’ai lu la{" "}
            <Link href="/confidentialite" className="link">
              politique de confidentialité
            </Link>
            .
          </>
        }
        error={state.fieldErrors?.cgu}
      />
      <div>
        <Button type="submit" disabled={pending}>
          {pending ? "Création…" : "Créer mon compte"}
        </Button>
      </div>
    </form>
  );
}

export function ResetRequestForm() {
  const [state, action, pending] = useActionState(requestPasswordReset, idle);
  return (
    <form action={action} className="flex flex-col gap-5" noValidate>
      <FormMessage state={state} />
      <TextField
        id="reset-email"
        name="email"
        defaultValue={state.values?.email}
        label="Adresse e-mail de votre compte"
        type="email"
        autoComplete="email"
        required
        error={state.fieldErrors?.email}
      />
      <div>
        <Button type="submit" disabled={pending}>
          {pending ? "Envoi…" : "Recevoir le lien de réinitialisation"}
        </Button>
      </div>
    </form>
  );
}

export function NewPasswordForm() {
  const [state, action, pending] = useActionState(updatePassword, idle);
  return (
    <form action={action} className="flex flex-col gap-5" noValidate>
      <FormMessage state={state} />
      <PasswordField
        id="nouveau-mdp"
        name="password"
        label="Nouveau mot de passe"
        autoComplete="new-password"
        hint={PASSWORD_HINT}
        error={state.fieldErrors?.password}
      />
      <PasswordField
        id="nouveau-mdp-confirmation"
        name="confirm"
        label="Confirmez le nouveau mot de passe"
        autoComplete="new-password"
        error={state.fieldErrors?.confirm}
      />
      <div>
        <Button type="submit" disabled={pending}>
          {pending ? "Enregistrement…" : "Enregistrer mon nouveau mot de passe"}
        </Button>
      </div>
    </form>
  );
}

export function ProfileForm({ displayName }: { displayName: string }) {
  const [state, action, pending] = useActionState(updateProfile, idle);
  return (
    <form action={action} className="flex flex-col gap-4" noValidate>
      <FormMessage state={state} />
      <TextField
        id="profil-nom"
        name="displayName"
        label="Prénom ou pseudonyme"
        defaultValue={displayName}
        autoComplete="given-name"
        error={state.fieldErrors?.displayName}
      />
      <div>
        <Button type="submit" variant="secondary" disabled={pending}>
          Enregistrer mon nom
        </Button>
      </div>
    </form>
  );
}

export function DeleteAccountForm() {
  const [state, action, pending] = useActionState(deleteAccount, idle);
  return (
    <form action={action} className="flex flex-col gap-4" noValidate>
      <FormMessage state={state} />
      <TextField
        id="suppression-confirmation"
        name="confirmation"
        label="Pour confirmer, saisissez SUPPRIMER"
        autoComplete="off"
        error={state.fieldErrors?.confirmation}
      />
      <div>
        <Button
          type="submit"
          disabled={pending}
          className="bg-danger text-on-ink hover:bg-danger/90"
        >
          {pending ? "Suppression…" : "Supprimer définitivement mon compte"}
        </Button>
      </div>
    </form>
  );
}
