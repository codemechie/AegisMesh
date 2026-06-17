import type { FC } from "react";

interface TranscriptEventAvatarProps {
  abbr: string;
  bg: string;
  color: string;
}

const TranscriptEventAvatar: FC<TranscriptEventAvatarProps> = ({ abbr, bg, color }) => (
  <div
    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[10px] font-bold uppercase tracking-wider ${bg} ${color} ring-2 ring-[#1f2937]`}
  >
    {abbr}
  </div>
);

export default TranscriptEventAvatar;
