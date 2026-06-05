import { GMBBusinessData } from '../gmb/provider';
import { IProfileData } from '../../models/AuditHistory';

function assess(field: any, condition: boolean): 'Complete' | 'Partial' | 'Missing' {
  if (!field || field === '') return 'Missing';
  if (Array.isArray(field) && field.length === 0) return 'Missing';
  if (condition) return 'Complete';
  return 'Partial';
}

export function analyzeProfileCompletion(data: GMBBusinessData): IProfileData {
  let completed = 0;
  const totalFields = 17;

  const fields = {
    businessName: assess(data.businessName, true),
    primaryCategory: assess(data.categories[0], true),
    additionalCategories: assess(data.categories, data.categories.length > 1),
    address: assess(data.location, true),
    phone: assess('Data Not Available', false), // GBP API needed
    website: assess('Data Not Available', false), // GBP API needed
    description: assess('Data Not Available', false), // GBP API needed
    services: assess('Data Not Available', false), // GBP API needed
    products: assess('Data Not Available', false), // GBP API needed
    photos: assess(data.photosCount, data.photosCount > 10),
    videos: assess('Data Not Available', false), // GBP API needed
    attributes: assess(data.attributes, data.attributes.length > 5),
    hours: assess(data.businessHours, data.businessHours.length > 0),
    serviceArea: assess('Data Not Available', false), // GBP API needed
    appointmentLink: assess('Data Not Available', false), // GBP API needed
    messagingEnabled: assess('Data Not Available', false), // GBP API needed
    qaEnabled: assess(data.qaCount, data.qaCount > 0),
  };

  // Convert "Data Not Available" fields to Missing to avoid inflating score, 
  // or handle strictly as Missing if we can't verify completion.
  // We'll treat Missing as 0, Partial as 0.5, Complete as 1
  for (const [key, val] of Object.entries(fields)) {
    if (val === 'Complete') completed += 1;
    if (val === 'Partial') completed += 0.5;
  }

  const completionPercent = Math.round((completed / totalFields) * 100);

  return {
    completionPercent,
    fields
  };
}
