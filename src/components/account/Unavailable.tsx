import { Callout } from "@/components/ui/Callout";

export function MemberAreaUnavailable() {
  return (
    <Callout type="info" title="Espace membre bientôt disponible">
      <p>
        Les comptes ne sont pas encore activés sur ce site. Vos outils et votre progression du
        parcours fonctionnent déjà sans compte, dans ce navigateur.
      </p>
    </Callout>
  );
}
