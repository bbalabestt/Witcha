import { iconMarkup, type IconName } from "./icons.generated";

export type { IconName };

type IconProps = {
  name: IconName;
  size?: number;
  strokeWidth?: number;
  /** When set the icon is announced; otherwise it is decorative. */
  label?: string;
  className?: string;
};

export function Icon({ name, size = 24, strokeWidth = 1.5, label, className }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="square"
      strokeLinejoin="miter"
      className={className}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
      // Markup is generated at build time from the supplied brand SVGs, never from user input.
      dangerouslySetInnerHTML={{ __html: iconMarkup[name] }}
    />
  );
}
