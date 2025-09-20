import { execSync } from 'child_process';

export default async function globalSetup() {
  console.log('Setting up test environment...');
  
  // Generate Prisma client
  try {
    execSync('npx prisma generate', { stdio: 'inherit' });
    console.log('Prisma client generated successfully');
  } catch (error) {
    console.error('Failed to generate Prisma client:', error);
    throw error;
  }
}
