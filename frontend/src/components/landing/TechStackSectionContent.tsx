import type { FC } from "react";
import SectionHeader from "../ui/SectionHeader";
import { TECH_CATEGORIES } from "../../data/landing";

const TechStackSectionContent: FC = () => (
  <>
    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#1f2937] to-transparent" />
    <SectionHeader
      pre="AI/ML & Platform"
      title="AI/ML & Technology Stack"
      description="Built on frontier models, multi-agent orchestration, and modern web platform technologies."
    />
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {TECH_CATEGORIES.map((cat) => (
        <div
          key={cat.title}
          className={`group rounded-xl border ${cat.border} ${cat.bg} p-6 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg`}
        >
            <div className="mb-1 text-xs font-bold uppercase tracking-wider text-[#9ca3af] transition-colors duration-300 group-hover:text-[#d1d5db]">
            {cat.title}
          </div>
            <p className="mb-4 text-[10px] leading-relaxed text-[#9ca3af]">
            {cat.description}
          </p>
          <ul className="space-y-2.5">
            {cat.items.map((item) => (
              <li key={item} className="flex items-center gap-2.5 text-sm text-[#d1d5db]">
                <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${cat.dot} transition-all duration-300 group-hover:scale-125`} />
                {item}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  </>
);

export default TechStackSectionContent;
