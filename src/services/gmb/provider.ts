export interface GMBBusinessData {
  businessName: string;
  location: string;
  rating: number;
  reviewsCount: number;
  categories: string[];
  photosCount: number;
  qaCount: number;
  postsCount: number;
  businessHours: { day: string; hours: string }[];
  attributes: string[];
  reviews: { author: string; rating: number; text: string; date: string }[];
}

export interface IGMBProvider {
  fetchBusinessDetails(businessName: string, location: string, gbpUrl?: string): Promise<GMBBusinessData>;
}

export class MockGMBProvider implements IGMBProvider {
  async fetchBusinessDetails(businessName: string, location: string, gbpUrl?: string): Promise<GMBBusinessData> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Return mock structured data
    return {
      businessName,
      location,
      rating: 4.2,
      reviewsCount: 87,
      categories: ['SaaS Provider', 'Software Company'],
      photosCount: 12,
      qaCount: 3,
      postsCount: 2, // Low number to trigger a recommendation
      businessHours: [
        { day: 'Monday', hours: '9:00 AM - 5:00 PM' },
        { day: 'Tuesday', hours: '9:00 AM - 5:00 PM' },
        { day: 'Wednesday', hours: '9:00 AM - 5:00 PM' },
        { day: 'Thursday', hours: '9:00 AM - 5:00 PM' },
        { day: 'Friday', hours: '9:00 AM - 5:00 PM' },
        { day: 'Saturday', hours: 'Closed' },
        { day: 'Sunday', hours: 'Closed' },
      ],
      attributes: ['Online appointments', 'Onsite services'],
      reviews: [
        {
          author: 'John Doe',
          rating: 5,
          text: 'Great software, highly recommend!',
          date: new Date().toISOString(),
        },
        {
          author: 'Jane Smith',
          rating: 3,
          text: 'Good features, but customer support is a bit slow.',
          date: new Date(Date.now() - 86400000 * 5).toISOString(),
        },
        {
          author: 'Bob Johnson',
          rating: 4,
          text: 'Solid platform overall. Helped us scale.',
          date: new Date(Date.now() - 86400000 * 15).toISOString(),
        }
      ],
    };
  }
}

// Factory or DI logic can be added here later to swap out Mock for Real Provider
export function getGMBProvider(): IGMBProvider {
  return new MockGMBProvider();
}
