/**
 * Main Layout Component
 * Wraps all pages with Navbar, Footer, and common elements
 */

import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import BackToTop from "../ui/BackToTop";

export default function Layout() {
  return (
    <div className="min-h-screen overflow-x-hidden">
      <Navbar />
      <Outlet />
      <Footer />
      <BackToTop />
    </div>
  );
}
