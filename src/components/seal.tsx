type Props = {
  size?: "small" | "medium" | "large";
  className?: string;
};

const sizes = {
  small: "size-[22px] rounded-[2px] text-[14px]",
  medium: "size-[30px] rounded-[3px] text-[19px]",
  large: "size-[44px] rounded-[4px] text-[28px]",
} as const;

/** The site's identity mark: an accent-coloured square seal bearing 「溫」. Decorative, so hidden from assistive tech. */
export function Seal({ size = "medium", className = "" }: Props) {
  return (
    <span
      aria-hidden="true"
      className={`inline-grid flex-none place-items-center bg-accent font-serif leading-none font-black text-on-accent ${sizes[size]} ${className}`}
    >
      溫
    </span>
  );
}
