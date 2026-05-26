import { ServiceItem, CEOInfo } from "./types";

export const SERVICES_DATA: ServiceItem[] = [
  {
    id: "postgrad",
    name: "POSTGRADUATE APPLICATION",
    description: "Guidance, application form submission, and official registration for master's, doctoral, and postgraduate diploma programs.",
    shortcut: "PG"
  },
  {
    id: "nerd",
    name: "NERD REGISTRATION",
    description: "Fast, certified registration and account setup on the official NERD research, learning, and exam platform.",
    shortcut: "NR"
  },
  {
    id: "post-utme",
    name: "POST UTME REGISTRATION (ALL SCHOOLS)",
    description: "Multi-institution screening applications and registrations for all public and private universities, polytechnics, and colleges.",
    shortcut: "UT"
  },
  {
    id: "ces-diploma",
    name: "CES/DIPLOMA REGISTRATION",
    description: "Admissions application processing for Center for Educational Services (CES), part-time programs, and diplomas.",
    shortcut: "CD"
  },
  {
    id: "pre-degree",
    name: "PRE-DEGREE REGISTRATION",
    description: "Complete pre-academic year enrollment and intensive coaching program registration for aspiring university entrants.",
    shortcut: "PD"
  },
  {
    id: "nysc",
    name: "NYSC REGISTRATION",
    description: "Step-by-step mobilization, online biometrics capturing, green card activation, and call-up letter printing.",
    shortcut: "NY"
  },
  {
    id: "jamb",
    name: "JAMB RESULT AND ADMISSION LETTER PRINTING",
    description: "Instant UTME result verification, CAPS checking, official JAMB portal login, and secure high-quality letter printing.",
    shortcut: "JB"
  }
];

export const CEO_DATA: CEOInfo = {
  name: "Augustine Oluoma Chucks",
  title: "CEO",
  email: "gsunical@gmail.com",
  phone: "0701 1054 544",
  portraitUrl: "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?auto=format&fit=crop&q=80&w=800"
};
