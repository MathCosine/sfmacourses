"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { LessonStatus } from "@/lib/types";
import { LESSON_STATUS_OPTIONS } from "@/lib/status";
import { setSectionStatus } from "@/app/learn/actions";
import { StatusControl } from "@/components/StatusControl";

export function SectionBlock({
  id,
  title,
  lessonId,
  sectionIndex,
  initialStatus,
}: {
  id: string;
  title: string;
  lessonId: string;
  sectionIndex: number;
  initialStatus: LessonStatus;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<LessonStatus>(initialStatus);
  const [, startTransition] = useTransition();

  function change(next: string) {
    const prev = status;
    setStatus(next as LessonStatus);
    startTransition(async () => {
      const res = await setSectionStatus(
        lessonId,
        sectionIndex,
        next as LessonStatus,
      );
      if (!res.ok) setStatus(prev);
      else router.refresh();
    });
  }

  return (
    <div className="mt-10 mb-3 flex items-center justify-between gap-4 border-b border-border pb-2">
      <h2
        id={id}
        className="scroll-mt-24 font-serif text-2xl text-tprimary"
      >
        {title}
      </h2>
      <div className="shrink-0">
        <StatusControl
          value={status}
          options={LESSON_STATUS_OPTIONS}
          onChange={change}
          variant="pill"
          align="right"
        />
      </div>
    </div>
  );
}
