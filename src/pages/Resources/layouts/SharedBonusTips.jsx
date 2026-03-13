import SharedFeatureIcon from "./SharedFeatureIcon";

export default function SharedBonusTips({
  article,
  label = "Bonus Tips",
  title = "Keep the Momentum",
  accent = "Going",
}) {
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
          <h3>
            {title} <span className="text-primary">{accent}</span>
          </h3>
        </div>

        <div
          className={`grid md:grid-cols-2 ${
            article.bonusTips.length === 3 ? "lg:grid-cols-3" : "lg:grid-cols-4"
          } gap-lg`}
        >
          {article.bonusTips.map((tip, i) => (
            <article
              key={i}
              className="rounded-2xl p-lg md:p-xl border border-(--color-text)/10 bg-white shadow-[0_10px_26px_rgba(26,26,26,0.05)]"
            >
              <SharedFeatureIcon icon={tip.icon} size="md" className="mb-md" />
              <h5 style={{ marginBottom: "var(--space-sm)" }}>{tip.title}</h5>
              <p className="resource-body">{tip.content}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
