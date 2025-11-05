import { SeedService } from './src/services/seedService';

async function main() {
  console.log('🚀 Starting database seeding...');

  try {
    const result = await SeedService.seedDatabase();

    if (result.success) {
      console.log('✅ Database seeding completed successfully!');
      console.log(result.message);
    } else {
      console.error('❌ Database seeding failed:', result.error);
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Unexpected error during seeding:', error);
    process.exit(1);
  }
}

main();