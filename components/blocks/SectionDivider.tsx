export function SectionDivider({ id, title }: { id: string; title: string }) {
  return (
    <h2
      id={id}
      className="mt-10 mb-3 scroll-mt-24 border-b border-border pb-2 font-serif text-2xl text-tprimary"
    >
      {title}
    </h2>
  );
}
