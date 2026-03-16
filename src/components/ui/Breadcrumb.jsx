/**
 * Breadcrumb Navigation Component
 */

import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

export default function Breadcrumb({ items, light = false, align = "left", variant = "default" }) {
  const isHeroPills = light && variant === "hero-pills";
  const textColor = light ? (isHeroPills ? "text-white/96" : "text-white/60") : "text-muted";
  const hoverColor = light ? "hover:text-white" : "hover:text-primary";
  const separatorColor = light ? (isHeroPills ? "text-white/92" : "text-white/30") : "text-(--color-text)/30";
  const activeColor = light ? (isHeroPills ? "text-white/84" : "text-white/80") : "text-(--color-text)";
  const isCentered = align === "center";
  const linkShell = isHeroPills
    ? "inline-flex items-center rounded-full border border-white/24 bg-black/42 px-3.5 py-2 backdrop-blur-[8px] shadow-[0_12px_28px_rgba(0,0,0,0.22)]"
    : "";

  return (
    <nav
      aria-label="Breadcrumb"
      className={`mb-lg ${isCentered ? "flex justify-center" : ""}`.trim()}
    >
      <ol className={`flex items-center flex-wrap gap-1 text-sm ${isCentered ? "justify-center" : ""}`.trim()}>
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-1">
            {i > 0 && <ChevronRight className={`w-4 h-4 ${separatorColor}`} strokeWidth={2.35} />}
            {item.to ? (
              <Link
                to={item.to}
                className={`${linkShell} ${textColor} ${hoverColor} transition-[color,background-color,border-color] duration-200 font-medium ${isHeroPills ? "hover:bg-black/54 hover:border-white/38" : ""}`.trim()}
              >
                {item.label}
              </Link>
            ) : (
              <span className={`${activeColor} font-medium ${isHeroPills ? "max-w-[32ch] sm:max-w-[42ch] text-center" : "truncate max-w-[200px] sm:max-w-[300px] md:max-w-none"}`.trim()}>
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
