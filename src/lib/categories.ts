import type { BusinessCategory } from "./api";

export const CATEGORY_LABELS: Record<BusinessCategory, string> = {
  retail: "Retail",
  restaurant_cafe: "Restaurant/Cafe",
  health_beauty: "Health/Beauty",
  professional_services: "Professional Services",
  home_services: "Home Services",
  real_estate: "Real Estate",
  automotive: "Automotive",
  education_coaching: "Education/Coaching",
  fitness_sports: "Fitness/Sports",
  events_entertainment: "Events/Entertainment",
  ecommerce: "Ecommerce",
  technology_software: "Technology/Software",
  other: "Other",
};

export const CATEGORY_OPTIONS: BusinessCategory[] = [
  "retail",
  "restaurant_cafe",
  "health_beauty",
  "professional_services",
  "home_services",
  "real_estate",
  "automotive",
  "education_coaching",
  "fitness_sports",
  "events_entertainment",
  "ecommerce",
  "technology_software",
  "other",
];
