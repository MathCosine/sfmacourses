import { LoadingShell } from "@/components/Skeletons";

export default function Loading() {
  return (
    <LoadingShell>
      <div className="mx-auto max-w-[900px] px-6 py-10 sm:px-10">
        <div className="skeleton mb-2 h-10 w-72" />
        <div className="skeleton mb-8 h-4 w-96" />
        <div className="skeleton mb-8 h-24 w-full rounded-2xl" />
        <div className="grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="skeleton h-44 rounded-2xl" />
          ))}
        </div>
      </div>
    </LoadingShell>
  );
}
