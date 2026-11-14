export function AppLoading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Cargando contenido">
      <div className="space-y-2">
        <div className="h-4 w-28 animate-pulse rounded bg-muted" />
        <div className="h-8 w-72 animate-pulse rounded bg-muted" />
        <div className="h-4 w-96 max-w-full animate-pulse rounded bg-muted" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-28 animate-pulse rounded-2xl border bg-muted/40" />
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="h-72 animate-pulse rounded-2xl border bg-muted/40" />
        <div className="h-72 animate-pulse rounded-2xl border bg-muted/40" />
      </div>
    </div>
  );
}
