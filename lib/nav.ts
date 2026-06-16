import type { TrackWithModules } from "./data";

export interface NavLesson {
  id: string;
  title: string;
  slug: string;
}
export interface NavModule {
  id: string;
  title: string;
  slug: string;
  lessons: NavLesson[];
}
export interface NavTrack {
  id: string;
  title: string;
  slug: string;
  modules: NavModule[];
}

/** Strip heavy lesson content down to what the client sidebar needs. */
export function toNavTracks(tree: TrackWithModules[]): NavTrack[] {
  return tree.map((t) => ({
    id: t.id,
    title: t.title,
    slug: t.slug,
    modules: t.modules.map((m) => ({
      id: m.id,
      title: m.title,
      slug: m.slug,
      lessons: m.lessons.map((l) => ({
        id: l.id,
        title: l.title,
        slug: l.slug,
      })),
    })),
  }));
}
