import { LoadingShell, LessonSkeleton } from "@/components/Skeletons";

export default function Loading() {
  return (
    <LoadingShell>
      <LessonSkeleton />
    </LoadingShell>
  );
}
