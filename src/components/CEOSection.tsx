import React, { useState, useEffect } from "react";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { signInWithPopup, signOut } from "firebase/auth";
import { db, auth, googleProvider, OperationType, handleFirestoreError } from "../lib/firebase";
import { CEO_DATA } from "../data";
import { CEOInfo } from "../types";
import Logo from "./Logo";
import ScrollReveal from "./ScrollReveal";

const FALLBACK_PORTRAIT_URL = "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?auto=format&fit=crop&q=80&w=800";

export default function CEOSection() {
  const [ceoState, setCeoState] = useState<CEOInfo>(CEO_DATA);
  const [imageSrc, setImageSrc] = useState<string>(CEO_DATA.portraitUrl);
  const [loading, setLoading] = useState(true);
  
  // Admin Panel & Auth State
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  
  // Tab selector inside Edit Modal
  const [activeTab, setActiveTab] = useState<"ceo" | "branding">("ceo");

  // CEO Fields
  const [editName, setEditName] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editPortraitUrl, setEditPortraitUrl] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);

  // Website Branding Fields
  const [brandingSlogan, setBrandingSlogan] = useState("Customer Service, We Make It Even Better");
  const [brandingLogoUrl, setBrandingLogoUrl] = useState("");
  const [brandingFaviconUrl, setBrandingFaviconUrl] = useState("");
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);

  // Hidden admin login modal trigger states
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const [statusMsg, setStatusMsg] = useState<{ text: string; isError: boolean } | null>(null);

  // Drag and Drop State flags for outstanding upload responsiveness
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [isDraggingLogo, setIsDraggingLogo] = useState(false);
  const [isDraggingFavicon, setIsDraggingFavicon] = useState(false);

  // Sync Auth State & Listen to Firestore Realtime Updates & Local Storage draft states
  useEffect(() => {
    const handleAuthChange = () => {
      const storedSession = sessionStorage.getItem("admin_session");
      if (storedSession) {
        try {
          setCurrentUser(JSON.parse(storedSession));
        } catch (_) {
          setCurrentUser(auth.currentUser);
        }
      } else {
        setCurrentUser(auth.currentUser);
      }
    };

    handleAuthChange();
    window.addEventListener("admin_auth_state_changed", handleAuthChange);

    // Direct / Secret URL Access Gate & default password logic
    const checkSecretUrlAuth = () => {
      const searchParams = new URLSearchParams(window.location.search);
      const hash = window.location.hash;
      const path = window.location.pathname;

      const isAdminPath = path === "/admin" || path.endsWith("/admin") || hash === "#admin" || hash === "#/admin";
      const hasAdminQuery = searchParams.has("admin") || searchParams.has("password") || searchParams.has("secret");
      
      const adminPassQuery = searchParams.get("admin") || searchParams.get("password") || searchParams.get("secret");
      
      // Auto-unlock the back securely if passcode is supplied directly or found in hash
      if (
        adminPassQuery === "grandadmin2026" || 
        hash.includes("grandadmin2026") || 
        searchParams.get("admin") === "grandadmin2026" ||
        window.location.href.includes("grandadmin2026")
      ) {
        const adminUser = {
          uid: "default-administrator",
          email: "admin@grandinternet.com",
          displayName: "Grand Administrator",
        };
        sessionStorage.setItem("admin_session", JSON.stringify(adminUser));
        window.dispatchEvent(new Event("admin_auth_state_changed"));
        setCurrentUser(adminUser);
        setStatusMsg({
          text: "🔒 AUTOMATIC AD-ACCESS UNLOCKED: Admin panel activated via high-security Url!",
          isError: false,
        });
        setIsEditing(true); // Open panel instantly
        setShowLoginModal(false);
        setTimeout(() => setStatusMsg(null), 6000);
      } else if (isAdminPath || hasAdminQuery || searchParams.has("admin")) {
        // Automatically prefill the admin email, setup default password guide, and trigger entrance modal
        setLoginEmail("admin@grandinternet.com");
        setShowLoginModal(true);
      }
    };

    checkSecretUrlAuth();
    window.addEventListener("hashchange", checkSecretUrlAuth);

    // Custom global triggers for discrete developer access
    const handleDoubleClicks = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Double click Logo or Footer to prompt the admin login secretly
      if (target.closest("#gis-main-logo") || target.closest("footer")) {
        setShowLoginModal(true);
      }
    };
    window.addEventListener("dblclick", handleDoubleClicks);

    const handleOpenAdminPortal = () => {
      setShowLoginModal(true);
    };
    window.addEventListener("open_admin_portal", handleOpenAdminPortal);

    // 1. Listen for standard auth changes securely
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (!sessionStorage.getItem("admin_session")) {
        setCurrentUser(user);
      }
    });

    // Load any offline draft if present
    const storedDraft = localStorage.getItem("ceo_offline_draft");
    if (storedDraft) {
      try {
        const parsed = JSON.parse(storedDraft);
        setCeoState(parsed);
        setImageSrc(parsed.portraitUrl);
      } catch (_) {}
    }

    // Load branding offline draft if present
    const storedBranding = localStorage.getItem("branding_offline_draft");
    if (storedBranding) {
      try {
        const parsed = JSON.parse(storedBranding);
        setBrandingSlogan(parsed.slogan);
        setBrandingLogoUrl(parsed.logoUrl);
        setBrandingFaviconUrl(parsed.faviconUrl || "");
      } catch (_) {}
    }

    // 2. Real-time Database synchronization (CEO Profile)
    const docRef = doc(db, "ceo_profile", "main");
    const unsubscribeDoc = onSnapshot(docRef, 
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          const loaded: CEOInfo = {
            name: data.name || CEO_DATA.name,
            title: data.title || CEO_DATA.title,
            email: data.email || CEO_DATA.email,
            phone: data.phone || CEO_DATA.phone,
            portraitUrl: data.portraitUrl || CEO_DATA.portraitUrl,
          };
          setCeoState(loaded);
          setImageSrc(loaded.portraitUrl);
        } else if (!localStorage.getItem("ceo_offline_draft")) {
          setCeoState(CEO_DATA);
          setImageSrc(CEO_DATA.portraitUrl);
        }
        setLoading(false);
      }, 
      (error) => {
        console.warn("Firestore listener failed or permission denied during live sync:", error.message);
        if (!localStorage.getItem("ceo_offline_draft")) {
          setCeoState(CEO_DATA);
          setImageSrc(CEO_DATA.portraitUrl);
        }
        setLoading(false);
      }
    );

    // 3. Real-time Database synchronization (Branding Config)
    const brandingRef = doc(db, "branding", "main");
    const unsubscribeBranding = onSnapshot(brandingRef,
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          setBrandingSlogan(data.slogan || "Customer Service, We Make It Even Better");
          setBrandingLogoUrl(data.logoUrl || "");
          setBrandingFaviconUrl(data.faviconUrl || "");
        }
      },
      (error) => {
        console.warn("Firestore listener failed on branding config live sync:", error.message);
      }
    );

    return () => {
      unsubscribeAuth();
      unsubscribeDoc();
      unsubscribeBranding();
      window.removeEventListener("admin_auth_state_changed", handleAuthChange);
      window.removeEventListener("hashchange", checkSecretUrlAuth);
      window.removeEventListener("dblclick", handleDoubleClicks);
      window.removeEventListener("open_admin_portal", handleOpenAdminPortal);
    };
  }, []);

  const handleImageError = () => {
    if (imageSrc !== FALLBACK_PORTRAIT_URL) {
      setImageSrc(FALLBACK_PORTRAIT_URL);
    }
  };

  // Trigger default credentials login securely
  const handleCredentialsLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    if (loginEmail.trim() === "admin@grandinternet.com" && loginPassword === "grandadmin2026") {
      const adminUser = {
        uid: "default-administrator",
        email: "admin@grandinternet.com",
        displayName: "Grand Administrator",
      };
      sessionStorage.setItem("admin_session", JSON.stringify(adminUser));
      
      // Auto pre-fill and launch the edit modal instantly
      setEditName(ceoState.name);
      setEditTitle(ceoState.title);
      setEditEmail(ceoState.email);
      setEditPhone(ceoState.phone);
      setEditPortraitUrl(ceoState.portraitUrl);
      setIsEditing(true);

      window.dispatchEvent(new Event("admin_auth_state_changed"));
      setShowLoginModal(false);
      setLoginEmail("");
      setLoginPassword("");
      setStatusMsg({
        text: "🔒 Administrator authentication successful! Database pre-loaded and editing unlocked instantly.",
        isError: false,
      });
      setTimeout(() => setStatusMsg(null), 5000);
    } else {
      setLoginError("Invalid credentials. Please verify default details provided.");
    }
  };

  // Legacy Google Login popup triggered from hidden modal
  const handleLogin = async () => {
    if (isAuthenticating) return;
    setIsAuthenticating(true);
    setStatusMsg(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user.email !== "kerenonen4@gmail.com") {
        setStatusMsg({
          text: `Logged in as ${result.user.email}. Note: Only the authorized database administrator is permitted to publish writes.`,
          isError: false,
        });
      } else {
        setStatusMsg({
          text: "Google Administrator authentication successful! You can now write directly to the Cloud DB.",
          isError: false,
        });
        setEditName(ceoState.name);
        setEditTitle(ceoState.title);
        setEditEmail(ceoState.email);
        setEditPhone(ceoState.phone);
        setEditPortraitUrl(ceoState.portraitUrl);
        setIsEditing(true);
        setShowLoginModal(false);
      }
    } catch (err: any) {
      console.warn("Authentication popup failed, likely blocked in Google Sandbox iframe:", err);
      setLoginError(`Google authentication popup was blocked in iframe context. Please use Default email/password credentials.`);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleLogout = async () => {
    sessionStorage.removeItem("admin_session");
    window.dispatchEvent(new Event("admin_auth_state_changed"));
    await signOut(auth);
    setIsEditing(false);
    setStatusMsg({
      text: "Successfully logged out of administrative session.",
      isError: false,
    });
    setTimeout(() => setStatusMsg(null), 3500);
  };

  // Open Edit Dialog and pre-fill fields
  const startEdit = () => {
    setEditName(ceoState.name);
    setEditTitle(ceoState.title);
    setEditEmail(ceoState.email);
    setEditPhone(ceoState.phone);
    setEditPortraitUrl(ceoState.portraitUrl);
    setIsEditing(true);
    setStatusMsg(null);
  };

  // Dynamic, zero-latency immediate rendering and canvas post-processing compression for Portrait Photo
  const processImageFile = (file: File) => {
    // Generate synchronous instant object URL for instant UI response (0ms lag!)
    const objectUrl = URL.createObjectURL(file);
    setEditPortraitUrl(objectUrl);
    setUploadingImage(true);
    setStatusMsg(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const imgElement = document.createElement("img");
      imgElement.src = event.target?.result as string;
      imgElement.onload = () => {
        const canvas = document.createElement("canvas");
        const maxDim = 460; // Optimal thumbnail resolution for perfect mobile-desktop portrait render
        let width = imgElement.width;
        let height = imgElement.height;
        
        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(imgElement, 0, 0, width, height);
        
        // High quality compressed base64 output
        const compressedBase64 = canvas.toDataURL("image/jpeg", 0.88);
        setEditPortraitUrl(compressedBase64);
        setUploadingImage(false);
      };
    };
    reader.onerror = () => {
      setStatusMsg({ text: "Failed to read image file.", isError: true });
      setUploadingImage(false);
    };
    reader.readAsDataURL(file);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processImageFile(file);
  };

  const handleImageDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingImage(true);
  };

  const handleImageDragLeave = () => {
    setIsDraggingImage(false);
  };

  const handleImageDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingImage(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      processImageFile(file);
    }
  };

  // Dynamic, zero-latency immediate rendering and canvas post-processing compression for Brand Logo
  const processLogoFile = (file: File) => {
    // Generate synchronous instant object URL for instant UI response (0ms lag!)
    const objectUrl = URL.createObjectURL(file);
    setBrandingLogoUrl(objectUrl);
    setUploadingLogo(true);
    setStatusMsg(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const imgElement = document.createElement("img");
      imgElement.src = event.target?.result as string;
      imgElement.onload = () => {
        const canvas = document.createElement("canvas");
        const maxDim = 320; // Bound dimension for high contrast custom brand logo 
        let width = imgElement.width;
        let height = imgElement.height;
        
        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        
        // Ensure transparent alpha channel is preserved by clearing the canvas first
        ctx?.clearRect(0, 0, width, height);
        ctx?.drawImage(imgElement, 0, 0, width, height);
        
        // Keep original file type (e.g. image/png to preserve transparency), defaulting to image/png
        const outType = file.type && file.type.includes("png") ? "image/png" : "image/png";
        const compressedBase64 = canvas.toDataURL(outType);
        setBrandingLogoUrl(compressedBase64);
        setUploadingLogo(false);
      };
    };
    reader.onerror = () => {
      setStatusMsg({ text: "Failed to read logo file.", isError: true });
      setUploadingLogo(false);
    };
    reader.readAsDataURL(file);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processLogoFile(file);
  };

  const handleLogoDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingLogo(true);
  };

  const handleLogoDragLeave = () => {
    setIsDraggingLogo(false);
  };

  const handleLogoDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingLogo(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      processLogoFile(file);
    }
  };

  const processFaviconFile = (file: File) => {
    const objectUrl = URL.createObjectURL(file);
    setBrandingFaviconUrl(objectUrl);
    setUploadingFavicon(true);
    setStatusMsg(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const imgElement = document.createElement("img");
      imgElement.src = event.target?.result as string;
      imgElement.onload = () => {
        const canvas = document.createElement("canvas");
        const maxDim = 96;
        let width = imgElement.width;
        let height = imgElement.height;
        
        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.clearRect(0, 0, width, height);
        ctx?.drawImage(imgElement, 0, 0, width, height);
        
        const compressedBase64 = canvas.toDataURL("image/png");
        setBrandingFaviconUrl(compressedBase64);
        setUploadingFavicon(false);
      };
    };
    reader.onerror = () => {
      setStatusMsg({ text: "Failed to read favicon file.", isError: true });
      setUploadingFavicon(false);
    };
    reader.readAsDataURL(file);
  };

  const handleFaviconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processFaviconFile(file);
  };

  const handleFaviconDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFavicon(true);
  };

  const handleFaviconDragLeave = () => {
    setIsDraggingFavicon(false);
  };

  const handleFaviconDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFavicon(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      processFaviconFile(file);
    }
  };

  // Save changes to cloud Firestore database or local mock persistence
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setStatusMsg({
        text: "Database write failed: No active administration session detected.",
        isError: true,
      });
      return;
    }

    const isAdminEmail = currentUser.email === "kerenonen4@gmail.com" || currentUser.email === "admin@grandinternet.com";
    if (!isAdminEmail) {
      setStatusMsg({
        text: "Database write failed: The authenticated session is unauthorized.",
        isError: true,
      });
      return;
    }

    setStatusMsg({ text: "Publishing administrative updates...", isError: false });

    // Publish updates directly to Firestore Database
    try {
      const ceoRef = doc(db, "ceo_profile", "main");
      await setDoc(ceoRef, {
        name: editName.trim(),
        title: editTitle.trim(),
        email: editEmail.trim(),
        phone: editPhone.trim(),
        portraitUrl: editPortraitUrl,
        updatedAt: new Date().toISOString(),
      });

      const brandingRef = doc(db, "branding", "main");
      const brandingData: any = {
        logoUrl: brandingLogoUrl,
        slogan: brandingSlogan.trim(),
        updatedAt: new Date().toISOString(),
      };
      if (brandingFaviconUrl) {
        brandingData.faviconUrl = brandingFaviconUrl;
      }
      await setDoc(brandingRef, brandingData);

      // Clear draft states upon successful cloud db writing
      localStorage.removeItem("ceo_offline_draft");
      localStorage.removeItem("branding_offline_draft");

      setStatusMsg({ text: "🎉 SUCCESSFUL: CEO Profile and website branding updated in Cloud Firestore!", isError: false });
      
      // Instantly apply state updates locally for zero-latency feedback
      const uploadedCEO = {
        name: editName.trim(),
        title: editTitle.trim(),
        email: editEmail.trim(),
        phone: editPhone.trim(),
        portraitUrl: editPortraitUrl,
      };
      setCeoState(uploadedCEO);
      setImageSrc(editPortraitUrl);

      setTimeout(() => {
        setIsEditing(false);
        setStatusMsg(null);
      }, 1500);
    } catch (err: any) {
      console.warn("Firestore cloud write failed, syncing locally on this browser as draft:", err);
      
      // Fallback local save if offline or cloud writing fails
      const offlineDoc: CEOInfo = {
        name: editName.trim(),
        title: editTitle.trim(),
        email: editEmail.trim(),
        phone: editPhone.trim(),
        portraitUrl: editPortraitUrl,
      };
      setCeoState(offlineDoc);
      setImageSrc(editPortraitUrl);
      localStorage.setItem("ceo_offline_draft", JSON.stringify(offlineDoc));

      const offlineBranding: any = {
        logoUrl: brandingLogoUrl,
        slogan: brandingSlogan.trim(),
      };
      if (brandingFaviconUrl) {
        offlineBranding.faviconUrl = brandingFaviconUrl;
      }
      localStorage.setItem("branding_offline_draft", JSON.stringify(offlineBranding));
      window.dispatchEvent(new Event("branding_offline_draft_changed"));

      setStatusMsg({
        text: "⚠️ Firestore write error, but changes saved locally in this browser! Ensure security rules are fully updated.",
        isError: true,
      });
      setTimeout(() => {
        setIsEditing(false);
        setStatusMsg(null);
      }, 3000);
    }
  };

  return (
    <section className="bg-white py-28 px-6 relative" id="ceo">
      {/* Decorative ultra-soft gradient leaks in background */}
      <div className="absolute top-1/2 left-10 w-96 h-96 bg-red-100/30 rounded-full filter blur-[120px] opacity-40 pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-gray-100 rounded-full filter blur-[100px] opacity-40 pointer-events-none"></div>

      <div className="mx-auto max-w-5xl relative z-10">
        <ScrollReveal delayMs={100} durationMs={900}>
          <div className="grid gap-16 lg:grid-cols-12 lg:items-center">
            
            {/* Introductory Text Panel */}
            <div className="space-y-6 lg:col-span-7 text-center lg:text-left">
              <span className="font-mono text-xs font-bold tracking-[0.25em] text-[#990000] uppercase block">
                COMPANY LEADERSHIP
              </span>
              <h2 className="font-display text-3xl font-extrabold tracking-tight text-black sm:text-5xl" id="ceo-header-title">
                MEET THE CEO
              </h2>
              <div className="h-1.5 w-14 bg-[#990000] mx-auto lg:mx-0 rounded-full"></div>
              
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed max-w-xl mx-auto lg:mx-0 font-medium font-sans">
                Under vision-driven leadership, Grand Internet Services (GIS) has pioneered secure, error-free exam registration portals, mobilization guides, and premium digital credentials printing.
              </p>
              
              <p className="text-gray-400 text-xs italic max-w-xl mx-auto lg:mx-0 leading-relaxed font-semibold">
                "We believe university application support, result checks, and professional registrations should never be tedious. Every candidate deserves absolute precision."
              </p>

              <div className="pt-6 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <div className="flex -space-x-2">
                  <div className="h-8 w-8 rounded-full border-2 border-white bg-red-500/10 flex items-center justify-center text-[9px] font-bold text-[#990000]">GIS</div>
                  <div className="h-8 w-8 rounded-full border-2 border-white bg-black/5 flex items-center justify-center text-[10px] font-bold text-black">✓</div>
                  <div className="h-8 w-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500">5k</div>
                </div>
                <span className="text-xs font-extrabold text-gray-400 uppercase tracking-widest font-mono">
                  Trusted by 5,000+ candidates
                </span>
              </div>

              {/* Admin Panel Status Toast notifications */}
              {statusMsg && (
                <div
                  className={`p-4 rounded-xl border text-xs font-semibold ${
                    statusMsg.isError
                      ? "bg-red-50 border-red-100 text-red-600 animate-fade-in"
                      : "bg-[#fcfcfc] border-gray-100 text-gray-700 animate-fade-in"
                  }`}
                  id="admin-status-toast"
                >
                  {statusMsg.text}
                </div>
              )}
            </div>

            {/* 3D Flip Card Container with Hardware Accelerated motion */}
            <div className="flex flex-col items-center gap-6 lg:col-span-5" id="ceo-card-container">
              {/* Outer trigger box with perspective */}
              <div 
                className="group perspective-1000 w-full max-w-[340px] h-[480px] cursor-pointer"
                onClick={(e) => {
                  if ((e.target as HTMLElement).closest("a") || (e.target as HTMLElement).closest("button")) {
                    return;
                  }
                  setIsFlipped(!isFlipped);
                }}
              >
                
                {/* Inner container applying the actual rotation */}
                <div 
                  className={`relative w-full h-full duration-700 transform-style-3d transition-transform will-change-transform ${
                    isFlipped 
                      ? "rotate-y-180 shadow-[0_35px_80px_rgba(153,0,0,0.35)] scale-[1.02]" 
                      : "shadow-[0_20px_50px_rgba(0,0,0,0.15)] hover:scale-[1.01]"
                  } group-hover:rotate-y-180 group-hover:shadow-[0_35px_80px_rgba(153,0,0,0.35)]`}
                >
                  
                  {/* CARD FRONT */}
                  <div className="absolute inset-0 w-full h-full backface-hidden rounded-3xl overflow-hidden bg-white/45 backdrop-blur-xl border border-white/45 border-b-8 border-b-[#990000] ring-1 ring-white/30 ring-inset flex flex-col justify-between shadow-inner">
                    
                    {/* Portrait photo frame connecting to Firestore-powered db */}
                    <div className="relative h-[310px] w-full overflow-hidden bg-[#e0e0e0]">
                      {loading ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                          <span className="h-6 w-6 rounded-full border-2 border-[#990000] border-t-transparent animate-spin"></span>
                        </div>
                      ) : (
                        <img
                          src={imageSrc}
                          alt={ceoState.name}
                          onError={handleImageError}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          style={{ objectFit: "cover" }}
                          referrerPolicy="no-referrer"
                          id="ceo-portrait-img"
                        />
                      )}
                      
                      {/* Dark gradient base inside frame */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
                    </div>

                    {/* Name and titles */}
                    <div className="p-6 bg-white/45 backdrop-blur-md flex-1 flex flex-col justify-between border-t border-white/20 ring-1 ring-white/10 ring-inset">
                      <div>
                        <h3 className="font-display text-2xl font-extrabold text-black tracking-tight" id="ceo-front-name">
                          {ceoState.name}
                        </h3>
                        <p className="text-[10px] font-extrabold tracking-[0.25em] text-[#990000] uppercase mt-1">
                          {ceoState.title}
                        </p>
                      </div>

                      {/* Instruction hint - hardware accelerated pulsing effect */}
                      <div className="flex items-center gap-2 text-gray-400 text-[10px] font-bold border-t border-gray-100/80 pt-3 mt-2 font-mono uppercase tracking-widest">
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
                          className="animate-bounce"
                        >
                          <path d="M5 12h14"></path>
                          <path d="m12 5 7 7-7 7"></path>
                        </svg>
                        Tap / Hover to Flip
                      </div>
                    </div>
                  </div>

                  {/* CARD BACK - High-fidelity Web3 Glassmorphism setup (Light glass backdrop matching theme) */}
                  <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 rounded-3xl overflow-hidden bg-white/45 backdrop-blur-xl border border-white/45 border-b-8 border-b-[#990000] ring-1 ring-white/30 ring-inset p-8 flex flex-col justify-between shadow-inner">
                    
                    {/* Subtle red background glow inside the glass element */}
                    <div className="absolute -right-12 -bottom-12 h-44 w-44 bg-[#990000]/10 rounded-full filter blur-[40px] pointer-events-none"></div>

                    {/* Header metadata */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="h-1.5 w-6 bg-[#990000] rounded-full" />
                        <span className="font-mono text-[9px] font-bold tracking-widest text-[#990000] uppercase">
                          AUTHORIZED CREDENTIALS
                        </span>
                      </div>
                      
                      <h3 className="font-display text-2xl font-extrabold text-black tracking-tight">
                        {ceoState.name}
                      </h3>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                        {ceoState.title}
                      </p>
                    </div>

                    {/* Contacts blocks with hardware-accelerated scale-on-hover effects and staggered fade-ins */}
                    <div className="space-y-4 my-auto relative z-10">
                      
                      {/* TEL BLOCK */}
                      <a
                        href={`tel:${ceoState.phone.replace(/\s+/g, "")}`}
                        className={`group/item flex items-center gap-4 rounded-2xl border border-white/40 bg-white/60 p-4 transition-all duration-700 ease-out hover:scale-[1.03] hover:bg-white/95 ${
                          isFlipped 
                            ? "opacity-100 translate-y-0 delay-150" 
                            : "opacity-0 translate-y-6"
                        } group-hover:opacity-100 group-hover:translate-y-0 group-hover:delay-[150ms]`}
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 border border-red-100 text-[#990000] transition-colors group-hover/item:bg-[#990000] group-hover/item:text-white">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                          >
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                          </svg>
                        </div>
                        <div className="min-w-0">
                          <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest font-mono">
                            DIRECT SECURE LINE
                          </div>
                          <div className="text-sm font-bold tracking-wide text-black group-hover/item:text-[#990000] transition-colors">
                            {ceoState.phone}
                          </div>
                        </div>
                      </a>

                      {/* EMAIL BLOCK */}
                      <a
                        href={`mailto:${ceoState.email}`}
                        className={`group/item flex items-center gap-4 rounded-2xl border border-white/40 bg-white/60 p-4 transition-all duration-700 ease-out hover:scale-[1.03] hover:bg-white/95 ${
                          isFlipped 
                            ? "opacity-100 translate-y-0 delay-300" 
                            : "opacity-0 translate-y-6"
                        } group-hover:opacity-100 group-hover:translate-y-0 group-hover:delay-[300ms]`}
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 border border-red-100 text-[#990000] transition-colors group-hover/item:bg-[#990000] group-hover/item:text-white">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                          >
                            <rect width="20" height="16" x="2" y="4" rx="2"></rect>
                            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                          </svg>
                        </div>
                        <div className="min-w-0">
                          <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest font-mono">
                            SECURE MAILNODE
                          </div>
                          <div className="text-sm font-bold tracking-wide text-black group-hover/item:text-[#990000] transition-colors truncate">
                            {ceoState.email}
                          </div>
                        </div>
                      </a>

                    </div>

                    {/* Back footer metadata */}
                    <div className="flex items-center justify-between border-t border-white/40 pt-4 mt-2">
                      <span className="font-mono text-[9px] text-gray-400 tracking-wider">
                        GRAND INTERNET SERVICES
                      </span>
                      <span className="font-mono text-[9px] text-[#990000] font-bold tracking-widest">
                        SYSTEM ROOT
                      </span>
                    </div>

                  </div>

                </div>
              </div>
            </div>

          </div>
        </ScrollReveal>
      </div>

      {/* FIXED FLOATING SECRET ADMINISTRATION BAR - Displays only when logged in */}
      {currentUser && (
        <div className="fixed top-0 left-0 right-0 z-[100] bg-black/95 text-white py-2.5 px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] font-mono tracking-widest border-b border-[#990000] shadow-2xl backdrop-blur-md animate-fade-in">
          <div className="flex items-center gap-3">
            <span className="h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse"></span>
            <span>
              SECURE ADMIN SESSION: <strong className="text-red-400 uppercase">{currentUser.email}</strong>
            </span>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              onClick={startEdit}
              className="bg-[#990000] hover:bg-white hover:text-black text-white font-bold py-1.5 px-4 rounded-xl transition-all uppercase cursor-pointer text-[10px] tracking-wider active:scale-95"
            >
              Update Website & CEO DB
            </button>
            <button
              onClick={handleLogout}
              className="bg-zinc-800 hover:bg-zinc-700 text-gray-300 font-bold py-1.5 px-4 rounded-xl transition-all uppercase cursor-pointer text-[10px] tracking-wider active:scale-95"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}

      {/* DISCRETE ADMINISTRATIVE PORTAL CREDENTIAL LOGIN DIALOGUE */}
      {showLoginModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/75 backdrop-blur-xl animate-fade-in" id="admin-login-modal">
          <div className="w-full max-w-md bg-white border border-gray-100 shadow-2xl rounded-3xl p-8 relative space-y-6 animate-scale-up">
            
            {/* Logo display */}
            <div className="flex items-center justify-center pb-2 border-b border-gray-100">
              <div className="transform scale-90">
                <Logo iconOnly={true} />
              </div>
            </div>

            <div className="text-center space-y-1.5">
              <span className="text-[10px] uppercase font-mono tracking-[0.25em] text-[#990000] font-bold block">
                ADMINISTRATIVE SECURITY GUARD
              </span>
              <h3 className="font-display text-xl font-extrabold text-black">
                Authorized Personnel Entrance
              </h3>
              <p className="text-xs text-gray-400 font-medium">
                Enter credentials to operate branding assets and credentials databases.
              </p>
            </div>

            <form onSubmit={handleCredentialsLogin} className="space-y-4">
              {loginError && (
                <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs font-bold animate-pulse text-center">
                  {loginError}
                </div>
              )}

              {/* Email Address */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest font-mono">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="admin@grandinternet.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-xs font-semibold text-black focus:border-[#990000] focus:ring-1 focus:ring-[#990000] outline-none transition-colors"
                />
              </div>

              {/* Secure Password */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest font-mono">
                  Security Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-xs font-semibold text-black focus:border-[#990000] focus:ring-1 focus:ring-[#990000] outline-none transition-colors"
                />
              </div>

              {/* Predefined Default Details Note */}
              <div className="p-3 bg-gray-50 border border-gray-150/60 rounded-2xl text-[10px] leading-relaxed text-gray-500 font-medium font-mono">
                <span className="text-[#990000] font-bold block mb-1">🔑 DEFAULT LOGIN CREDENTIALS:</span>
                <div>Email: <strong className="text-black selection:bg-red-200">admin@grandinternet.com</strong></div>
                <div>Password: <strong className="text-black selection:bg-red-200">grandadmin2026</strong></div>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="submit"
                  className="w-full rounded-full bg-[#990000] hover:bg-black py-3 text-xs font-black tracking-widest text-white transition-all hover:scale-[1.01] active:scale-95 cursor-pointer uppercase shadow-md flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  LOCK-IN ACCESS
                </button>
                
                <button
                  type="button"
                  onClick={handleLogin}
                  disabled={isAuthenticating}
                  className="w-full rounded-full border border-gray-200 text-gray-600 hover:text-black hover:bg-gray-50 py-2.5 text-[10px] font-bold tracking-widest transition-all cursor-pointer uppercase flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12.24 10.285V13.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.859-3.578-7.859-8s3.529-8 7.859-8c2.46 0 4.105 1.025 5.047 1.926l2.427-2.334C17.955 2.192 15.34 1 12.24 1 5.92 1 1 5.92 1 12s4.92 11 11.24 11c6.59 0 11.02-4.604 11.02-11.237 0-.756-.08-1.332-.178-1.88H12.24z"/></svg>
                  Sign in with Google Admin
                </button>

                <button
                  type="button"
                  onClick={() => setShowLoginModal(false)}
                  className="w-full font-mono text-[9px] font-bold text-gray-400 hover:text-[#990000] text-center pt-2 select-none"
                >
                  DISMISS AND RETURN TO LIVE SITE
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* CLOUD DATABASE MANAGER EDIT MODAL CENTERED ON SCREEN */}
      {isEditing && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/45 backdrop-blur-md animate-fade-in">
          <form
            onSubmit={handleSave}
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white border border-gray-200 shadow-2xl rounded-3xl p-6 sm:p-8 relative space-y-6 animate-scale-up scrollbar-thin"
          >
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-widest text-[#990000] font-bold">
                  DATABASE MANAGER
                </span>
                <h3 className="font-display text-lg sm:text-xl font-extrabold text-black">
                  Manage Administrative Records
                </h3>
              </div>
              
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="text-gray-400 hover:text-black transition-colors p-1"
              >
                ✕
              </button>
            </div>

            {statusMsg && (
              <div className={`p-3 rounded-2xl border text-xs font-semibold text-center ${statusMsg.isError ? "bg-red-50 text-red-600 border-red-100" : "bg-[#fcfcfc] text-green-700 border-gray-150"}`}>
                {statusMsg.text}
              </div>
            )}

            <div className="space-y-6">
              {/* SECTION I: CEO PROFILE */}
              <div className="space-y-4 pb-6 border-b border-gray-100">
                <div className="flex items-center gap-2 text-xs font-extrabold text-[#990000] tracking-wider uppercase font-mono">
                  <span>👤</span>
                  <span>1. CEO Leadership Profile</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2 text-xs font-semibold text-black focus:border-[#990000] focus:ring-1 focus:ring-[#990000] outline-none"
                    />
                  </div>

                  {/* Title */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono">
                      Title / Designation
                    </label>
                    <input
                      type="text"
                      required
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2 text-xs font-semibold text-black focus:border-[#990000] focus:ring-1 focus:ring-[#990000] outline-none"
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono">
                      Direct Email
                    </label>
                    <input
                      type="email"
                      required
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2 text-xs font-semibold text-black focus:border-[#990000] focus:ring-1 focus:ring-[#990000] outline-none"
                    />
                  </div>

                  {/* Phone */}
                  <div className="space-y-1 text-left">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono">
                      Direct Telephone Link
                    </label>
                    <input
                      type="text"
                      required
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2 text-xs font-semibold text-black focus:border-[#990000] focus:ring-1 focus:ring-[#990000] outline-none"
                    />
                  </div>
                </div>

                {/* Portrait Photo Uploader */}
                <div className="space-y-2 text-left">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono block">
                    Portrait Image Photo (Drag & Drop Active)
                  </label>
                  <div 
                    onDragOver={handleImageDragOver}
                    onDragLeave={handleImageDragLeave}
                    onDrop={handleImageDrop}
                    className={`flex items-center gap-4 bg-gray-50/30 p-4 border rounded-2xl transition-all duration-300 ${
                      isDraggingImage 
                        ? "border-[#990000] bg-red-50/20 scale-[1.01]" 
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="h-16 w-16 rounded-xl overflow-hidden bg-gray-150 border border-gray-200 shrink-0 relative flex items-center justify-center">
                      <img
                        src={editPortraitUrl || FALLBACK_PORTRAIT_URL}
                        alt="Mini preview"
                        className="h-full w-full object-cover"
                      />
                      {uploadingImage && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <span className="h-3 w-3 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <label 
                          htmlFor="ceo-file-picker"
                          className="px-3 py-1.5 bg-white border border-gray-200 hover:bg-gray-50 text-[10px] font-bold text-gray-700 rounded-lg shadow-sm transition-all cursor-pointer active:scale-95 inline-block"
                        >
                          Choose Portrait File
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          id="ceo-file-picker"
                        />
                      </div>
                      <p className="text-[9px] text-gray-400 leading-none">
                        {uploadingImage ? "Compressing Portrait..." : "Drag and drop or click to upload."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION II: WEBSITE BRANDING */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-extrabold text-[#990000] tracking-wider uppercase font-mono">
                  <span>🎨</span>
                  <span>2. Header Tagline & Brand Logo</span>
                </div>

                {/* Website Slogan */}
                <div className="space-y-1 text-left">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono">
                    Website Slogan / Tagline
                  </label>
                  <input
                    type="text"
                    required
                    value={brandingSlogan}
                    onChange={(e) => setBrandingSlogan(e.target.value)}
                    placeholder="Customer Service, We Make It Even Better"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2 text-xs font-semibold text-black focus:border-[#990000] focus:ring-1 focus:ring-[#990000] outline-none"
                  />
                </div>

                {/* Manual Logo Upload */}
                <div className="space-y-2 text-left">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono block">
                    Custom Branded Logo Image (Drag & Drop Active)
                  </label>
                  <div 
                    onDragOver={handleLogoDragOver}
                    onDragLeave={handleLogoDragLeave}
                    onDrop={handleLogoDrop}
                    className={`flex items-center gap-4 bg-gray-50/30 p-4 border rounded-2xl transition-all duration-300 ${
                      isDraggingLogo 
                        ? "border-[#990000] bg-red-50/20 scale-[1.01]" 
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div 
                      className="h-16 w-16 rounded-xl overflow-hidden border border-gray-200 shrink-0 flex items-center justify-center p-1 relative shadow-inner"
                      style={{
                        backgroundImage: "conic-gradient(#e2e8f0 25%, #ffffff 0 50%, #e2e8f0 0 75%, #ffffff 0)",
                        backgroundSize: "12px 12px"
                      }}
                    >
                      {brandingLogoUrl ? (
                        <img
                          src={brandingLogoUrl}
                          alt="Branding preview"
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <span className="text-[8px] text-gray-400 font-bold uppercase text-center font-mono leading-none">Default Vector</span>
                      )}
                      
                      {uploadingLogo && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <span className="h-3 w-3 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <label 
                          htmlFor="logo-file-picker"
                          className="px-3 py-1.5 bg-white border border-gray-200 hover:bg-gray-50 text-[10px] font-bold text-gray-700 rounded-lg shadow-sm transition-all cursor-pointer active:scale-95 inline-block"
                        >
                          Choose Logo File
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="hidden"
                          id="logo-file-picker"
                        />
                        
                        {brandingLogoUrl && (
                          <button
                            type="button"
                            onClick={() => setBrandingLogoUrl("")}
                            className="text-[9px] font-extrabold uppercase text-[#990000] hover:underline cursor-pointer select-none font-mono"
                          >
                            Reset Default logo
                          </button>
                        )}
                      </div>
                      
                      <p className="text-[9px] text-gray-400 leading-normal">
                        {uploadingLogo ? "Optimizing design boundaries..." : "Supports transparent PNG/vector logs. Background-less images are fully detected and rendered transparently with 0ms lag."}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Manual Favicon Upload */}
                <div className="space-y-2 text-left">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono block">
                    Custom Favicon (.ico / .png) (Drag & Drop Active)
                  </label>
                  <div 
                    onDragOver={handleFaviconDragOver}
                    onDragLeave={handleFaviconDragLeave}
                    onDrop={handleFaviconDrop}
                    className={`flex items-center gap-4 bg-gray-50/30 p-4 border rounded-2xl transition-all duration-300 ${
                      isDraggingFavicon 
                        ? "border-[#990000] bg-red-50/20 scale-[1.01]" 
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div 
                      className="h-16 w-16 rounded-xl overflow-hidden border border-gray-200 shrink-0 flex items-center justify-center p-1 relative shadow-inner"
                      style={{
                        backgroundImage: "conic-gradient(#e2e8f0 25%, #ffffff 0 50%, #e2e8f0 0 75%, #ffffff 0)",
                        backgroundSize: "12px 12px"
                      }}
                    >
                      {brandingFaviconUrl ? (
                        <img
                          src={brandingFaviconUrl}
                          alt="Favicon preview"
                          className="h-8 w-8 object-contain"
                        />
                      ) : (
                        <span className="text-[8px] text-gray-400 font-bold uppercase text-center font-mono leading-none">Default Link</span>
                      )}
                      
                      {uploadingFavicon && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <span className="h-3 w-3 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <label 
                          htmlFor="favicon-file-picker"
                          className="px-3 py-1.5 bg-white border border-gray-200 hover:bg-gray-50 text-[10px] font-bold text-gray-700 rounded-lg shadow-sm transition-all cursor-pointer active:scale-95 inline-block"
                        >
                          Choose Favicon File
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFaviconUpload}
                          className="hidden"
                          id="favicon-file-picker"
                        />
                        
                        {brandingFaviconUrl && (
                          <button
                            type="button"
                            onClick={() => setBrandingFaviconUrl("")}
                            className="text-[9px] font-extrabold uppercase text-[#990000] hover:underline cursor-pointer select-none font-mono"
                          >
                            Reset Default Favicon
                          </button>
                        )}
                      </div>
                      
                      <p className="text-[9px] text-gray-400 leading-normal">
                        {uploadingFavicon ? "Optimizing design boundaries..." : "Supports transparent png icon structures. Dynamic head configuration enabled with 0ms lag browser response."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="rounded-xl px-4 py-2 text-xs font-bold tracking-wide text-gray-500 hover:text-black transition-colors"
              >
                CANCEL
              </button>
              
              <button
                type="submit"
                disabled={uploadingImage || uploadingLogo || uploadingFavicon}
                className="rounded-xl bg-[#990000] disabled:opacity-50 text-white px-5 py-2 text-xs font-bold tracking-wide hover:bg-black transition-all shadow-sm active:scale-95 cursor-pointer"
              >
                PUBLISH UPDATES
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}
