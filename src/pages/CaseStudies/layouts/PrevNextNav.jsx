import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { caseStudies, caseStudyOrder } from "../../../data/caseStudies";

export default function PrevNextNav({ currentId }) {
  const currentIndex = caseStudyOrder.indexOf(currentId);
  const prevId = currentIndex > 0 ? caseStudyOrder[currentIndex - 1] : null;
  const nextId = currentIndex < caseStudyOrder.length - 1 ? caseStudyOrder[currentIndex + 1] : null;
  const prev = prevId ? caseStudies[prevId] : null;
  const next = nextId ? caseStudies[nextId] : null;

  return (
    <section className="border-t border-(--color-text)/10" style={{ padding: "var(--space-xl) 0" }}>
      <div className="container">
        <div className="flex justify-between items-center">
          {prev ? (
            <Link
              to={`/case-studies/${prev.id}`}
              className="flex items-center gap-md text-muted hover:text-quaternary transition-colors group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <div>
                <p className="text-xs font-bold uppercase tracking-wider opacity-60">Previous</p>
                <p className="font-heading text-lg">{prev.client}</p>
              </div>
            </Link>
          ) : (
            <div />
          )}
          {next ? (
            <Link
              to={`/case-studies/${next.id}`}
              className="flex items-center gap-md text-muted hover:text-quaternary transition-colors group text-right"
            >
              <div>
                <p className="text-xs font-bold uppercase tracking-wider opacity-60">Next</p>
                <p className="font-heading text-lg">{next.client}</p>
              </div>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          ) : (
            <div />
          )}
        </div>
      </div>
    </section>
  );
}
