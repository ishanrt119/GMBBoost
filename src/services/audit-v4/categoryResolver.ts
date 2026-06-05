export const GENERIC_GOOGLE_TYPES = new Set([
  "establishment",
  "point_of_interest",
  "premise",
  "route",
  "political",
  "locality",
  "subpremise",
  "neighborhood",
  "administrative_area_level_1",
  "administrative_area_level_2",
  "country",
  "geocode"
]);

/**
 * Resolves the true specific business category by stripping out generic Google Maps types.
 */
export function resolveCategory(types: string[]): string {
  if (!types || types.length === 0) return "business";

  // Filter out generic types
  const specificTypes = types.filter(t => !GENERIC_GOOGLE_TYPES.has(t.toLowerCase()));

  if (specificTypes.length === 0) {
    // If somehow all types were generic, fallback to the first one safely, or 'business'
    return types[0].toLowerCase() || "business";
  }

  // The first specific type is usually the primary Google Business Profile category
  return specificTypes[0].toLowerCase();
}

/**
 * Groups categories into vertical clusters for broader industry matching (e.g., Education)
 */
export function getCategoryVertical(category: string): string {
  const normalized = category.toLowerCase().replace(/_/g, ' ');
  
  if (['university', 'college', 'educational institution', 'training centre', 'school'].includes(normalized)) {
    return 'education';
  }
  
  if (['restaurant', 'cafe', 'bar', 'bakery', 'food'].includes(normalized)) {
    return 'food_and_beverage';
  }

  if (['hospital', 'doctor', 'dental clinic', 'dentist', 'health', 'pharmacy', 'clinic'].includes(normalized)) {
    return 'healthcare';
  }

  if (['software company', 'saas provider', 'it consulting'].includes(normalized)) {
    return 'technology';
  }

  return 'general';
}
