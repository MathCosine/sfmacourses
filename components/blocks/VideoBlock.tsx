import type { VideoBlock as VideoBlockType } from "@/lib/types";
import { toEmbedUrl } from "@/lib/utils";

export function VideoBlock({ block }: { block: VideoBlockType }) {
  const embed = toEmbedUrl(block.url);
  if (!embed) return null;

  return (
    <figure className="my-6">
      {block.title && (
        <div className="mb-2 text-[14px] font-semibold text-tprimary">
          {block.title}
        </div>
      )}
      <div className="relative aspect-video overflow-hidden rounded-xl border border-border shadow-card">
        <iframe
          src={embed}
          title={block.title || "Video"}
          className="absolute inset-0 h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
      {block.caption && (
        <figcaption className="mt-2 text-[12.5px] text-tmuted">
          {block.caption}
        </figcaption>
      )}
    </figure>
  );
}
