import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();
  
  try {
    console.log('Creating a new promotion banner...');
    
    const newBanner = await prisma.promotionBanner.create({
      data: {
        title: 'Test Banner',
        description: 'This is a test banner',
        buttonText: 'Click Here',
        buttonLink: 'https://example.com',
        imageUrl: 'https://example.com/banner.jpg',
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        isActive: true,
      },
    });
    
    console.log('Successfully created banner:', newBanner);
    
    // List all banners
    const banners = await prisma.promotionBanner.findMany();
    console.log('All banners:', banners);
    
  } catch (error) {
    console.error('Error creating banner:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
