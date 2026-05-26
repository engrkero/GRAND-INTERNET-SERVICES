import { useState, SyntheticEvent } from "react";

export default function Footer() {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: SyntheticEvent) => {
    e.preventDefault();
    if (name && message) {
      setFormSubmitted(true);
      setTimeout(() => {
        setFormSubmitted(false);
        setName("");
        setMessage("");
      }, 5000);
    }
  };

  return (
    <footer className="bg-[#fafafa] text-gray-500 border-t border-gray-200/60 relative" id="contact">
      {/* Soft overlay leak */}
      <div className="absolute top-0 right-10 w-80 h-80 bg-red-50/10 rounded-full filter blur-[100px] opacity-40 pointer-events-none"></div>

      {/* Footer Top Content Block */}
      <div className="mx-auto max-w-7xl px-6 py-20 lg:py-24 relative z-10">
        <div className="grid gap-12 lg:grid-cols-12">
          
          {/* Column 1: Info and Branding */}
          <div className="space-y-6 lg:col-span-4" id="footer-branding-col">
            <div className="flex items-center gap-3">
              <span className="flex h-2.5 w-2.5 rounded-full bg-[#990000]" />
              <span className="font-display text-lg font-black tracking-widest text-[#990000] uppercase">
                GRAND INTERNET
              </span>
            </div>
            
            <p className="text-xs leading-relaxed text-gray-600 max-w-sm font-semibold">
              We process academic applications, Post-UTME portals, biometric mobilization, and official transcript verifications with unmatched speed and zero data errors.
            </p>

            <div className="font-mono text-[9px] text-gray-400 tracking-widest uppercase">
              EST. CALABAR • GRAND INTERNET SERVICES LTD.
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-4 lg:col-span-3 lg:col-start-6" id="footer-links-col">
            <h4 className="font-display text-xs font-extrabold text-black tracking-widest uppercase">
              PORTALS & LINKS
            </h4>
            <div className="h-1 w-6 bg-[#990000] rounded-full" />
            <ul className="space-y-3.5 text-xs font-bold text-gray-600">
              <li>
                <a href="#hero-section" className="hover:text-[#990000] transition-colors duration-200 flex items-center gap-1">
                  Home / Vision
                </a>
              </li>
              <li>
                <a href="#services" className="hover:text-[#990000] transition-colors duration-200 flex items-center gap-1">
                  Services Catalog
                </a>
              </li>
              <li>
                <a href="#ceo" className="hover:text-[#990000] transition-colors duration-200 flex items-center gap-1">
                  Leadership Profile
                </a>
              </li>
              <li>
                <a href="mailto:gsunical@gmail.com" className="text-[#990000] hover:underline hover:text-red-700 transition-colors">
                  gsunical@gmail.com
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact Inquiry Form */}
          <div className="space-y-4 lg:col-span-4" id="footer-form-col">
            <h4 className="font-display text-xs font-extrabold text-black tracking-widest uppercase">
              SEND DIRECT INQUIRY
            </h4>
            <div className="h-1 w-6 bg-[#990000] rounded-full" />

            {formSubmitted ? (
              <div className="rounded-2xl bg-red-50 border border-red-100 p-5 text-center text-xs text-red-800 font-semibold shadow-sm animate-fade-in">
                <p className="font-bold">Thank you, {name}!</p>
                <p className="mt-1">Inquiry queued dynamically for the GIS desk. We will reach you back instantly.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3.5">
                <input
                  type="text"
                  placeholder="Your Name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white/70 px-4 py-3 text-xs text-black placeholder-gray-400 focus:border-[#990000] focus:ring-1 focus:ring-[#990000] outline-none transition-colors"
                />
                <textarea
                  placeholder="Describe your registration task (e.g., UTME, NYSC mobile)"
                  required
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white/70 px-4 py-3 text-xs text-black placeholder-gray-400 focus:border-[#990000] focus:ring-1 focus:ring-[#990000] outline-none resize-none transition-colors"
                />
                <button
                  type="submit"
                  className="w-full rounded-full bg-black hover:bg-[#990000] py-3 text-xs font-black tracking-widest text-white transition-[transform,background-color] duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer uppercase shadow-sm"
                >
                  DISPATCH TO PORTAL DESK
                </button>
              </form>
            )}
          </div>

        </div>
      </div>

      {/* Footer Bottom Base Bar */}
      <div className="bg-white py-8 border-t border-gray-200/50 text-center text-[10px] tracking-widest font-mono text-gray-400">
        <div className="mx-auto max-w-7xl px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <span className="font-semibold">© {new Date().getFullYear()} GRAND INTERNET SERVICES. ALL RIGHTS RESERVED.</span>
          <span className="text-gray-500 font-medium">
            Designed and developed by:{" "}
            <a
              href="https://kgsc.online/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-black text-black hover:text-[#990000] relative after:absolute after:bottom-0 after:left-0 after:h-[1.5px] after:w-full after:origin-right after:scale-x-0 after:bg-[#990000] after:transition-transform after:duration-300 hover:after:origin-left hover:after:scale-x-100 uppercase tracking-widest inline-block transition-colors duration-300"
            >
              KERO GRAPHICS STUDIO CODE
            </a>
          </span>
        </div>
      </div>

    </footer>
  );
}
