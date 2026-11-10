import type { ContactIconName } from "@/components/contact-icon";

type ContactLink = { href: string; label: string; icon: ContactIconName };

const linkedIn: ContactLink = { href: "https://www.linkedin.com/in/duncan-wen", label: "LinkedIn", icon: "linkedin" };

/** The Owner's address, shown only where the Contact form can't send. */
export const ownerEmail = "lumpa7223@gmail.com";

/** Where every 「聯絡我」 and the footer's 「聯絡表單」 lead: the About page's contact section. */
export const contactFormHref = "/about#contact";

/** The Owner's contact and follow links: one list for the footer and the About page's #contact section. */
export const contactLinks: readonly ContactLink[] = [
  { href: "https://github.com/duncan-wen", label: "GitHub", icon: "github" },
  { href: contactFormHref, label: "聯絡表單", icon: "mail" },
  linkedIn,
  { href: "/feed.xml", label: "RSS", icon: "rss" },
];

/** Other ways to reach the Owner, offered when the Contact form can't send. */
export const fallbackContactLinks: readonly ContactLink[] = [
  linkedIn,
  { href: `mailto:${ownerEmail}`, label: ownerEmail, icon: "mail" },
];
