import { cn } from "@/lib/utils";

type Tone = "success" | "info" | "warning" | "danger" | "neutral";

const toneMap: Record<string, Tone> = {
  Available: "success",
  Completed: "success",
  Approved: "success",
  OnTrip: "info",
  Dispatched: "info",
  Active: "info",
  InShop: "warning",
  Pending: "warning",
  Draft: "neutral",
  Suspended: "danger",
  Retired: "danger",
  Cancelled: "danger",
  Expired: "danger",
  OffDuty: "neutral",
};

const labelMap: Record<string, string> = {
  OnTrip: "On Trip",
  InShop: "In Shop",
  OffDuty: "Off Duty",
};

const toneStyles: Record<Tone, { bg: string; text: string; dot: string }> = {
  success: { bg: "bg-[rgb(16_185_129_/_0.14)]",  text: "text-[#047857]", dot: "bg-[#10B981]" },
  info:    { bg: "bg-[rgb(59_130_246_/_0.14)]",  text: "text-[#1D4ED8]", dot: "bg-[#3B82F6]" },
  warning: { bg: "bg-[rgb(245_158_11_/_0.16)]",  text: "text-[#B45309]", dot: "bg-[#F59E0B]" },
  danger:  { bg: "bg-[rgb(239_68_68_/_0.14)]",   text: "text-[#B91C1C]", dot: "bg-[#EF4444]" },
  neutral: { bg: "bg-[rgb(148_163_184_/_0.18)]", text: "text-[#475569]", dot: "bg-[#94A3B8]" },
};

export function StatusPill({ status, className }: { status: string; className?: string }) {
  const tone = toneMap[status] ?? "neutral";
  const s = toneStyles[tone];
  const label = labelMap[status] ?? status;
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium", s.bg, s.text, className)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", s.dot)} />
      {label}
    </span>
  );
}
