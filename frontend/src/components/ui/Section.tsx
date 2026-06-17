import type { FC, ReactNode } from "react";

interface SectionProps {
  children: ReactNode;
  className?: string;
  id?: string;
}

const Section: FC<SectionProps> = ({ children, className = "", id }) => {
  return (
    <section id={id} className={`py-16 sm:py-24 ${className}`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {children}
      </div>
    </section>
  );
};

export default Section;
