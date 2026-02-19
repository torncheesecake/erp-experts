import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { useEffect, lazy, Suspense } from "react";

// Layout - not lazy loaded as it's needed immediately
import Layout from "./components/layout/Layout";
import Analytics from "./components/Analytics";
import CookieConsent from "./components/ui/CookieConsent";

// Loading spinner for lazy loaded pages
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-md">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-muted">Loading...</p>
      </div>
    </div>
  );
}

// Lazy loaded pages
const Home = lazy(() => import("./pages/Home"));
const About = lazy(() => import("./pages/About/About"));
const NetSuiteServices = lazy(() => import("./pages/NetSuiteServices/NetSuiteServices"));

const Implementation = lazy(() => import("./pages/Implementation/Implementation"));
const CaseStudies = lazy(() => import("./pages/CaseStudies/CaseStudies"));
const CaseStudyDetail = lazy(() => import("./pages/CaseStudies/CaseStudyDetail"));
const Resources = lazy(() => import("./pages/Resources/Resources"));
const ResourceArticle = lazy(() => import("./pages/Resources/ResourceArticle"));

const Contact = lazy(() => import("./pages/Contact/Contact"));
const Support = lazy(() => import("./pages/Support/Support"));
const WhatIsNetSuite = lazy(() => import("./pages/WhatIsNetSuite/WhatIsNetSuite"));
const DesignGuide = lazy(() => import("./pages/DesignGuide"));
const Changelog = lazy(() => import("./pages/Changelog"));
const NotFound = lazy(() => import("./pages/NotFound"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const Terms = lazy(() => import("./pages/Terms"));
const Cookies = lazy(() => import("./pages/Cookies"));
const Partners = lazy(() => import("./pages/Partners/Partners"));
const PartnerDetail = lazy(() => import("./pages/Partners/PartnerDetail"));
const FAQ = lazy(() => import("./pages/FAQ/FAQ"));

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Analytics />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/services" element={<Navigate to="/implementation" replace />} />
            <Route path="/services/netsuite" element={<NetSuiteServices />} />
            <Route path="/services/aftercare" element={<Navigate to="/support" replace />} />
            <Route
              path="/services/implementation"
              element={<Navigate to="/implementation" replace />}
            />
            <Route
              path="/services/consultancy"
              element={<Navigate to="/implementation" replace />}
            />
            <Route
              path="/services/development"
              element={<Navigate to="/implementation" replace />}
            />
            <Route
              path="/services/integrations"
              element={<Navigate to="/implementation" replace />}
            />
            <Route path="/services/training" element={<Navigate to="/implementation" replace />} />
            <Route path="/implementation" element={<Implementation />} />
            <Route path="/case-studies" element={<CaseStudies />} />
            <Route path="/case-studies/:id" element={<CaseStudyDetail />} />
            <Route path="/about" element={<About />} />
            <Route path="/resources" element={<Resources />} />

            <Route path="/resources/:slug" element={<ResourceArticle />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/support" element={<Support />} />
            <Route path="/what-is-netsuite" element={<WhatIsNetSuite />} />
            <Route path="/design-guide" element={<DesignGuide />} />
            <Route path="/changelog" element={<Changelog />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/cookies" element={<Cookies />} />
            <Route path="/partners" element={<Partners />} />
            <Route path="/partners/:slug" element={<PartnerDetail />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Suspense>
      <CookieConsent />
    </Router>
  );
}

export default App;
