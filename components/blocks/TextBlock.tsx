interface TextBlockProps {
  html: string;
}

export function TextBlock({ html }: TextBlockProps) {
  return (
    <div
      className="prose-sfma"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
