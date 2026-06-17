import type { FC, ReactNode } from "react";
import { useNavigate } from "react-router-dom";

interface ButtonProps {
  children: ReactNode;
  to?: string;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
}

const VARIANT: Record<string, string> = {
  primary:
    "bg-[#22c55e] text-[#0a0f1a] font-bold hover:bg-[#16a34a] shadow-lg shadow-[#22c55e]/20",
  secondary:
    "border border-[#1f2937] bg-[#111827] text-[#f3f4f6] hover:bg-[#1f2937]",
  ghost:
    "text-[#9ca3af] hover:text-[#f3f4f6]",
};

const SIZES: Record<string, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-5 py-2.5 text-sm",
  lg: "px-8 py-3.5 text-base",
};

const Button: FC<ButtonProps> = ({ children, to, onClick, variant = "primary", size = "md", className = "" }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (to) {
      navigate(to);
    }
    onClick?.();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-all duration-200 ${VARIANT[variant]} ${SIZES[size]} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
