import { useId } from "react";

export default function Logo({ className = "h-8 w-8" }: { className?: string }) {
  const gradId = useId().replace(/:/g, "");

  return (
    <div className={`${className} relative`}>
      <svg viewBox="0 0 40 40" className="w-full h-full" fill="none">
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="40" y2="40">
            <stop offset="0%" stopColor="hsl(45 95% 70%)" />
            <stop offset="100%" stopColor="hsl(37 90% 55%)" />
          </linearGradient>
        </defs>
        <rect x="2" y="2" width="36" height="36" rx="10" fill={`url(#${gradId})`} />
        <path d="M13 11v18M13 20l9-9M13 20l9 9" stroke="hsl(240 10% 4%)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <div className="absolute inset-0 rounded-[10px] bg-gold/30 blur-xl -z-10" />
    </div>
  );
}
