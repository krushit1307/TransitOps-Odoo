import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type Tone = "amber" | "blue" | "green" | "red" | "slate";

const badgeStyle: Record<Tone, { bg: string; text: string }> = {
  amber: { bg: "bg-[rgb(245_158_11_/_0.15)]", text: "text-[#B45309] dark:text-[#FCD34D]" },
  blue:  { bg: "bg-[rgb(59_130_246_/_0.15)]", text: "text-[#2563EB] dark:text-[#60A5FA]" },
  green: { bg: "bg-[rgb(16_185_129_/_0.15)]", text: "text-[#059669] dark:text-[#34D399]" },
  red:   { bg: "bg-[rgb(239_68_68_/_0.15)]",  text: "text-[#DC2626] dark:text-[#F87171]" },
  slate: { bg: "bg-[rgb(148_163_184_/_0.18)]", text: "text-[#475569] dark:text-[#94A3B8]" },
};

export function KpiCard({
  label, value, sub, tone = "amber", icon, index = 0,
}: {
  label: string; value: string | number; sub?: string;
  tone?: Tone; icon?: ReactNode; index?: number;
}) {
  const b = badgeStyle[tone];
  return (
    <div
      className={cn(
        "glass rounded-2xl px-5 py-5 fade-in relative",
        "hover:-translate-y-[2px] hover:shadow-[0_16px_40px_-12px_rgb(18_21_28_/_0.12)] transition-all"
      )}
      style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="label-caps">{label}</div>
        {icon && (
          <div className={cn("h-8 w-8 rounded-xl grid place-items-center shrink-0", b.bg, b.text)}>
            {icon}
          </div>
        )}
      </div>
      <div className="font-mono font-semibold text-2xl mt-2 tracking-tight text-ink">{value}</div>
      {sub && <div className="text-xs text-slate mt-1">{sub}</div>}
    </div>
  );
}
