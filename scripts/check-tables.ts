import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

async function main() {
  const prisma = new PrismaClient();
  
  try {
    // Check if promotionBanner table exists
    console.log('Checking for promotionBanner table...');
    
    // Method 1: Try to query the table directly
    try {
      const result = await prisma.$queryRaw`SHOW TABLES LIKE 'promotionBanner'`;
      console.log('promotionBanner table (case sensitive):', result);
      
      // If not found, try case insensitive search
      if (!result || (Array.isArray(result) && result.length === 0)) {
        const allTables = await prisma.$queryRaw`SHOW TABLES`;
        console.log('All tables (case insensitive):', allTables);
      }
    } catch (error) {
      console.error('Error checking tables:', error);
    }
    
    // Check if we can query the model
    console.log('Attempting to query promotionBanner model...');
    try {
      const count = await prisma.promotionBanner.count();
      console.log(`Found ${count} promotion banners`);
    } catch (error) {
      console.error('Error querying promotionBanner model:', error);
    }
    
  } catch (error) {
    console.error('Script failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
