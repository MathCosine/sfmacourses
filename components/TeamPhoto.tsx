"use client";

import { useEffect, useRef, useState } from "react";
import { initials } from "@/lib/utils";

/**
 * Team member photo. Falls back to a colored monogram if the image is missing
 * or fails to load, so the page looks right whether or not photos are present.
 */
export function TeamPhoto({
  src,
  name,
  color,
}: {
  src?: string;
  name: string;
  color: string;
}) {
  const [failed, setFailed] = useState(false);
  const ref = useRef<HTMLImageElement>(null);

  // Catch a 404 that happened before React attached onError during hydration.
  useEffect(() => {
    const img = ref.current;
    if (img && img.complete && img.naturalWidth === 0) setFailed(true);
  }, []);

  if (!src || failed) {
    return (
      <div
        className="flex aspect-[4/3] w-full items-center justify-center"
        style={{ background: color }}
      >
        <span className="text-[2.4rem] font-bold text-white">
          {initials(name)}
        </span>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={ref}
      src={src}
      alt={name}
      loading="lazy"
      onError={() => setFailed(true)}
      className="aspect-[4/3] w-full object-cover object-top"
    />
  );
}
