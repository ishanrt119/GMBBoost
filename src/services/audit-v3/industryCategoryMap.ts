export const INDUSTRY_CATEGORY_MAP: Record<string, string[]> = {
  university: ['university', 'college', 'educational_institution', 'education', 'school'],
  college: ['university', 'college', 'educational_institution', 'education', 'school'],
  educational_institution: ['university', 'college', 'educational_institution', 'education', 'school'],
  restaurant: ['restaurant', 'food', 'cafe', 'bar', 'bakery', 'meal_takeaway', 'meal_delivery'],
  dentist: ['dentist', 'dental_clinic', 'health', 'doctor', 'hospital'],
  dental_clinic: ['dentist', 'dental_clinic', 'health', 'doctor', 'hospital'],
  gym: ['gym', 'fitness_center', 'health'],
  software_company: ['software_company', 'technology_company', 'it_consulting'],
  doctor: ['doctor', 'hospital', 'clinic', 'dentist', 'health'],
  hospital: ['hospital', 'doctor', 'clinic', 'health'],
  bar: ['bar', 'restaurant', 'cafe', 'food', 'night_club']
};

export function getAllowedCategories(primaryCategory: string): string[] {
  const normalized = primaryCategory.toLowerCase().replace(/ /g, '_');
  
  // Return the mapped allowed categories, ensuring the original category is always allowed
  return INDUSTRY_CATEGORY_MAP[normalized] || [normalized];
}

export function isCompetitorValid(targetCategory: string, compCategory: string, compTypes: string[] = []): boolean {
  const targetNormalized = targetCategory.toLowerCase().replace(/ /g, '_');
  const compNormalized = compCategory.toLowerCase().replace(/ /g, '_');
  const allowed = getAllowedCategories(targetNormalized);

  if (allowed.includes(compNormalized)) return true;
  
  // Also check if any of the raw types match the allowed list
  for (const type of compTypes) {
    if (allowed.includes(type.toLowerCase().replace(/ /g, '_'))) return true;
  }

  return false;
}
