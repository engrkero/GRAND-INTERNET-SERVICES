import { SERVICES_DATA } from "../data";
import ScrollReveal from "./ScrollReveal";

export default function ServicesSection() {
  return (
    <section className="bg-white py-28 px-6 relative" id="services">
      {/* Subtle Web3 ambient glow leaks behind services */}
      <div className="absolute top-1/4 right-10 w-96 h-96 bg-gray-50 rounded-full filter blur-[120px] opacity-60 pointer-events-none"></div>
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-red-50/30 rounded-full filter blur-[100px] opacity-40 pointer-events-none"></div>

      <div className="mx-auto max-w-7xl relative z-10">
        
        {/* Section Header with tech-forward styling */}
        <ScrollReveal delayMs={100}>
          <div className="mb-20 text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-100 pb-10">
              <div>
                <span className="font-mono text-xs font-bold tracking-[0.25em] text-[#990000] uppercase block mb-3">
                  SECURE PORTAL CHANNELS
                </span>
                <h2 className="font-display text-3xl font-extrabold tracking-tight text-black sm:text-5xl" id="services-title">
                  OUR SERVICES
                </h2>
              </div>
              <p className="text-gray-500 max-w-md text-sm sm:text-base leading-relaxed font-sans font-medium">
                Grand Internet Services facilitates verified registrations and premium biometric applications with absolute speed and zero system delays.
              </p>
            </div>
          </div>
        </ScrollReveal>

        {/* Services Grid with high-fidelity glass cards and HW-accelerated motion */}
        <ScrollReveal delayMs={300} durationMs={1000}>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3" id="services-grid">
            {SERVICES_DATA.map((service, idx) => (
              <div
                key={service.id}
                className="group relative flex flex-col justify-between rounded-3xl border border-gray-200/60 bg-white/50 glass-panel p-8 transition-[transform,opacity] duration-300 ease-out hover:-translate-y-2 hover:bg-white/90 will-change-[transform,opacity] shadow-sm hover:shadow-lg hover:shadow-red-950/5"
                id={`service-card-${idx}`}
              >
                {/* Card Top Details */}
                <div>
                  <div className="flex items-start gap-4">
                    {/* Sleek, Web3-style glowing circular icons as custom bullet points */}
                    <div className="relative shrink-0 mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-red-50 border border-gray-100 shadow-sm transition-transform duration-300 group-hover:scale-110">
                      <span className="absolute inset-0 rounded-full bg-[#990000]/10 animate-ping opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                      <span className="h-3 w-3 rounded-full bg-gradient-to-br from-red-500 to-[#990000] border-2 border-white shadow-sm ring-2 ring-[#990000]/20"></span>
                    </div>

                    {/* Title */}
                    <div className="space-y-1">
                      <h3 className="font-display text-sm font-bold tracking-wide text-black group-hover:text-[#990000] transition-colors line-clamp-2 md:h-10 flex items-center">
                        {service.name}
                      </h3>
                    </div>
                  </div>
                  
                  {/* Description Text */}
                  <p className="mt-4 text-xs font-semibold leading-relaxed text-gray-500">
                    {service.description}
                  </p>
                </div>

                {/* Bottom decorative anchor style */}
                <div className="mt-8 pt-5 border-t border-gray-100/50 flex items-center justify-between">
                  <span className="font-mono text-[9px] font-bold text-gray-400 tracking-widest group-hover:text-[#990000] transition-colors">
                    SECURE NODE • {service.shortcut}
                  </span>
                  
                  {/* Micro pointer */}
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-50 border border-gray-100 group-hover:bg-[#990000] group-hover:text-white group-hover:border-transparent transition-all duration-300 transform group-hover:translate-x-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M5 12h14"></path>
                      <path d="m12 5 7 7-7 7"></path>
                    </svg>
                  </div>
                </div>

                {/* Red subtle left focus handle */}
                <div className="absolute top-8 bottom-8 left-0 w-[3px] rounded-r-3xl bg-transparent group-hover:bg-[#990000] transition-[background-color] duration-300"></div>
              </div>
            ))}
          </div>
        </ScrollReveal>
        
      </div>
    </section>
  );
}
