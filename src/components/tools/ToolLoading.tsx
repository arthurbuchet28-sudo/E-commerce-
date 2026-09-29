/** Placeholder while a tool reads its initial values from the URL (client-side). */
export function ToolLoading() {
  return (
    <p
      className="rounded-ui border border-dashed border-border bg-sheet p-5 text-muted"
      role="status"
    >
      Chargement de l’outil…
    </p>
  );
}
