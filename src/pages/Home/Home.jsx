/**
 * ERP Experts Homepage
 * Composes all homepage sections
 */

import SEO from "../../components/ui/SEO";
import Hero from "./Hero";
import LogoCloud from "./LogoCloud";
import WhyUs from "./WhyUs";
import Stats from "./Stats";
import Journey from "./Journey";
import CaseStudyFeature from "./CaseStudyFeature";
import Testimonial from "./Testimonial";
import Resources from "./Resources";
import FinalCTA from "./FinalCTA";

export default function Home() {
  return (
    <main id="main-content">
      <SEO
        path="/"
        keywords="NetSuite, ERP, implementation, UK, business software, cloud ERP, NetSuite partner, Oracle NetSuite"
      />
      <Hero />
      <LogoCloud />
      <WhyUs />
      <Stats />
      <Journey />
      <CaseStudyFeature />
      <Testimonial />
      <Resources />
      <FinalCTA />
    </main>
  );
}
