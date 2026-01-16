/**
 * ERP Experts Contact Page
 * "Let's Talk" - Main contact/enquiry page
 */

import { ArrowRight, Mail, Phone, MapPin, Clock } from "lucide-react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import BackToTop from "./BackToTop";

const contactMethods = [
  {
    icon: Phone,
    title: "Call us",
    value: "+44 (0) 123 456 7890",
    desc: "Mon-Fri, 9am-5pm GMT",
  },
  {
    icon: Mail,
    title: "Email us",
    value: "hello@erpexperts.co.uk",
    desc: "We'll respond within 24 hours",
  },
  {
    icon: MapPin,
    title: "Visit us",
    value: "London, UK",
    desc: "By appointment only",
  },
];

export default function Contact() {
  return (
    <div className="min-h-screen overflow-x-hidden">
      <Navbar />

      {/* Hero */}
      <section className="pt-(--space-4xl) pb-(--space-2xl) md:pb-(--space-3xl)">
        <div className="container">
          <div className="max-w-5xl">
            <p className="text-label text-primary mb-md md:mb-lg">Contact</p>
            <h1 className="text-hero mb-xl md:mb-2xl">
              Let's
              <br />
              <span className="text-primary">talk.</span>
            </h1>
            <p className="text-lg md:text-xl text-muted" style={{ maxWidth: "800px" }}>
              Ready to transform your business with NetSuite? Have questions about our services?
              We'd love to hear from you.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="section-padding-lg border-t border-(--color-text)/10">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-2xl md:gap-3xl">
            {/* Form */}
            <div>
              <h2 className="mb-lg md:mb-xl">Send us a message</h2>
              <form className="flex flex-col gap-lg md:gap-xl">
                <div className="grid sm:grid-cols-2 gap-lg md:gap-xl">
                  <div>
                    <label className="text-label mb-sm block">First name</label>
                    <div className="h-14 md:h-16 rounded-2xl border border-(--color-text)/10 bg-(--color-bg-light)" />
                  </div>
                  <div>
                    <label className="text-label mb-sm block">Last name</label>
                    <div className="h-14 md:h-16 rounded-2xl border border-(--color-text)/10 bg-(--color-bg-light)" />
                  </div>
                </div>
                <div>
                  <label className="text-label mb-sm block">Email</label>
                  <div className="h-14 md:h-16 rounded-2xl border border-(--color-text)/10 bg-(--color-bg-light)" />
                </div>
                <div>
                  <label className="text-label mb-sm block">Company</label>
                  <div className="h-14 md:h-16 rounded-2xl border border-(--color-text)/10 bg-(--color-bg-light)" />
                </div>
                <div>
                  <label className="text-label mb-sm block">What can we help with?</label>
                  <div className="h-14 md:h-16 rounded-2xl border border-(--color-text)/10 bg-(--color-bg-light)" />
                </div>
                <div>
                  <label className="text-label mb-sm block">Message</label>
                  <div className="h-40 md:h-48 rounded-2xl border border-(--color-text)/10 bg-(--color-bg-light)" />
                </div>
                <button className="btn btn-primary btn-lg w-full sm:w-auto justify-center">
                  Send message
                  <ArrowRight className="w-5 h-5 md:w-6 md:h-6" />
                </button>
              </form>
            </div>

            {/* Contact Info */}
            <div>
              <h2 className="mb-lg md:mb-xl">Get in touch</h2>
              <p className="text-base md:text-lg text-muted mb-xl md:mb-2xl">
                Prefer to reach out directly? Here's how you can contact us.
              </p>
              <div className="flex flex-col gap-lg md:gap-xl">
                {contactMethods.map((method, i) => (
                  <div key={i} className="flex gap-lg md:gap-xl">
                    <div className="icon-box icon-box-md rounded-2xl bg-(--color-primary)/10 shrink-0">
                      <method.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-label text-muted mb-xs">{method.title}</p>
                      <p className="text-lg md:text-xl font-bold mb-xs">{method.value}</p>
                      <p className="text-base text-muted">{method.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Response Time */}
              <div className="mt-xl md:mt-2xl p-(--space-xl) md:p-(--space-2xl) rounded-3xl bg-(--color-bg-light)">
                <div className="flex items-center gap-md mb-md">
                  <Clock className="w-5 h-5 text-primary" />
                  <p className="text-label">Response Time</p>
                </div>
                <p className="text-base md:text-lg text-muted">
                  We aim to respond to all enquiries within 24 hours during business days. For
                  urgent matters, give us a call.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* NETscore CTA */}
      <section className="section-padding border-t border-(--color-text)/10">
        <div className="container">
          <div className="rounded-3xl bg-dark p-(--space-xl) md:p-(--space-3xl) text-center">
            <p className="text-label text-primary mb-sm md:mb-md">Free Assessment</p>
            <h3 className="text-(--color-text-on-dark) mb-lg md:mb-xl">Not sure where to start?</h3>
            <p className="text-base md:text-lg text-(--color-text-on-dark-muted) mb-xl md:mb-2xl max-w-2xl mx-auto">
              Get your free NETscore assessment. We'll analyse your current systems and show you
              exactly how NetSuite could transform your business.
            </p>
            <button className="btn btn-primary btn-lg w-full sm:w-auto justify-center">
              Get your free NETscore
              <ArrowRight className="w-5 h-5 md:w-6 md:h-6" />
            </button>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="section-padding-lg">
        <div className="container text-center">
          <h1 className="text-hero mb-xl md:mb-2xl">
            Ready to unlock your
            <span className="block text-primary">business potential?</span>
          </h1>
          <p className="text-lg md:text-xl text-muted mb-2xl md:mb-3xl max-w-xl mx-auto">
            Let's have a conversation about how we can help.
          </p>
          <div className="flex flex-col sm:flex-row gap-md md:gap-lg justify-center">
            <button className="btn btn-primary btn-lg w-full sm:w-auto justify-center">
              Book a call
              <ArrowRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      </section>

      <Footer />
      <BackToTop />
    </div>
  );
}
