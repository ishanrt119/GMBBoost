import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const searchBusiness = async (businessName: string) => {
  console.log('SERP KEY being used:', process.env.SERP_API_KEY?.substring(0, 10));
  const response = await fetch(
    `https://serpapi.com/search.json?engine=google_maps&q=${encodeURIComponent(businessName)}&api_key=${process.env.SERP_API_KEY}`
  );
  const data = await response.json();
  console.log('SerpApi response:', JSON.stringify(data).substring(0, 200));
  const results = data.local_results || [];
  
  if (results.length === 0) {
    throw new Error('Business not found on Google Maps');
  }

  return results.slice(0, 5).map((r: any) => ({
    title: r.title,
    address: r.address,
    rating: r.rating,
    dataId: r.data_id
  }));
};

export const saveBusinessDataId = async (userId: number, dataId: string, businessName: string) => {
  return await prisma.user.update({
    where: { id: userId },
    data: {
      dataId: dataId,
      business: businessName
    }
  });
};

export const getUserProfile = async (userId: number) => {
  return await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      business: true,
      dataId: true
    }
  });
};