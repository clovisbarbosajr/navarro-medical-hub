// Custom type definitions for database tables
// These supplement the auto-generated Supabase types

export type AppRole = "admin" | "manager";

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
}

export interface Birthday {
  id: string;
  name: string;
  photo_url: string | null;
  birth_date: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  enabled: boolean;
  end_date: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface NewsItem {
  id: string;
  title: string;
  excerpt: string | null;
  image_url: string | null;
  category: string;
  published_at: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface GalleryImage {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  sort_order: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface MenuLink {
  id: string;
  category: "sistemas" | "ferramentas" | "helpdesk";
  label: string;
  href: string;
  sort_order: number;
  open_mode: "new_tab" | "iframe";
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface SiteSetting {
  id: string;
  key: string;
  value: string | null;
  updated_at: string;
}

export interface HolidayTheme {
  id: string;
  name: string;
  emoji: string;
  description: string | null;
  css_overrides: Record<string, string>;
  holiday_date: string;
  activation_start: string;
  activation_end: string;
  enabled: boolean;
  is_professional_date: boolean;
  suggested_message: string | null;
  image_bank_url: string | null;
  background_type: string | null;
  background_image_url: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}
