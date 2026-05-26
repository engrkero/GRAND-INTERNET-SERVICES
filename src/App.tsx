import Header from "./components/Header";
import Hero from "./components/Hero";
import ServicesSection from "./components/ServicesSection";
import CEOSection from "./components/CEOSection";
import Footer from "./components/Footer";
import FloatingControls from "./components/FloatingControls";

export default function App() {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans antialiased selection:bg-[#990000] selection:text-white relative overflow-hidden" id="main-app">
      {/* Animated Mesh Gradient Background (Clean Light Mode glass environment) */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Soft Pinkish/Reddish blob */}
        <div className="absolute -top-[10%] -left-[10%] w-[55%] h-[55%] rounded-full bg-red-100/20 filter blur-[120px] mesh-blob-1"></div>
        {/* Soft Silvery/Grayish blob */}
        <div className="absolute -bottom-[10%] -right-[10%] w-[65%] h-[65%] rounded-full bg-slate-100/40 filter blur-[150px] mesh-blob-2"></div>
      </div>

      {/* Structural Headers and Layout Components */}
      <Header />
      <main className="pt-16 relative z-10">
        <Hero />
        <ServicesSection />
        <CEOSection />
      </main>
      <Footer />
      
      {/* Dynamic floating widgets */}
      <FloatingControls />
    </div>
  );
}

