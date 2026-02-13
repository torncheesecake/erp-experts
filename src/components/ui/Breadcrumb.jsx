/**
 * Breadcrumb Navigation Component
 */

import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

export default function Breadcrumb({ items, light = false }) {
  const textColor = light ? "text-white/60" : "text-muted";
  const hoverColor = light ? "hover:text-white" : "hover:text-primary";
  const separatorColor = light ? "text-white/30" : "text-(--color-text)/30";
  const activeColor = light ? "text-white/80" : "text-(--color-text)";

  return (
    <nav aria-label="Breadcrumb" className="mb-lg">
      <ol className="flex items-center flex-wrap gap-1 text-sm">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-1">
            {i > 0 && <ChevronRight className={`w-3.5 h-3.5 ${separatorColor}`} />}
            {item.to ? (
              <Link
                to={item.to}
                className={`${textColor} ${hoverColor} transition-colors font-medium`}
              >
                {item.label}
              </Link>
            ) : (
              <span className={`${activeColor} font-medium truncate max-w-[200px] sm:max-w-[300px] md:max-w-none`}>
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
