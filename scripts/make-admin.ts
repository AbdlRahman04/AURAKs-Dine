import "dotenv/config";
import { db } from '../server/db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';

/**
 * Script to promote a user to admin role
 * 
 * Usage:
 *   npx tsx scripts/make-admin.ts <email>
 * 
 * Example:
 *   npx tsx scripts/make-admin.ts user@example.com
 */

async function makeAdmin(email: string) {
  try {
    console.log(`Looking for user with email: ${email}...`);
    
    // Find the user by email
    const [user] = await db.select().from(users).where(eq(users.email, email));
    
    if (!user) {
      console.error(`❌ User with email "${email}" not found.`);
      console.log('\nAvailable users:');
      const allUsers = await db.select({
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        role: users.role,
      }).from(users);
      
      if (allUsers.length === 0) {
        console.log('  No users found in database.');
      } else {
        allUsers.forEach(u => {
          console.log(`  - ${u.email} (${u.firstName} ${u.lastName}) - Role: ${u.role}`);
        });
      }
      process.exit(1);
    }
    
    if (user.role === 'admin') {
      console.log(`✅ User "${email}" is already an admin.`);
      process.exit(0);
    }
    
    // Update the user's role to admin
    await db
      .update(users)
      .set({ 
        role: 'admin',
        updatedAt: new Date(),
      })
      .where(eq(users.email, email));
    
    console.log(`✅ Successfully promoted "${email}" to admin role!`);
    console.log(`\nYou can now access the admin panel at: /admin`);
    console.log(`\nUser details:`);
    console.log(`  Name: ${user.firstName} ${user.lastName}`);
    console.log(`  Email: ${user.email}`);
    console.log(`  Role: admin (updated)`);
    
  } catch (error) {
    console.error('❌ Error promoting user to admin:', error);
    process.exit(1);
  }
}

// Get email from command line arguments
const email = process.argv[2];

if (!email) {
  console.error('❌ Please provide an email address.');
  console.log('\nUsage:');
  console.log('  npx tsx scripts/make-admin.ts <email>');
  console.log('\nExample:');
  console.log('  npx tsx scripts/make-admin.ts user@example.com');
  process.exit(1);
}

makeAdmin(email)
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });

