"use client";

import { useState, useTransition } from "react";
import type { LessonStatus } from "@/lib/types";
import { LESSON_STATUS_OPTIONS } from "@/lib/status";
import { setLessonStatus } from "@/app/learn/actions";
import { StatusControl } from "@/components/StatusControl";

export function LessonStatusControl({
  lessonId,
  initial,
  align = "right",
}: {
  lessonId: string;
  initial: LessonStatus;
  align?: "left" | "right";
}) {
  const [status, setStatus] = useState<LessonStatus>(initial);
  const [, startTransition] = useTransition();

  function change(next: string) {
    const prev = status;
    setStatus(next as LessonStatus);
    startTransition(async () => {
      const res = await setLessonStatus(lessonId, next as LessonStatus);
      if (!res.ok) setStatus(prev);
    });
  }

  return (
    <StatusControl
      value={status}
      options={LESSON_STATUS_OPTIONS}
      onChange={change}
      variant="pill"
      align={align}
    />
  );
}
