import { jsonLdText, type StructuredData } from "@/structured-data";

type Props = { data: StructuredData };

/** A page's structured data for search engines, as a JSON-LD script. */
export function JsonLd({ data }: Props) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdText(data) }} />;
}
