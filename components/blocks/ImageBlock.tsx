import type { ImageBlock as ImageBlockType } from "@/lib/types";
import { optimizedImageUrl } from "@/lib/cloudinary";

export function ImageBlock({ block }: { block: ImageBlockType }) {
  if (!block.url) return null;

  return (
    <figure className="my-6">
      <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-card">
        {/* Plain <img> (not next/image): Cloudinary already serves an
            optimized, width-capped, CDN-delivered asset. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={optimizedImageUrl(block.url)}
          alt={block.alt || ""}
          loading="lazy"
          className="mx-auto block h-auto max-w-full"
        />
      </div>
      {block.caption && (
        <figcaption className="mt-2 text-center text-[12.5px] text-tmuted">
          {block.caption}
        </figcaption>
      )}
    </figure>
  );
}
