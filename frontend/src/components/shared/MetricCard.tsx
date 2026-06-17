import type { FC, ReactNode } from "react";

interface MetricCardProps {
  label: string;
  value: ReactNode;
  valueClassName?: string;
}

const MetricCard: FC<MetricCardProps> = ({ label, value, valueClassName = "text-[#f3f4f6]" }) => (
  <div className="rounded-lg border border-[#1f2937] bg-[#0a0f1a] p-3">
    <div className={`text-lg font-bold ${valueClassName}`}>{value}</div>
    <div className="text-[10px] font-medium uppercase tracking-wider text-[#6b7280]">{label}</div>
  </div>
);

export default MetricCard;
