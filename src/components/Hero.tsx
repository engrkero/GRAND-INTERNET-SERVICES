export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#fafafa] py-32 sm:py-40 text-gray-900 border-b border-gray-100" id="hero-section">
      {/* Background Decorative Gradient Radial Leaks - Very soft brand red and gray */}
      <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-red-100/40 rounded-full filter blur-[130px] opacity-60 pointer-events-none"></div>
      <div className="absolute right-10 bottom-10 w-[400px] h-[400px] bg-gray-250 rounded-full filter blur-[100px] opacity-40 pointer-events-none"></div>
      <div className="absolute top-1/2 right-1/4 w-[250px] h-[250px] bg-[#990000]/5 rounded-full filter blur-[90px] opacity-50 pointer-events-none"></div>

      {/* Futuristic Grid Pattern Mesh */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e8e8e8_1px,transparent_1px),linear-gradient(to_bottom,#e8e8e8_1px,transparent_1px)] bg-[size:5rem_5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_80%,transparent_100%)] opacity-45"></div>

      <div className="relative mx-auto max-w-5xl px-6 text-center z-10">
        {/* Company Small Banner tag */}
        <div className="inline-flex items-center gap-1.5 rounded-full border border-gray-200/80 bg-white/70 backdrop-blur-md px-4 py-1.5 text-xs font-bold tracking-widest text-gray-600 uppercase mb-8 shadow-sm">
          <span className="flex h-1.5 w-1.5 rounded-full bg-[#990000] animate-ping"></span>
          Grand Internet Services
        </div>

        {/* Motive Banner Card with Glassmorphism / Web3 layout */}
        <div className="relative mx-auto max-w-4xl glass-panel p-10 sm:p-14 rounded-3xl shadow-xl shadow-red-950/5 overflow-hidden mb-10 text-center border border-white/70" id="hero-motto-container">
          {/* Subtle geometric circles */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-100/20 rounded-full -mr-20 -mt-20 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gray-100/35 rounded-full -ml-16 -mb-16 pointer-events-none"></div>

          <h1 className="relative z-10 font-display text-4xl sm:text-6xl font-extrabold leading-tight text-black tracking-tight" id="hero-motto">
            “Customer services,<br />
            <span className="bg-gradient-to-r from-[#990000] via-red-600 to-rose-700 bg-clip-text text-transparent italic font-bold">
              We make it even better.
            </span>”
          </h1>
        </div>

        {/* Description text */}
        <p className="mt-8 text-base sm:text-lg leading-relaxed text-gray-600 max-w-2xl mx-auto font-medium">
          Providing lightning-fast, ultra-secure, and error-free portal registration, bio-metric validation, and official UTME/NYSC printing services. We are the trusted connection to your academic milestones.
        </p>

        {/* Call to Actions - Hardware accelerated transitions */}
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <a
            href="#services"
            className="rounded-full bg-black px-8 py-4 text-xs font-bold tracking-widest text-white transition-[transform,opacity] duration-300 hover:scale-[1.04] hover:bg-[#990000] hover:shadow-lg hover:shadow-red-950/10 active:scale-[0.98] cursor-pointer"
          >
            EXPLORE OUR SERVICES
          </a>
          <a
            href="#ceo"
            className="rounded-full border border-gray-200/85 bg-white/50 glass-panel px-8 py-4 text-xs font-bold tracking-widest text-[#141414] transition-[transform,opacity] duration-300 hover:scale-[1.04] hover:bg-white hover:border-gray-300 active:scale-[0.98] cursor-pointer shadow-sm"
          >
            MEET THE CEO
          </a>
        </div>

        {/* Quick stats / Features row */}
        <div className="mt-24 grid grid-cols-2 gap-y-10 gap-x-4 border-t border-gray-200/60 pt-12 sm:grid-cols-4">
          <div className="px-2">
            <div className="font-display text-4xl font-extrabold text-[#990000]" id="stat-1">100%</div>
            <div className="mt-1.5 text-[10px] tracking-widest text-gray-500 font-bold uppercase">Accuracy Rate</div>
          </div>
          <div className="px-2">
            <div className="font-display text-4xl font-extrabold text-black" id="stat-2">7+</div>
            <div className="mt-1.5 text-[10px] tracking-widest text-gray-500 font-bold uppercase">Core Portals</div>
          </div>
          <div className="px-2">
            <div className="font-display text-4xl font-extrabold text-black" id="stat-3">Inst.</div>
            <div className="mt-1.5 text-[10px] tracking-widest text-gray-500 font-bold uppercase">Result Printing</div>
          </div>
          <div className="px-2">
            <div className="font-display text-4xl font-extrabold text-red-650" id="stat-4">24/7</div>
            <div className="mt-1.5 text-[10px] tracking-widest text-gray-500 font-bold uppercase">Live Support</div>
          </div>
        </div>
      </div>
    </section>
  );
}
