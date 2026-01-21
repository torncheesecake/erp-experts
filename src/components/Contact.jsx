/**
 * ERP Experts Contact Page
 */

import { ArrowRight, Mail, Phone, MapPin, ExternalLink } from "lucide-react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import BackToTop from "./BackToTop";

const locations = [
  {
    name: "Stafford (HQ Europe)",
    address: "Dalton House, Lakhpur Court, Staffordshire Technology Park, Stafford. ST18 0FX.",
    mapUrl:
      "https://maps.google.com/?q=Dalton+House+Lakhpur+Court+Staffordshire+Technology+Park+Stafford+ST18+0FX",
  },
  {
    name: "Manchester",
    address: "Pepper House, Pepper Rd, Hazel Grove, Stockport SK7 5DP.",
    mapUrl: "https://maps.google.com/?q=Pepper+House+Pepper+Rd+Hazel+Grove+Stockport+SK7+5DP",
  },
  {
    name: "Dubai (HQ MENA)",
    address: "552-0, Al Goze First, Dubai, United Arab Emirates.",
    mapUrl: "https://maps.google.com/?q=Al+Goze+First+Dubai",
  },
];

export default function Contact() {
  return (
    <div className="min-h-screen overflow-x-hidden">
      <Navbar />

      {/* Hero */}
      <section className="min-h-[50vh] md:min-h-[60vh] flex items-center relative overflow-hidden pt-(--space-4xl)">
        {/* Offset triangle */}
        <div
          className="absolute top-1/2 hidden md:block"
          style={{
            left: "75%",
            transform: "translateX(calc(-50% + 80px)) translateY(calc(-50% + 30px))",
            width: "900px",
            height: "772px",
            clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
            backgroundColor: "var(--color-primary)",
            opacity: 0.2,
          }}
        />
        {/* Main triangle */}
        <div
          className="absolute top-1/2 hidden md:block"
          style={{
            left: "75%",
            transform: "translateX(-50%) translateY(-50%)",
            width: "920px",
            height: "789px",
            clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
            overflow: "hidden",
          }}
        >
          <img
            src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=1000&q=80"
            alt=""
            className="w-full h-full object-cover"
            style={{ opacity: 0.5 }}
          />
        </div>
        <div className="container relative z-10">
          <div className="max-w-3xl">
            <p className="text-label text-primary mb-md">Contact</p>
            <h1 className="text-hero" style={{ marginBottom: "var(--space-xl)" }}>
              Let's <span className="text-primary">talk</span>.
            </h1>
            <p className="text-lg md:text-xl text-muted">
              Not sure where to start with ERP Software? Fill in your details and one of our experts
              will get back to you to help find the right solution for your business.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="section-padding-lg border-t border-(--color-text)/10">
        <div className="container">
          <div className="grid lg:grid-cols-5 gap-2xl md:gap-3xl">
            {/* Form - Takes more space */}
            <div className="lg:col-span-3">
              <div className="p-(--space-xl) md:p-(--space-2xl) rounded-2xl md:rounded-3xl border border-(--color-text)/10">
                <h4 style={{ marginBottom: "var(--space-xl)" }}>Send us a message</h4>
                <form className="flex flex-col gap-lg">
                  <div className="grid sm:grid-cols-2 gap-lg">
                    <div>
                      <label className="text-base font-bold mb-sm block">First name *</label>
                      <input
                        type="text"
                        required
                        className="w-full h-14 px-lg rounded-xl border border-(--color-text)/10 bg-white text-base focus:outline-none focus:border-(--color-primary)"
                      />
                    </div>
                    <div>
                      <label className="text-base font-bold mb-sm block">Last name *</label>
                      <input
                        type="text"
                        required
                        className="w-full h-14 px-lg rounded-xl border border-(--color-text)/10 bg-white text-base focus:outline-none focus:border-(--color-primary)"
                      />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-lg">
                    <div>
                      <label className="text-base font-bold mb-sm block">Email *</label>
                      <input
                        type="email"
                        required
                        className="w-full h-14 px-lg rounded-xl border border-(--color-text)/10 bg-white text-base focus:outline-none focus:border-(--color-primary)"
                      />
                    </div>
                    <div>
                      <label className="text-base font-bold mb-sm block">Phone</label>
                      <input
                        type="tel"
                        className="w-full h-14 px-lg rounded-xl border border-(--color-text)/10 bg-white text-base focus:outline-none focus:border-(--color-primary)"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-base font-bold mb-sm block">Company</label>
                    <input
                      type="text"
                      className="w-full h-14 px-lg rounded-xl border border-(--color-text)/10 bg-white text-base focus:outline-none focus:border-(--color-primary)"
                    />
                  </div>
                  <div>
                    <label className="text-base font-bold mb-sm block">Message *</label>
                    <textarea
                      required
                      rows={5}
                      className="w-full p-lg rounded-xl border border-(--color-text)/10 bg-white text-base focus:outline-none focus:border-(--color-primary) resize-none"
                    />
                  </div>
                  <button className="btn btn-primary btn-lg w-full sm:w-auto justify-center">
                    Submit
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </form>
              </div>
            </div>

            {/* Contact Info Sidebar */}
            <div className="lg:col-span-2 flex flex-col gap-lg">
              {/* Email Card */}
              <div className="p-(--space-xl) rounded-2xl bg-(--color-primary)/5 border border-(--color-primary)/20">
                <div className="flex items-center gap-md mb-lg">
                  <div
                    className="shrink-0 flex items-end justify-center"
                    style={{
                      width: "40px",
                      height: "35px",
                      clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
                      backgroundColor: "var(--color-primary)",
                    }}
                  >
                    <Mail className="w-4 h-4 text-white mb-1" />
                  </div>
                  <h6>Email</h6>
                </div>
                <p className="text-base text-muted mb-md">
                  Drop us an email with your project details and our team will get back to you with
                  tailored advice.
                </p>
                <a
                  href="mailto:hello@erpexperts.co.uk"
                  className="text-lg font-bold text-primary hover:underline"
                >
                  hello@erpexperts.co.uk
                </a>
              </div>

              {/* Phone Card */}
              <div className="p-(--space-xl) rounded-2xl bg-(--color-primary)/5 border border-(--color-primary)/20">
                <div className="flex items-center gap-md mb-lg">
                  <div
                    className="shrink-0 flex items-end justify-center"
                    style={{
                      width: "40px",
                      height: "35px",
                      clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
                      backgroundColor: "var(--color-primary)",
                    }}
                  >
                    <Phone className="w-4 h-4 text-white mb-1" />
                  </div>
                  <h6>Call</h6>
                </div>
                <p className="text-base text-muted mb-md">
                  Prefer to chat? Give us a call. Our team is ready to listen and provide expert
                  advice.
                </p>
                <a
                  href="tel:+441785336253"
                  className="text-lg font-bold text-primary hover:underline"
                >
                  01785 336 253
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Locations */}
      <section className="section-padding-lg border-t border-(--color-text)/10">
        <div className="container">
          <div className="text-center mb-xl md:mb-2xl">
            <p className="text-label text-primary mb-md">Our Offices</p>
            <h3>Locations</h3>
          </div>
          <div className="grid md:grid-cols-3 gap-lg">
            {locations.map((location, i) => (
              <div
                key={i}
                className="p-(--space-xl) md:p-(--space-2xl) rounded-2xl border border-(--color-text)/10 hover:border-(--color-primary)/30 transition-colors"
              >
                <div className="flex items-center gap-md mb-lg">
                  <div
                    className="shrink-0 flex items-end justify-center"
                    style={{
                      width: "40px",
                      height: "35px",
                      clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
                      backgroundColor: "var(--color-primary)",
                    }}
                  >
                    <MapPin className="w-4 h-4 text-white mb-1" />
                  </div>
                  <h6>{location.name}</h6>
                </div>
                <p className="text-base text-muted mb-lg">{location.address}</p>
                <p className="text-sm text-muted mb-md">Visits by appointment only</p>
                <a
                  href={location.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-sm text-base font-bold text-primary hover:underline"
                >
                  View on map
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding-lg">
        <div className="container">
          <div className="rounded-2xl md:rounded-3xl p-(--space-xl) md:p-(--space-3xl) bg-(--color-bg-dark) text-center relative overflow-hidden">
            {/* Decorative triangle */}
            <div
              className="absolute top-0 right-0 opacity-10 hidden md:block"
              style={{
                width: "300px",
                height: "260px",
                clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
                backgroundColor: "var(--color-primary)",
                transform: "translateX(80px) translateY(-80px)",
              }}
            />
            <div className="relative z-10">
              <p className="text-label text-primary mb-md">Free Assessment</p>
              <h3
                className="text-(--color-text-on-dark)"
                style={{ marginBottom: "var(--space-2xl)" }}
              >
                Not sure where to start?
              </h3>
              <button className="btn btn-accent btn-lg w-full sm:w-auto justify-center">
                Get your free NETscore
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <BackToTop />
    </div>
  );
}
