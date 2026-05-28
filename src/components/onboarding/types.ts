export interface OnboardingData {
  // Step 1
  fullName: string;
  // Step 2
  email: string;
  password: string;
  confirmPassword: string;
  // Step 3
  companyName: string;
  // Step 4
  businessName: string;
  category: string;
  phone: string;
  address: string;
  website: string;
  // Step 5
  googlePlaceId: string;
  gbpUrl: string;
  // Step 6
  twilioSid: string;
  twilioAuthToken: string;
  whatsappNumber: string;
  // Step 7
  aiTone: string;
  aiSalesPrompt: string;
  // Step 8
  selectedPlan: string;
}

export const initialOnboardingData: OnboardingData = {
  fullName: '',
  email: '',
  password: '',
  confirmPassword: '',
  companyName: '',
  businessName: '',
  category: '',
  phone: '',
  address: '',
  website: '',
  googlePlaceId: '',
  gbpUrl: '',
  twilioSid: '',
  twilioAuthToken: '',
  whatsappNumber: '',
  aiTone: 'professional',
  aiSalesPrompt: '',
  selectedPlan: 'growth'
};
