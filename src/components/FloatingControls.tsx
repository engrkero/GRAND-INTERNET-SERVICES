import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";
import { CEO_DATA } from "../data";

export default function FloatingControls() {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [phone, setPhone] = useState(CEO_DATA.phone);

  // Monitor scroll height to show/hide back-to-top button
  useEffect(() => {
    const handleScroll = () => {
      // Show when the user scrolls past 500px (past the Hero section)
      if (window.scrollY > 500) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Listen to Firestore real-time phone number so WhatsApp link is always accurate and synced to db
  useEffect(() => {
    const docRef = doc(db, "ceo_profile", "main");
    const unsubscribe = onSnapshot(
      docRef,
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          if (data.phone) {
            setPhone(data.phone);
          }
        }
      },
      (error) => {
        console.warn("Could not retrieve real-time phone for WhatsApp, using fallback:", error.message);
      }
    );
    return () => unsubscribe();
  }, []);

  // Trigger smooth scroll back to top
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  // Build prefilled WhatsApp message template
  const cleanPhone = phone.replace(/\D/g, "");
  // Standard Nigerian prefix is 234. If phone doesn't have it, prepend 234 (substituting the initial 0)
  const waTarget = cleanPhone.startsWith("234")
    ? cleanPhone
    : cleanPhone.startsWith("0")
    ? `234${cleanPhone.slice(1)}`
    : `234${cleanPhone}`;

  const messageText = encodeURIComponent(
    "Greetings Augustine."
  );
  
  const whatsappUrl = `https://wa.me/${waTarget}?text=${messageText}`;

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-center gap-3" id="floating-actions-container">
      {/* 1. FLOATING BACK TO TOP BUTTON */}
      <button
        onClick={scrollToTop}
        className={`flex h-12 w-12 items-center justify-center rounded-full bg-black/90 hover:bg-[#990000] text-white border border-white/20 shadow-lg backdrop-blur-md transition-all duration-300 transform outline-none focus:ring-2 focus:ring-[#990000]/40 ${
          showScrollTop
            ? "translate-y-0 opacity-100 scale-100"
            : "translate-y-10 opacity-0 scale-75 pointer-events-none"
        }`}
        aria-label="Back to top"
        id="scroll-to-top-btn"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="animate-pulse"
        >
          <polyline points="18 15 12 9 6 15"></polyline>
        </svg>
      </button>

      {/* 2. FLOATING WHATSAPP CHAT BUTTON */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl hover:shadow-[#25D366]/40 transition-all duration-300 hover:scale-110 active:scale-95 border border-white/10 outline-none focus:ring-4 focus:ring-[#25D366]/50"
        aria-label="Chat with CEO on WhatsApp"
        id="floating-whatsapp-btn"
      >
        {/* Glowing pulse ring animation */}
        <span className="absolute inset-0 rounded-full bg-[#25D366]/20 animate-ping opacity-60"></span>
        
        {/* WhatsApp Icon SVG */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 448 512"
          className="h-7 w-7 fill-white"
        >
          <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L3.9 480l117.7-30.9c32.4 17.7 68.9 27 106.2 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7 .9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" />
        </svg>

        {/* Hover label tooltip */}
        <span className="absolute right-16 top-1/2 -translate-y-1/2 scale-75 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-300 bg-white border border-gray-100 text-black text-[10px] font-bold tracking-wider uppercase px-3.5 py-2.5 rounded-2xl shadow-xl pointer-events-none whitespace-nowrap z-50">
          Chat with CEO
        </span>
      </a>
    </div>
  );
}
