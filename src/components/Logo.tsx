import { useState, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";

interface LogoProps {
  showSlogan?: boolean;
  className?: string;
  iconOnly?: boolean;
}

export default function Logo({ showSlogan = true, className = "", iconOnly = false }: LogoProps) {
  const [branding, setBranding] = useState<{ logoUrl: string; faviconUrl?: string; slogan: string } | null>(null);

  useEffect(() => {
    // Load any locally stored offline draft first
    const stored = localStorage.getItem("branding_offline_draft");
    if (stored) {
      try {
        setBranding(JSON.parse(stored));
      } catch (_) {}
    }

    // Subscribe to DB branding updates
    const docRef = doc(db, "branding", "main");
    const unsubscribe = onSnapshot(docRef, 
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          setBranding({
            logoUrl: data.logoUrl || "",
            faviconUrl: data.faviconUrl || "",
            slogan: data.slogan || ""
          });
        }
      },
      (error) => {
        console.warn("Branding real-time sync offline or denied permission:", error.message);
      }
    );

    return () => unsubscribe();
  }, []);

  // Set high performance real-time custom favicon updates
  useEffect(() => {
    if (branding && branding.faviconUrl) {
      let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
      if (!link) {
        link = document.createElement("link");
        link.rel = "icon";
        document.getElementsByTagName("head")[0].appendChild(link);
      }
      link.href = branding.faviconUrl;
    }
  }, [branding]);

  const hasManualLogo = branding && branding.logoUrl;
  const sloganText = branding?.slogan !== undefined ? branding.slogan : "Customer Service, We Make It Even Better";

  return (
    <div className={`flex items-center gap-4 ${className}`} id="gis-main-logo">
      {/* Dynamic Uploader Brand Logo Icon */}
      <div className="relative shrink-0 flex items-center justify-center">
        {hasManualLogo ? (
          <img
            src={branding.logoUrl}
            alt="GRAND INTERNET SERVICES Logo"
            className="h-10 sm:h-12 md:h-14 w-auto max-w-[100px] sm:max-w-[125px] md:max-w-[165px] object-contain select-none rounded-sm transition-all duration-300"
            referrerPolicy="no-referrer"
            id="gis-custom-logo-img"
          />
        ) : (
          <svg
            width="120"
            height="104"
            viewBox="0 0 1000 866"
            className="h-9 sm:h-12 md:h-14 w-auto drop-shadow-sm select-none"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Outer Black Hexagon Frame */}
            <polygon
              points="500,10 950,260 950,606 500,856 50,606 50,260"
              fill="black"
            />
            {/* Inner White Hexagon Frame to create the outline separator effect */}
            <polygon
              points="500,56 910,283 910,583 500,810 90,583 90,283"
              fill="white"
            />

            {/* Letter 'G' block in deep grand-red, hugging the left hexagon slope with sharp geometry */}
            <path
              d="M 440,230 L 150,397 L 150,600 L 440,767 L 440,670 L 240,554 L 240,490 L 410,490 L 410,420 L 240,420 L 240,346 L 440,230 Z"
              fill="#990000"
            />

            {/* Central 'I' Column / Wireless Signal Tower with the Black WiFi arches above it */}
            {/* Red "I" pillar base */}
            <rect x="470" y="270" width="60" height="460" rx="4" fill="#990000" />
            
            {/* WiFi concentric signal arches directly above the 'I' pillar exactly like the logo */}
            {/* Central small black dot */}
            <circle cx="500" cy="210" r="14" fill="black" />
            {/* First inner arc */}
            <path
              d="M 457,185 A 50 50 0 0 1 543,185"
              stroke="black"
              strokeWidth="12"
              strokeLinecap="round"
              fill="none"
            />
            {/* Second middle arc */}
            <path
              d="M 422,165 A 90 90 0 0 1 578,165"
              stroke="black"
              strokeWidth="12"
              strokeLinecap="round"
              fill="none"
            />
            {/* Third outer arc */}
            <path
              d="M 387,145 A 130 130 0 0 1 613,145"
              stroke="black"
              strokeWidth="12"
              strokeLinecap="round"
              fill="none"
            />

            {/* Letter 'S' block in deep grand-red, hugging the right hexagon slope with sharp geometry */}
            <path
              d="M 560,330 L 560,230 L 850,397 L 850,470 L 660,530 L 660,590 L 850,700 L 850,767 L 560,767 L 560,670 L 760,554 L 760,490 L 560,420 L 560,330 Z"
              fill="#990000"
            />
          </svg>
        )}
      </div>

      {!iconOnly && (
        <div className="flex flex-col select-none leading-[0.95] gap-0.5 mt-0.5" id="gis-logo-text-col">
          <span className="font-logo text-xs xs:text-sm sm:text-base md:text-lg font-bold tracking-wider text-[#990000] uppercase">
            GRAND
          </span>
          <span className="font-logo text-[9px] xs:text-[10px] sm:text-xs md:text-sm font-bold tracking-wider uppercase text-[#111111]">
            INTER<span className="text-[#990000]">NET</span>
          </span>
          <span className="font-logo text-[9px] xs:text-[10px] sm:text-xs md:text-sm font-bold tracking-wider text-[#222222] uppercase">
            SERVICES
          </span>
          {showSlogan && (
            <span className="hidden xs:block text-[7px] sm:text-[8px] font-mono tracking-wider font-bold text-gray-500 mt-1">
              ...{sloganText}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
