import { MessageSquareQuote } from "lucide-react";

export default function QuoteBanner({ caseStudy }) {
  return (
    <section className="relative overflow-hidden" style={{ padding: "var(--space-2xl) 0" }}>
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(135deg, var(--color-quaternary) 0%, #1a5c3a 100%)",
        }}
      />
      <div
        className="absolute top-0 left-0 opacity-10 hidden md:block"
        style={{
          width: "250px",
          height: "214px",
          clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
          backgroundColor: "white",
          transform: "translateX(-80px) translateY(-60px)",
        }}
      />
      <div
        className="absolute bottom-0 right-0 opacity-10 hidden md:block"
        style={{
          width: "200px",
          height: "172px",
          clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
          backgroundColor: "white",
          transform: "translateX(60px) translateY(50px)",
        }}
      />
      <div className="container relative z-10">
        <div className="text-center">
          <MessageSquareQuote className="w-12 h-12 text-white/30 mx-auto mb-lg" />
          <blockquote className="font-heading text-xl md:text-2xl lg:text-3xl leading-snug text-white mb-lg max-w-4xl mx-auto">
            "{caseStudy.quote}"
          </blockquote>
          {caseStudy.quoteAuthor && (
            <>
              <p className="text-white/80 font-bold">{caseStudy.quoteAuthor}</p>
              <p className="text-white/60">{caseStudy.quoteRole}</p>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
