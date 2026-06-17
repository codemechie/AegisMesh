import type { FC, ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
}

const Card: FC<CardProps> = ({ children, className = "" }) => (
  <div className={`rounded-xl border border-[#1f2937] bg-[#111827] p-6 shadow-lg ${className}`}>
    {children}
  </div>
);

export default Card;
