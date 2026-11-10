import { ContactIcon, type ContactIconName } from "./contact-icon";
import { TextLink } from "./text-link";

type Props = { links: readonly { href: string; label: string; icon?: ContactIconName }[]; className?: string };

/** A row of standalone text links that wraps on narrow screens, such as 「所有文章」 and 「回到首頁」. */
export function LinkRow({ links, className = "" }: Props) {
  return (
    <ul className={`flex flex-wrap gap-x-7 gap-y-3 ${className}`}>
      {links.map(({ href, label, icon }) => (
        <li key={href}>
          <TextLink href={href}>
            {icon && <ContactIcon name={icon} />}
            {label}
          </TextLink>
        </li>
      ))}
    </ul>
  );
}
