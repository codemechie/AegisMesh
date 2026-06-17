import type { FC } from "react";

interface SectionHeaderProps {
  pre: string;
  title: string;
  description: string;
}

const SectionHeader: FC<SectionHeaderProps> = ({ pre, title, description }) => (
  <div className="mb-14 text-center">
    <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#22c55e]/20 bg-[#22c55e]/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#22c55e]">{pre}</div>
    <h2 className="text-3xl font-bold tracking-tight text-[#f3f4f6] sm:text-4xl">{title}</h2>
    <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-[#9ca3af]">{description}</p>
  </div>
);

export default SectionHeader;
