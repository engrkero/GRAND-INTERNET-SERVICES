export interface ServiceItem {
  id: string;
  name: string;
  description: string;
  shortcut: string;
}

export interface CEOInfo {
  name: string;
  title: string;
  email: string;
  phone: string;
  portraitUrl: string;
}

export interface BrandingInfo {
  logoUrl: string;
  slogan: string;
  updatedAt?: string;
}

