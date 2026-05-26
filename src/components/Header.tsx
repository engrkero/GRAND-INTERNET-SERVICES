import { useState, useEffect } from "react";
import { auth } from "../lib/firebase";
import Logo from "./Logo";

export default function Header() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = () => {
      const stored = sessionStorage.getItem("admin_session");
      setIsAdmin(!!stored || !!auth.currentUser);
    };

    checkAdmin();
    const handleAuthChange = () => {
      checkAdmin();
    };

    window.addEventListener("admin_auth_state_changed", handleAuthChange);
    const unsubscribeAuth = auth.onAuthStateChanged(() => {
      checkAdmin();
    });

    return () => {
      window.removeEventListener("admin_auth_state_changed", handleAuthChange);
      unsubscribeAuth();
    };
  }, []);

  return (
    <header className={`fixed left-0 right-0 z-50 w-full glass-nav transition-all duration-300 ${isAdmin ? "top-[82px] sm:top-12" : "top-0"}`} id="app-header">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Logo Container */}
        <Logo />

        {/* Navigation Elements */}
        <nav className="hidden md:flex items-center gap-8">
          <a
            href="#services"
            className="text-sm font-semibold tracking-wide text-gray-700 transition-[color,transform] duration-300 hover:text-[#990000] hover:scale-105"
          >
            OUR SERVICES
          </a>
          <a
            href="#ceo"
            className="text-sm font-semibold tracking-wide text-gray-700 transition-[color,transform] duration-300 hover:text-[#990000] hover:scale-105"
          >
            LEADERSHIP
          </a>
          <a
            href="#contact"
            className="rounded-full bg-black px-5 py-2.5 text-xs font-bold tracking-wider text-white transition-[color,transform] duration-300 hover:bg-[#990000] hover:scale-105"
          >
            GET IN TOUCH
          </a>
        </nav>

        {/* Small Screen Button */}
        <a
          href="#services"
          className="md:hidden rounded-full bg-[#990000] p-2 text-white hover:bg-black transition-all"
          aria-label="View services"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="4" y1="12" x2="20" y2="12"></line>
            <line x1="4" y1="6" x2="20" y2="6"></line>
            <line x1="4" y1="18" x2="20" y2="18"></line>
          </svg>
        </a>
      </div>
    </header>
  );
}
