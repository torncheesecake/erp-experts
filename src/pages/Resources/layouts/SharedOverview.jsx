import { CheckCircle } from "lucide-react";

export default function SharedOverview({ article, prioritiesLabel = "Core Priorities", children = null }) {
  return (
    <section className="section-padding">
      <div className="container">
        <div className="grid xl:grid-cols-[minmax(0,1.35fr)_minmax(0,0.65fr)] gap-2xl xl:gap-3xl items-start">
          <div className="min-w-0 xl:pr-xl">
            <p className="text-label text-primary mb-md">Overview</p>
            <h2 className="mb-xl" dangerouslySetInnerHTML={{ __html: article.overviewHeading }} />
            <p className="resource-lead mb-xl">{article.intro}</p>
            <p className="resource-body">{article.overviewSubtext}</p>
          </div>

          {article.takeaways?.length > 0 && (
            <aside className="min-w-0 pt-2xl mt-2xl border-t border-(--color-text)/10 xl:sticky xl:top-24 xl:pt-0 xl:mt-0 xl:border-t-0">
              <p className="text-label text-primary mb-lg">{prioritiesLabel}</p>
              <ul className="flex flex-col gap-lg">
                {article.takeaways.map((takeaway, i) => (
                  <li key={i} className="flex items-start gap-lg md:gap-xl min-w-0">
                    <span className="shrink-0 mt-0.5 inline-flex items-center justify-center w-11 h-11 rounded-[0.95rem] border border-primary/18 bg-primary/8 text-primary">
                      <CheckCircle className="w-5 h-5" strokeWidth={2.65} aria-hidden="true" />
                    </span>
                    <span className="resource-body">{takeaway}</span>
                  </li>
                ))}
              </ul>
            </aside>
          )}
        </div>

        {children}
      </div>
    </section>
  );
}
