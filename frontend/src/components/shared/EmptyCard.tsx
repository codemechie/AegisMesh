import type { FC } from "react";

interface EmptyCardProps {
  title: string;
  message: string;
}

const EmptyCard: FC<EmptyCardProps> = ({ title, message }) => (
  <div className="rounded-xl border border-[#1f2937] bg-[#111827] p-6 shadow-lg">
    <h3 className="mb-2 font-semibold text-[#f3f4f6]">{title}</h3>
    <p className="text-sm text-[#9ca3af]">{message}</p>
  </div>
);

export default EmptyCard;
