import type { FC } from "react";

interface LogoProps {
  className?: string;
}

const Logo: FC<LogoProps> = ({ className = "h-8 w-8" }) => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="20" cy="20" r="17" stroke="#22c55e" strokeWidth="1" opacity="0.15" />
    <line x1="20" y1="14" x2="12" y2="28" stroke="#22c55e" strokeWidth="1.5" opacity="0.35" />
    <line x1="20" y1="14" x2="28" y2="28" stroke="#22c55e" strokeWidth="1.5" opacity="0.35" />
    <line x1="14" y1="28" x2="26" y2="28" stroke="#22c55e" strokeWidth="1.5" opacity="0.35" />
    <circle cx="20" cy="12" r="4" fill="#22c55e" opacity="0.9" />
    <circle cx="10" cy="28" r="4" fill="#22c55e" opacity="0.55" />
    <circle cx="30" cy="28" r="4" fill="#22c55e" opacity="0.55" />
  </svg>
);

export default Logo;
