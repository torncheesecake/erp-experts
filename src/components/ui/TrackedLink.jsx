/**
 * TrackedLink Component
 * A Link component that tracks clicks to Google Analytics
 */

import { Link } from "react-router-dom";
import { trackCTAClick } from "../Analytics";

export default function TrackedLink({
  to,
  href,
  children,
  trackingName,
  trackingPage,
  className,
  style,
  ...props
}) {
  const handleClick = () => {
    if (trackingName) {
      trackCTAClick(trackingName, trackingPage || window.location.pathname);
    }
  };

  if (href) {
    return (
      <a
        href={href}
        onClick={handleClick}
        className={className}
        style={style}
        target="_blank"
        rel="noopener noreferrer"
        {...props}
      >
        {children}
      </a>
    );
  }

  return (
    <Link to={to} onClick={handleClick} className={className} style={style} {...props}>
      {children}
    </Link>
  );
}
