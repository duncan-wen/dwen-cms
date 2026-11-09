const linkedIn = { href: "https://www.linkedin.com/in/duncan-wen", label: "LinkedIn" };

/** The Owner's address, shown only where the Contact form can't send. */
export const ownerEmail = "lumpa7223@gmail.com";

/** Where every 「聯絡我」 and the footer's 「聯絡表單」 lead: the About page's contact section. */
export const contactFormHref = "/about#contact";

/** The Owner's contact and follow links: one list for the footer and the About page's #contact section. */
export const contactLinks = [
  { href: "https://github.com/duncan-wen", label: "GitHub" },
  { href: contactFormHref, label: "聯絡表單" },
  linkedIn,
  { href: "/feed.xml", label: "RSS" },
] as const;

/** Other ways to reach the Owner, offered when the Contact form can't send. */
export const fallbackContactLinks = [linkedIn, { href: `mailto:${ownerEmail}`, label: ownerEmail }] as const;
