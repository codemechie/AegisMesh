import type { FC } from "react";

const EmptyTranscriptState: FC = () => (
  <div className="flex min-h-[60vh] items-center justify-center">
    <div className="max-w-md text-center">
      <div className="mb-4 text-5xl text-[#4b5563]">{"\u{1F4CB}"}</div>
      <h2 className="mb-2 text-xl font-bold text-[#f3f4f6]">No Transcript Available</h2>
      <p className="text-sm leading-relaxed text-[#9ca3af]">
        Run a mesh session from the dashboard first, then return here to view the
        agent collaboration transcript.
      </p>
    </div>
  </div>
);

export default EmptyTranscriptState;
