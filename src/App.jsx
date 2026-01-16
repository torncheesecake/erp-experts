import { HashRouter as Router, Routes, Route } from "react-router-dom";
import Homepage from "./components/Homepage";
import Services from "./components/Services";
import NetSuiteServices from "./components/NetSuiteServices";
import Aftercare from "./components/Aftercare";
import Integrations from "./components/Integrations";
import CaseStudies from "./components/CaseStudies";
import CaseStudyDetail from "./components/CaseStudyDetail";
import About from "./components/About";
import Resources from "./components/Resources";
import Contact from "./components/Contact";
import Support from "./components/Support";
import DesignGuide from "./components/DesignGuide";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/services" element={<Services />} />
        <Route path="/services/netsuite" element={<NetSuiteServices />} />
        <Route path="/services/aftercare" element={<Aftercare />} />
        <Route path="/integrations" element={<Integrations />} />
        <Route path="/case-studies" element={<CaseStudies />} />
        <Route path="/case-studies/:id" element={<CaseStudyDetail />} />
        <Route path="/about" element={<About />} />
        <Route path="/resources" element={<Resources />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/support" element={<Support />} />
        <Route path="/design-guide" element={<DesignGuide />} />
      </Routes>
    </Router>
  );
}

export default App;
