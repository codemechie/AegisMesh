import type { FC, ReactNode } from "react";
import { useReveal } from "../../hooks/useReveal";
import Section from "./Section";

interface RevealSectionProps {
  children: ReactNode;
  className?: string;
  id?: string;
}

const RevealSection: FC<RevealSectionProps> = ({ children, className, id }) => {
  const ref = useReveal<HTMLDivElement>();
  return (
    <Section className={className} id={id}>
      <div ref={ref} className="reveal">
        {children}
      </div>
    </Section>
  );
};

export default RevealSection;
