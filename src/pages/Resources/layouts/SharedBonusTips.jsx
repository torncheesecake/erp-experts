export default function SharedBonusTips({
  article,
  label = "Bonus Tips",
  title = "Keep the Momentum",
  accent = "Going",
}) {
  const gridClassName =
    article.bonusTips.length === 3 ? "md:grid-cols-2 xl:grid-cols-3" : "md:grid-cols-2";

  return (
    <section
      className="section-padding-lg border-t border-(--color-text)/10"
      style={{
        background:
          "linear-gradient(180deg, rgba(230, 48, 125, 0.04) 0%, rgba(230, 48, 125, 0.015) 100%)",
      }}
    >
      <div className="container">
        <div className="text-center mb-2xl">
          <p className="text-label text-primary mb-md">{label}</p>
          <h2>
            {title} <span className="text-primary">{accent}</span>
          </h2>
        </div>

        <div className={`grid ${gridClassName} gap-lg xl:gap-xl`}>
          {article.bonusTips.map((tip, i) => {
            const Icon = tip.icon;

            return (
              <article
                key={i}
                className={`rounded-[1.45rem] border border-(--color-text)/10 p-lg md:p-xl lg:p-2xl shadow-[0_14px_30px_rgba(26,26,26,0.035)] ${
                  i % 2 === 0
                    ? "bg-[linear-gradient(165deg,rgba(255,255,255,0.98)_0%,rgba(251,251,251,0.92)_100%)]"
                    : "bg-[linear-gradient(165deg,rgba(255,250,253,0.98)_0%,rgba(252,252,252,0.92)_100%)]"
                }`}
              >
                <div className="grid gap-lg md:grid-cols-[auto_minmax(0,1fr)] md:gap-xl items-start">
                  <span className="inline-flex items-center justify-center w-12 h-12 rounded-[0.95rem] border border-primary/18 bg-primary/8 text-primary shrink-0">
                    <Icon className="w-5 h-5" strokeWidth={2.35} aria-hidden="true" />
                  </span>

                  <div className="min-w-0">
                    <p className="text-sm font-bold uppercase tracking-[0.08em] text-primary/65 mb-sm">
                      Extra Focus
                    </p>
                    <h5 style={{ marginBottom: "var(--space-sm)" }}>{tip.title}</h5>
                    <p className="resource-body">{tip.content}</p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
