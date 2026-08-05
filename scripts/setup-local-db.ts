import "../server/config"; // Must be first — loads .env.local then .env
import { Pool } from "pg";

async function setupLocalDb() {
  const dbName = 'quickdineflow';
  
  // Extract user/password/host/port from process.env.DATABASE_URL if available
  let adminConnString = `postgresql://postgres:postgres@localhost:5432/postgres`;
  if (process.env.DATABASE_URL) {
    try {
      const url = new URL(process.env.DATABASE_URL);
      url.pathname = '/postgres';
      adminConnString = url.toString();
    } catch {
      // fallback
    }
  }

  // Connect to the default 'postgres' database to create our app database
  const adminPool = new Pool({
    connectionString: adminConnString,
  });

  try {
    console.log('Connecting to local PostgreSQL...');
    const client = await adminPool.connect();
    
    // Check if the database already exists
    const result = await client.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [dbName]
    );

    if (result.rowCount === 0) {
      console.log(`Creating database "${dbName}"...`);
      await client.query(`CREATE DATABASE ${dbName}`);
      console.log(`✅ Database "${dbName}" created successfully!`);
    } else {
      console.log(`ℹ️ Database "${dbName}" already exists.`);
    }

    client.release();

    console.log('\n📋 Next steps:');
    console.log('  1. Create .env.local with the DATABASE_URL below (if you have not already)');
    console.log('  2. npm run db:setup       # Push schema + seed (or: db:setup-local-full)');
    console.log('  3. npm run dev            # Start the dev server');
    console.log(`\n🔗 Your local DATABASE_URL: postgresql://postgres:postgres@localhost:5432/${dbName}`);
  } catch (error: any) {
    if (error.code === 'ECONNREFUSED') {
      console.error('❌ Could not connect to PostgreSQL at localhost:5432');
      console.error('   Make sure PostgreSQL is installed and running locally.');
      console.error('   On Windows: Check Services (services.msc) for "postgresql" service.');
    } else if (error.code === '28P01') {
      console.error('❌ Authentication failed for user "postgres".');
      console.error('   Update the connection string in .env.local with your actual PostgreSQL credentials.');
    } else {
      console.error('❌ Error setting up local database:', error.message);
    }
    process.exit(1);
  } finally {
    await adminPool.end();
  }
}

setupLocalDb();
