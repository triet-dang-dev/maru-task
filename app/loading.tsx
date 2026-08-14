export default function LoadingPage() {
  return (
    <main
      aria-busy="true"
      aria-label="Loading page"
      className="min-h-[100dvh] bg-[var(--mui-palette-background-default)] text-[var(--mui-palette-text-primary)]"
    >
      <div className="hidden h-[100dvh] w-[280px] border-r border-[var(--mui-palette-divider)] bg-[var(--mui-palette-background-paper)] md:fixed md:block">
        <div className="h-[55px] border-b border-[var(--mui-palette-divider)] p-3">
          <div className="h-7 w-36 animate-pulse rounded bg-[var(--mui-palette-divider)]" />
        </div>
        <div className="grid gap-3 p-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <div className="h-9 animate-pulse rounded bg-[var(--mui-palette-action-hover)]" key={index} />
          ))}
        </div>
      </div>
      <div className="border-b border-[var(--mui-palette-primary-dark)] bg-[var(--mui-palette-primary-main)] md:ml-[280px]">
        <div className="h-[55px] p-3">
          <div className="h-7 w-44 animate-pulse rounded bg-[var(--mui-palette-primary-light)]" />
        </div>
      </div>
      <div className="md:ml-[280px]">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
          <div className="h-4 w-44 animate-pulse rounded bg-[var(--mui-palette-primary-light)]" />
          <div className="space-y-4">
            <div className="h-12 w-full max-w-2xl animate-pulse rounded bg-[var(--mui-palette-divider)]" />
            <div className="h-4 w-full max-w-xl animate-pulse rounded bg-[var(--mui-palette-divider)]" />
            <div className="h-4 w-full max-w-lg animate-pulse rounded bg-[var(--mui-palette-divider)]" />
          </div>
          <div className="grid grid-cols-2 overflow-hidden rounded border border-[var(--mui-palette-divider)] bg-[var(--mui-palette-background-paper)] lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div className="h-32 animate-pulse border-[var(--mui-palette-divider)] bg-[var(--mui-palette-action-hover)] p-5" key={index} />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
