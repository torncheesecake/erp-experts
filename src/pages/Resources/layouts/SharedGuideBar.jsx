import { Lightbulb, CheckCircle, Clock } from "lucide-react";
import SharedFeatureIcon from "./SharedFeatureIcon";

function StatPill({ icon, value, label, className = "" }) {
  return (
    <div
      className={`flex w-full min-w-0 items-center gap-md px-lg py-md md:px-xl md:py-lg rounded-2xl border border-(--color-text)/10 bg-white/95 shadow-[0_8px_22px_rgba(26,26,26,0.06)] ${className}`.trim()}
    >
      <div className="shrink-0">
        <SharedFeatureIcon icon={icon} size="md" />
      </div>
      <div className="text-left min-w-0">
        <p className="text-[0.72rem] md:text-[0.78rem] uppercase tracking-[0.08em] font-bold text-muted leading-[1.2]">
          {label}
        </p>
        <p className="text-xl md:text-2xl font-heading font-bold text-(--color-text) leading-tight">
          {value}
        </p>
      </div>
    </div>
  );
}

export default function SharedGuideBar({
  title = "In This Guide",
  tipsCount = 0,
  tipsLabel = "Key Tips",
  bonusCount = 0,
  bonusLabel = "Bonus Strategies",
  readTime = "",
}) {
  return (
    <section
      className="border-y border-(--color-text)/10"
      style={{
        background:
          "linear-gradient(180deg, rgba(230, 48, 125, 0.05) 0%, rgba(230, 48, 125, 0.015) 100%)",
        padding: "1.5rem 0",
      }}
    >
      <div className="container">
        <div className="grid gap-lg xl:grid-cols-[auto_minmax(0,1fr)] xl:items-center xl:gap-xl">
          <div className="flex items-center gap-md self-start xl:self-auto">
            <div
              style={{
                width: "20px",
                height: "17px",
                clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
                backgroundColor: "var(--color-primary)",
              }}
            />
            <span className="font-heading font-bold uppercase text-sm tracking-[0.15em] text-primary">
              {title}
            </span>
          </div>

          <div className="grid w-full grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 items-stretch gap-md">
            <StatPill icon={Lightbulb} value={tipsCount} label={tipsLabel} />
            <StatPill icon={CheckCircle} value={bonusCount} label={bonusLabel} />
            <StatPill
              icon={Clock}
              value={readTime}
              label="Read Time"
              className="sm:col-span-2 xl:col-span-1"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
