export function SidebarSkeleton() {
  return (
    <div className="flex h-full flex-col bg-sidebar p-4">
      <div className="skeleton mb-1 h-6 w-20" />
      <div className="skeleton mb-5 h-3 w-14" />
      <div className="mb-5 flex gap-1.5">
        <div className="skeleton h-7 w-14 rounded-full" />
        <div className="skeleton h-7 w-20 rounded-full" />
        <div className="skeleton h-7 w-12 rounded-full" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="skeleton h-4 w-40" />
            <div className="ml-5 space-y-1.5">
              <div className="skeleton h-3 w-32" />
              <div className="skeleton h-3 w-28" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function LessonSkeleton() {
  return (
    <div className="mx-auto max-w-[760px] px-6 py-8 sm:px-10">
      <div className="skeleton mb-6 h-4 w-40" />
      <div className="skeleton mb-3 h-3 w-56" />
      <div className="skeleton mb-4 h-12 w-3/4" />
      <div className="skeleton mb-8 h-3 w-32" />
      <div className="space-y-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="skeleton h-4"
            style={{ width: `${70 + ((i * 7) % 30)}%` }}
          />
        ))}
      </div>
      <div className="skeleton mt-8 h-24 w-full rounded-xl" />
      <div className="mt-4 space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="skeleton h-4"
            style={{ width: `${65 + ((i * 11) % 35)}%` }}
          />
        ))}
      </div>
    </div>
  );
}

export function LoadingShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[260px] border-r border-border lg:block">
        <SidebarSkeleton />
      </aside>
      <div className="min-w-0 flex-1 lg:pl-[260px]">{children}</div>
    </div>
  );
}
