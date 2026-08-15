// Client for the AdCreate.AI backend (Supabase-backed).

import { getAccessToken } from "./supabase";

const API_BASE = (import.meta.env.VITE_API_BASE as string) || "http://localhost:8000";

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error("Your session has expired. Please log in again.");
  }

  const headers = {
    ...(init?.headers as Record<string, string> | undefined),
    Authorization: `Bearer ${token}`,
  };

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, { ...init, headers });
  } catch {
    throw new Error("Could not reach the server. Check your internet connection.");
  }
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const detail = Array.isArray(body?.detail)
      ? body.detail.map((d: { msg?: string }) => d.msg).join(", ")
      : body?.detail;
    throw new Error(detail || `Server error ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export interface ApiAdCredits {
  credits: number;
}

export interface ApiAdCaptionVariant {
  facebook_caption: string;
  whatsapp_message: string;
}

export interface ApiAdGenerateResponse {
  captions: ApiAdCaptionVariant[];
  banner_image_base64: string;
  credits_remaining: number;
}

export interface ApiAdImageVariantResponse {
  banner_image_base64: string;
  credits_remaining: number;
}

export function fetchAdCredits(): Promise<ApiAdCredits> {
  return apiFetch<ApiAdCredits>("/ads/credits");
}

export function generateAd(itemDescription: string, file: File | null): Promise<ApiAdGenerateResponse> {
  const formData = new FormData();
  if (file) formData.append("file", file);
  const params = new URLSearchParams({ item_description: itemDescription });
  return apiFetch<ApiAdGenerateResponse>(`/ads/generate?${params}`, {
    method: "POST",
    body: formData,
  });
}

export function generateAdImageVariant(itemDescription: string, file: File | null): Promise<ApiAdImageVariantResponse> {
  const formData = new FormData();
  if (file) formData.append("file", file);
  const params = new URLSearchParams({ item_description: itemDescription });
  return apiFetch<ApiAdImageVariantResponse>(`/ads/generate-image-variant?${params}`, {
    method: "POST",
    body: formData,
  });
}

// The generated banner images live in state as raw base64 PNG strings
// (that's what the backend returns) — these two tools re-upload that same
// image to a fresh Gemini edit call, so it needs converting back to a
// file-like Blob for multipart upload.
function base64ToBlob(base64: string, mimeType: string): Blob {
  const byteChars = atob(base64);
  const byteNumbers = new Array(byteChars.length);
  for (let i = 0; i < byteChars.length; i++) byteNumbers[i] = byteChars.charCodeAt(i);
  return new Blob([new Uint8Array(byteNumbers)], { type: mimeType });
}

export function removeBackground(imageBase64: string): Promise<ApiAdImageVariantResponse> {
  const formData = new FormData();
  formData.append("file", base64ToBlob(imageBase64, "image/png"), "image.png");
  return apiFetch<ApiAdImageVariantResponse>("/ads/remove-background", {
    method: "POST",
    body: formData,
  });
}

export function enhanceImage(imageBase64: string): Promise<ApiAdImageVariantResponse> {
  const formData = new FormData();
  formData.append("file", base64ToBlob(imageBase64, "image/png"), "image.png");
  return apiFetch<ApiAdImageVariantResponse>("/ads/enhance-image", {
    method: "POST",
    body: formData,
  });
}

export function translateCaptions(
  captions: ApiAdCaptionVariant[],
  targetLanguage: string,
): Promise<{ captions: ApiAdCaptionVariant[] }> {
  return apiFetch<{ captions: ApiAdCaptionVariant[] }>("/ads/translate-captions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ captions, target_language: targetLanguage }),
  });
}

export interface ApiFetchProductLinkResponse {
  title: string;
  description: string;
  image_base64: string | null;
  mime_type: string | null;
}

export function fetchProductLink(url: string): Promise<ApiFetchProductLinkResponse> {
  return apiFetch<ApiFetchProductLinkResponse>("/ads/fetch-product-link", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });
}

export function base64ToFile(base64: string, mimeType: string, filename: string): File {
  return new File([base64ToBlob(base64, mimeType)], filename, { type: mimeType });
}

export type BusinessCategory =
  | "retail"
  | "restaurant_cafe"
  | "health_beauty"
  | "professional_services"
  | "home_services"
  | "real_estate"
  | "automotive"
  | "education_coaching"
  | "fitness_sports"
  | "events_entertainment"
  | "ecommerce"
  | "technology_software"
  | "other";

export interface ApiBusinessProfile {
  category: BusinessCategory;
  brand_color: string | null;
  logo_base64: string | null;
  logo_mime_type: string | null;
}

export function fetchBusinessProfile(): Promise<ApiBusinessProfile> {
  return apiFetch<ApiBusinessProfile>("/business-profile");
}

// Partial update — omitted fields keep whatever's already saved
// server-side, so the category picker and the Brand Kit panel can each
// save independently without wiping the other's fields.
export function setBusinessProfile(updates: {
  category?: BusinessCategory;
  brand_color?: string;
  logo_base64?: string;
  logo_mime_type?: string;
}): Promise<ApiBusinessProfile> {
  return apiFetch<ApiBusinessProfile>("/business-profile", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
}

export interface ApiContentPlanPost {
  day: string;
  theme: string;
  idea_text: string;
  source_items: string[];
  media_type: string;
  status: "idea" | "generated";
  caption: string | null;
  whatsapp_message: string | null;
  image_base64: string | null;
}

export interface ApiContentPlan {
  id: string;
  period_start: string;
  period_end: string;
  status: string;
  posts: ApiContentPlanPost[];
}

export function fetchCurrentContentPlan(): Promise<ApiContentPlan | null> {
  return apiFetch<ApiContentPlan | null>("/content-plan/current");
}

export function generateContentPlan(inputText: string): Promise<ApiContentPlan> {
  return apiFetch<ApiContentPlan>("/content-plan/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ input_text: inputText }),
  });
}

export function generateContentPlanPost(planId: string, day: string, file: File | null, ideaText?: string): Promise<ApiAdGenerateResponse> {
  const formData = new FormData();
  if (file) formData.append("file", file);
  if (ideaText) formData.append("idea_text", ideaText);
  return apiFetch<ApiAdGenerateResponse>(`/content-plan/${planId}/posts/${day}/generate`, {
    method: "POST",
    body: formData,
  });
}

export function selectContentPlanPost(
  planId: string,
  day: string,
  caption: string,
  whatsappMessage: string,
  imageBase64?: string,
): Promise<void> {
  return apiFetch<void>(`/content-plan/${planId}/posts/${day}/select`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ caption, whatsapp_message: whatsappMessage, image_base64: imageBase64 }),
  });
}
