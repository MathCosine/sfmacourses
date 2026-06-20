"use client";

import { useState, useTransition } from "react";
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
    });
  }

  return (
    <div className="mt-12 mb-4 flex items-center justify-between gap-4">
      <h2
        id={id}
        className="scroll-mt-24 text-2xl font-extrabold tracking-[-0.02em] text-tprimary"
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
