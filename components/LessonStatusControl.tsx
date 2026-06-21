"use client";

import { useState, useTransition } from "react";
import type { LessonStatus } from "@/lib/types";
import { LESSON_STATUS_OPTIONS } from "@/lib/status";
import { setLessonStatus } from "@/app/learn/actions";
import { StatusControl } from "@/components/StatusControl";
import { useToast } from "@/components/Toast";

export function LessonStatusControl({
  lessonId,
  initial,
  align = "right",
  signedIn = true,
}: {
  lessonId: string;
  initial: LessonStatus;
  align?: "left" | "right";
  signedIn?: boolean;
}) {
  const [status, setStatus] = useState<LessonStatus>(initial);
  const [, startTransition] = useTransition();
  const { toast } = useToast();

  function change(next: string) {
    const prev = status;
    setStatus(next as LessonStatus);
    startTransition(async () => {
      const res = await setLessonStatus(lessonId, next as LessonStatus);
      if (!res.ok) {
        setStatus(prev);
        toast(res.error || "Couldn't save your progress.", "error");
      }
    });
  }

  return (
    <StatusControl
      value={status}
      options={LESSON_STATUS_OPTIONS}
      onChange={change}
      variant="pill"
      align={align}
      signedIn={signedIn}
    />
  );
}
