/**
 * ERP Experts Contact Page
 */

import { useState } from "react";
import {
  ArrowRight,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  Check,
  AlertCircle,
  Loader2,
} from "lucide-react";
import SEO from "../../components/ui/SEO";
import { trackCTAClick } from "../../components/Analytics";

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
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    message: "",
  });
  const [status, setStatus] = useState("idle"); // idle, submitting, success, error
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    try {
      // NetSuite form submission
      const nsData = {
        formId: "f022774d-451f-4a5c-88bc-331a49876a4b",
        submissions: {
          first_name_abae: formData.firstName,
          last_name_d97c: formData.lastName,
          email_5139: formData.email,
          phone_4c77: formData.phone || "",
          company: formData.company || "",
          long_answer_3524: formData.message,
        },
      };

      const response = await fetch(import.meta.env.VITE_NETSUITE_FORM_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ entity: nsData }),
      });

      if (response.ok) {
        setStatus("success");
        trackCTAClick("contact_form_submit", "contact");
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          company: "",
          message: "",
        });
      } else {
        throw new Error("Failed to submit form");
      }
    } catch (error) {
      setStatus("error");
      setErrorMessage(
        "Failed to send message. Please try again or email us directly at hello@erpexperts.co.uk",
      );
    }
  };

  return (
    <main id="main-content">
      <SEO
        title="Contact Us"
        description="Get in touch with ERP Experts. Our NetSuite specialists are ready to help transform your business. Offices in Stafford, Manchester, and Dubai."
        path="/contact"
        keywords="contact ERP Experts, NetSuite consultation, NetSuite support UK"
      />

      {/* Hero */}
      <section
        className="flex items-center relative overflow-hidden"
        style={{ paddingTop: "160px", paddingBottom: "30px" }}
      >
        {/* Offset triangle */}
        <div
          className="absolute top-1/2 hidden lg:block"
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
          className="absolute top-1/2 hidden lg:block"
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

                {/* Success Message */}
                {status === "success" && (
                  <div className="mb-xl p-lg rounded-xl bg-green-50 border border-green-200 flex items-start gap-md">
                    <Check className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-green-800">Message sent successfully!</p>
                      <p className="text-sm text-green-700">
                        Thank you for reaching out. One of our experts will get back to you shortly.
                      </p>
                    </div>
                  </div>
                )}

                {/* Error Message */}
                {status === "error" && (
                  <div className="mb-xl p-lg rounded-xl bg-red-50 border border-red-200 flex items-start gap-md">
                    <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-red-800">Failed to send message</p>
                      <p className="text-sm text-red-700">{errorMessage}</p>
                      <p className="text-sm text-red-700 mt-sm">
                        You can also reach us directly at{" "}
                        <a href="mailto:hello@erpexperts.co.uk" className="underline font-bold">
                          hello@erpexperts.co.uk
                        </a>
                      </p>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-lg">
                  <div className="grid sm:grid-cols-2 gap-lg">
                    <div>
                      <label htmlFor="firstName" className="text-base font-bold mb-sm block">
                        First name *
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                        disabled={status === "submitting"}
                        className="w-full h-14 px-lg rounded-xl border border-(--color-text)/10 bg-white text-base focus:outline-none focus:border-(--color-primary) disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label htmlFor="lastName" className="text-base font-bold mb-sm block">
                        Last name *
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                        disabled={status === "submitting"}
                        className="w-full h-14 px-lg rounded-xl border border-(--color-text)/10 bg-white text-base focus:outline-none focus:border-(--color-primary) disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-lg">
                    <div>
                      <label htmlFor="email" className="text-base font-bold mb-sm block">
                        Email *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        disabled={status === "submitting"}
                        className="w-full h-14 px-lg rounded-xl border border-(--color-text)/10 bg-white text-base focus:outline-none focus:border-(--color-primary) disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label htmlFor="phone" className="text-base font-bold mb-sm block">
                        Phone
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        disabled={status === "submitting"}
                        className="w-full h-14 px-lg rounded-xl border border-(--color-text)/10 bg-white text-base focus:outline-none focus:border-(--color-primary) disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="company" className="text-base font-bold mb-sm block">
                      Company
                    </label>
                    <input
                      type="text"
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      disabled={status === "submitting"}
                      className="w-full h-14 px-lg rounded-xl border border-(--color-text)/10 bg-white text-base focus:outline-none focus:border-(--color-primary) disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label htmlFor="message" className="text-base font-bold mb-sm block">
                      Message *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={5}
                      disabled={status === "submitting"}
                      className="w-full p-lg rounded-xl border border-(--color-text)/10 bg-white text-base focus:outline-none focus:border-(--color-primary) resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={status === "submitting"}
                    className="btn btn-primary btn-lg w-full sm:w-auto justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {status === "submitting" ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        Submit
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
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
              <a
                href="https://ric-snwikqbv.scoreapp.com"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-accent btn-lg w-full sm:w-auto justify-center"
                onClick={() => trackCTAClick("contact_netscore_cta", "contact")}
              >
                Get your free NETscore
                <ArrowRight className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
