/**
 * Homepage Logo Cloud & Partner Badge Section
 */

import { Shield } from "lucide-react";
import NetSuiteLogo from "../../assets/NetSuite-logo-half-light.png";

const clientLogos = [
  "Stella McCartney",
  "REFY",
  "Dr. Oetker",
  "Lounge Underwear",
  "Percival",
  "Beauty Pie",
];

export default function LogoCloud() {
  return (
    <section className="section-padding border-t border-(--color-text)/10 overflow-hidden">
      <div className="container">
        <div className="flex flex-col lg:flex-row lg:items-center gap-xl lg:gap-2xl">
          {/* Partner Badge Card */}
          <div className="shrink-0 p-lg md:p-xl rounded-2xl bg-(--color-tertiary)/5 border border-(--color-tertiary)/20">
            <div className="flex items-center gap-lg">
              <img src={NetSuiteLogo} alt="NetSuite" className="h-8 md:h-10" />
              <div className="flex items-center gap-md">
                <div
                  className="shrink-0 flex items-end justify-center"
                  style={{
                    width: "40px",
                    height: "35px",
                    clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
                    backgroundColor: "var(--color-tertiary)",
                  }}
                >
                  <Shield className="w-4 h-4 text-white mb-1" />
                </div>
                <p className="text-label text-tertiary">Official Partner</p>
              </div>
            </div>
          </div>

          {/* Logos */}
          <div className="flex-1 flex flex-wrap items-center gap-lg md:gap-xl lg:justify-end">
            {clientLogos.map((name, i) => (
              <div
                key={i}
                className="text-base md:text-lg font-bold text-muted/40 whitespace-nowrap"
              >
                {name}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
