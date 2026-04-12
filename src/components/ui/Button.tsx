import Link from "next/link";

type ButtonProps = {
  href: string;
  variant?: "primary" | "outline";
  children: React.ReactNode;
  className?: string;
  external?: boolean;
};

export default function Button({
  href,
  variant = "primary",
  children,
  className = "",
  external = false,
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center px-7 py-3.5 text-[12px] font-semibold tracking-[0.1em] uppercase rounded-[2px] transition-all duration-300 hover:-translate-y-0.5";

  const variants = {
    primary:
      "bg-gold text-bg-primary hover:bg-gold-light hover:shadow-[0_8px_30px_rgba(212,175,55,0.25)]",
    outline:
      "border border-gold-border text-text-primary hover:border-gold hover:text-gold hover:shadow-[0_8px_30px_rgba(212,175,55,0.08)]",
  };

  const classes = `${base} ${variants[variant]} ${className}`;

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={classes}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={classes}>
      {children}
    </Link>
  );
}
