/**
 * ERP Experts Case Study Detail Page
 * Looks up case study by ID and renders the correct layout variant.
 * Data lives in src/data/caseStudies.js — single source of truth.
 */

import { useParams, Link } from "react-router-dom";
import SEO from "../../components/ui/SEO";
import { caseStudies } from "../../data/caseStudies";

import LayoutVariant1 from "./layouts/LayoutVariant1";
import LayoutVariant2 from "./layouts/LayoutVariant2";
import LayoutVariant3 from "./layouts/LayoutVariant3";
import LayoutVariant4 from "./layouts/LayoutVariant4";
import LayoutVariant5 from "./layouts/LayoutVariant5";
import PrevNextNav from "./layouts/PrevNextNav";
import SharedCTA from "./layouts/SharedCTA";

const layoutComponents = {
  1: LayoutVariant1,
  2: LayoutVariant2,
  3: LayoutVariant3,
  4: LayoutVariant4,
  5: LayoutVariant5,
};

export default function CaseStudyDetail() {
  const { id } = useParams();
  const caseStudy = caseStudies[id];

  if (!caseStudy) {
    return (
      <main id="main-content" className="section-padding-lg">
        <div className="container text-center">
          <h2 className="mb-lg">Case study not found</h2>
          <Link to="/case-studies" className="btn btn-primary">
            Back to case studies
          </Link>
        </div>
      </main>
    );
  }

  const Layout = layoutComponents[caseStudy.layoutVariant] || LayoutVariant1;

  return (
    <main id="main-content">
      <SEO
        title={`${caseStudy.client} - Case Study`}
        description={caseStudy.subtitle}
        path={`/case-studies/${id}`}
        keywords={caseStudy.seoKeywords || "NetSuite case study, ERP implementation success"}
      />

      <Layout caseStudy={caseStudy} />
      <PrevNextNav currentId={caseStudy.id} />
      <SharedCTA caseStudy={caseStudy} />
    </main>
  );
}
