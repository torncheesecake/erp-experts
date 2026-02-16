export default function HighlightsBar({ highlights }) {
  if (!highlights || highlights.length === 0) return null;
  return (
    <section
      className="relative overflow-hidden"
      style={{ padding: "var(--space-2xl) 0", backgroundColor: "var(--color-quaternary)" }}
    >
      <div
        className="absolute top-0 left-0 opacity-10 hidden md:block"
        style={{
          width: "200px",
          height: "172px",
          clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
          backgroundColor: "white",
          transform: "translateX(-50%) translateY(-30%)",
        }}
      />
      <div className="container relative z-10">
        <div className={`grid grid-cols-1 sm:grid-cols-${highlights.length} gap-lg text-center`}>
          {highlights.map((item, i) => (
            <div key={i}>
              <p className="font-heading text-4xl md:text-5xl text-white mb-sm">{item.value}</p>
              <p className="text-white/80 text-lg">{item.label}</p>
              <p className="text-white/60 text-sm">{item.suffix}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
