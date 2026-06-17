import type { FC } from "react";
import Button from "../components/ui/Button";
import Logo from "../components/ui/Logo";
import RevealSection from "../components/ui/RevealSection";
import HeroSectionContent from "../components/landing/HeroSectionContent";
import ProblemSectionContent from "../components/landing/ProblemSectionContent";
import HowItWorksSectionContent from "../components/landing/HowItWorksSectionContent";
import AIIntelligenceLayerContent from "../components/landing/AIIntelligenceLayerContent";
import WhyMultipleModelsContent from "../components/landing/WhyMultipleModelsContent";
import WhyBandSectionContent from "../components/landing/WhyBandSectionContent";
import ResultsSectionContent from "../components/landing/ResultsSectionContent";
import BenchmarkDrivenContent from "../components/landing/BenchmarkDrivenContent";
import TechStackSectionContent from "../components/landing/TechStackSectionContent";
import TranscriptPreviewSectionContent from "../components/landing/TranscriptPreviewSectionContent";
import FinalCtaSectionContent from "../components/landing/FinalCtaSectionContent";
import FooterSectionContent from "../components/landing/FooterSectionContent";

const LandingPage: FC = () => (
  <div className="bg-[#0a0f1a]">
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[#1f2937]/50 bg-[#0a0f1a]/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
        <a href="/" className="flex items-center gap-3">
          <Logo />
          <span className="text-lg font-bold tracking-tight text-[#f3f4f6]">AegisMesh</span>
        </a>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" to="/dashboard">
            Dashboard
          </Button>
          <Button size="sm" to="/dashboard">
            Launch Demo
          </Button>
        </div>
      </div>
    </nav>

    <HeroSectionContent />
    <RevealSection>
      <ProblemSectionContent />
    </RevealSection>
    <RevealSection className="bg-[#0d1525]">
      <HowItWorksSectionContent />
    </RevealSection>
    <RevealSection className="bg-[#0d1525]">
      <AIIntelligenceLayerContent />
    </RevealSection>
    <RevealSection>
      <WhyMultipleModelsContent />
    </RevealSection>
    <RevealSection>
      <WhyBandSectionContent />
    </RevealSection>
    <RevealSection className="bg-[#0d1525]">
      <ResultsSectionContent />
    </RevealSection>
    <RevealSection>
      <BenchmarkDrivenContent />
    </RevealSection>
    <RevealSection>
      <TechStackSectionContent />
    </RevealSection>
    <RevealSection className="bg-[#0d1525]" id="transcript-preview">
      <TranscriptPreviewSectionContent />
    </RevealSection>
    <RevealSection>
      <FinalCtaSectionContent />
    </RevealSection>
    <FooterSectionContent />
  </div>
);

export default LandingPage;
