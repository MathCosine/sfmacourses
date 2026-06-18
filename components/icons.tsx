import type { SVGProps } from "react";

export function ChevronRight(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

export function ArrowLeft(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="m12 19-7-7 7-7" />
      <path d="M19 12H5" />
    </svg>
  );
}

export function ArrowRight(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

export function Check(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export function Star({ filled, ...props }: SVGProps<SVGSVGElement> & { filled?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M11.48 3.5a.56.56 0 0 1 1.04 0l2.13 5.11a.56.56 0 0 0 .47.34l5.52.44c.5.04.7.67.32 1l-4.2 3.6a.56.56 0 0 0-.18.55l1.28 5.38c.12.5-.42.88-.85.62l-4.73-2.89a.56.56 0 0 0-.58 0l-4.73 2.89c-.43.26-.97-.12-.85-.62l1.28-5.38a.56.56 0 0 0-.18-.55l-4.2-3.6c-.39-.33-.18-.96.32-1l5.52-.44a.56.56 0 0 0 .47-.34Z" />
    </svg>
  );
}

export function Menu(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

export function Close(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

export function LogOut(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="m16 17 5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  );
}

export function PlusIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function TrashIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M3 6h18" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

export function ArrowUp(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="m18 15-6-6-6 6" />
    </svg>
  );
}

export function ArrowDown(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function Base(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    />
  );
}

export const ChevronDown = (props: SVGProps<SVGSVGElement>) => (
  <Base {...props}>
    <path d="m6 9 6 6 6-6" />
  </Base>
);

export const ArrowUpRight = (props: SVGProps<SVGSVGElement>) => (
  <Base {...props}>
    <path d="M7 17 17 7M7 7h10v10" />
  </Base>
);

export const Sun = (props: SVGProps<SVGSVGElement>) => (
  <Base {...props}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
  </Base>
);

export const Moon = (props: SVGProps<SVGSVGElement>) => (
  <Base {...props}>
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
  </Base>
);

export const Search = (props: SVGProps<SVGSVGElement>) => (
  <Base {...props}>
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </Base>
);

export const BookOpen = (props: SVGProps<SVGSVGElement>) => (
  <Base {...props}>
    <path d="M12 7v14M2.5 5.5A2 2 0 0 1 4 5h6a2 2 0 0 1 2 2 2 2 0 0 1 2-2h6a2 2 0 0 1 1.5.5" />
    <path d="M2 5v14a1 1 0 0 0 1 1h7a2 2 0 0 1 2 2 2 2 0 0 1 2-2h7a1 1 0 0 0 1-1V5" />
  </Base>
);

export const Target = (props: SVGProps<SVGSVGElement>) => (
  <Base {...props}>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="5" />
    <circle cx="12" cy="12" r="1.5" />
  </Base>
);

export const Trophy = (props: SVGProps<SVGSVGElement>) => (
  <Base {...props}>
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M6 4h12v5a6 6 0 0 1-12 0Z" />
    <path d="M12 15v3M9 21h6M9 21a3 3 0 0 1 6 0" />
  </Base>
);

export const ListChecks = (props: SVGProps<SVGSVGElement>) => (
  <Base {...props}>
    <path d="m3 7 2 2 3-3M3 17l2 2 3-3M13 6h8M13 12h8M13 18h8" />
  </Base>
);

export const Settings = (props: SVGProps<SVGSVGElement>) => (
  <Base {...props}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
  </Base>
);

export const Github = (props: SVGProps<SVGSVGElement>) => (
  <Base {...props}>
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </Base>
);

export const Sparkles = (props: SVGProps<SVGSVGElement>) => (
  <Base {...props}>
    <path d="M12 3l1.9 4.6L18.5 9.5 13.9 11.4 12 16l-1.9-4.6L5.5 9.5l4.6-1.9L12 3ZM19 14l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8.8-2ZM5 15l.6 1.5 1.5.6-1.5.6L5 19.2l-.6-1.5L2.9 17l1.5-.6L5 15Z" />
  </Base>
);

export const Users = (props: SVGProps<SVGSVGElement>) => (
  <Base {...props}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13A4 4 0 0 1 16 11" />
  </Base>
);

export const Zap = (props: SVGProps<SVGSVGElement>) => (
  <Base {...props}>
    <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8Z" />
  </Base>
);

export const GraduationCap = (props: SVGProps<SVGSVGElement>) => (
  <Base {...props}>
    <path d="M22 10 12 5 2 10l10 5 10-5Z" />
    <path d="M6 12v5c0 1 2.7 2.5 6 2.5s6-1.5 6-2.5v-5M22 10v6" />
  </Base>
);

export const PlayCircle = (props: SVGProps<SVGSVGElement>) => (
  <Base {...props}>
    <circle cx="12" cy="12" r="10" />
    <path d="m10 8 6 4-6 4V8Z" />
  </Base>
);

export const Compass = (props: SVGProps<SVGSVGElement>) => (
  <Base {...props}>
    <circle cx="12" cy="12" r="10" />
    <path d="m16.2 7.8-2.9 6.6-6.6 2.9 2.9-6.6 6.6-2.9Z" />
  </Base>
);

export const Flame = (props: SVGProps<SVGSVGElement>) => (
  <Base {...props}>
    <path d="M12 2c1 3 4 4.5 4 8a4 4 0 0 1-8 0c0-1 .3-1.8.7-2.5C9 9 9 10.5 10 11c0-2 1-4 2-9Z" />
    <path d="M12 22a6 6 0 0 0 6-6c0-2-1-4-2.5-5.5.2 2-1.5 3.5-3.5 3.5S8.3 12.5 8.5 10.5C7 12 6 14 6 16a6 6 0 0 0 6 6Z" />
  </Base>
);

export const Clock = (props: SVGProps<SVGSVGElement>) => (
  <Base {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </Base>
);

export const Layers = (props: SVGProps<SVGSVGElement>) => (
  <Base {...props}>
    <path d="m12 2 9 5-9 5-9-5 9-5ZM3 12l9 5 9-5M3 17l9 5 9-5" />
  </Base>
);

export const CheckCircle = (props: SVGProps<SVGSVGElement>) => (
  <Base {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="m8.5 12 2.5 2.5 4.5-5" />
  </Base>
);

export const Heart = (props: SVGProps<SVGSVGElement>) => (
  <Base {...props}>
    <path d="M20.8 5.6a5 5 0 0 0-7.1 0L12 7.3l-1.7-1.7a5 5 0 1 0-7.1 7.1L12 21.5l8.8-8.8a5 5 0 0 0 0-7.1Z" />
  </Base>
);

export const Hammer = (props: SVGProps<SVGSVGElement>) => (
  <Base {...props}>
    <path d="m15 12-8.5 8.5a2.12 2.12 0 0 1-3-3L12 9" />
    <path d="M17.64 15 22 10.64M20.91 11.7l-1.25-1.25a2.5 2.5 0 0 1 0-3.54l.7-.7-2.83-2.83-.7.7a2.5 2.5 0 0 1-3.54 0L12.04 2.88 8.5 6.42l9.08 9.08" />
  </Base>
);

export const ExternalLink = (props: SVGProps<SVGSVGElement>) => (
  <Base {...props}>
    <path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
  </Base>
);

export const Lightbulb = (props: SVGProps<SVGSVGElement>) => (
  <Base {...props}>
    <path d="M9 18h6M10 22h4" />
    <path d="M15.1 14a5 5 0 1 0-6.2 0c.5.4.9 1 1 1.6l.1.9h4l.1-.9c.1-.6.5-1.2 1-1.6Z" />
  </Base>
);

export const ScrollText = (props: SVGProps<SVGSVGElement>) => (
  <Base {...props}>
    <path d="M8 21h9a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v13" />
    <path d="M5 18a2 2 0 0 0 2 2M9 7h6M9 11h6M9 15h4" />
  </Base>
);

export const Beaker = (props: SVGProps<SVGSVGElement>) => (
  <Base {...props}>
    <path d="M9 3h6M10 3v6.2a2 2 0 0 1-.3 1L4.5 18a2 2 0 0 0 1.7 3h11.6a2 2 0 0 0 1.7-3l-5.2-7.8a2 2 0 0 1-.3-1V3" />
    <path d="M6.5 14h11" />
  </Base>
);

export const Info = (props: SVGProps<SVGSVGElement>) => (
  <Base {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 16v-4M12 8h.01" />
  </Base>
);

export const AlertTriangle = (props: SVGProps<SVGSVGElement>) => (
  <Base {...props}>
    <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
    <path d="M12 9v4M12 17h.01" />
  </Base>
);

export const Sigma = (props: SVGProps<SVGSVGElement>) => (
  <Base {...props}>
    <path d="M18 7V5a1 1 0 0 0-1-1H6.5a.5.5 0 0 0-.4.8L12 12l-5.9 7.2a.5.5 0 0 0 .4.8H17a1 1 0 0 0 1-1v-2" />
  </Base>
);

export const Pencil = (props: SVGProps<SVGSVGElement>) => (
  <Base {...props}>
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
  </Base>
);

export const Eye = (props: SVGProps<SVGSVGElement>) => (
  <Base {...props}>
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </Base>
);

export const Link2 = (props: SVGProps<SVGSVGElement>) => (
  <Base {...props}>
    <path d="M9 17H7A5 5 0 0 1 7 7h2M15 7h2a5 5 0 0 1 0 10h-2M8 12h8" />
  </Base>
);

export const Milestone = (props: SVGProps<SVGSVGElement>) => (
  <Base {...props}>
    <path d="M12 13v8M12 3v3" />
    <path d="M4 6h13l3 3.5L17 13H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Z" />
  </Base>
);
