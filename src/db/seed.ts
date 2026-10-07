import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';
import { INITIAL_INSTRUMENTS, INITIAL_BLOG_POSTS } from './seedData';
import bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';

dotenv.config();

async function runSeed() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('[Seed] Error: DATABASE_URL environment variable is missing.');
    process.exit(1);
  }

  console.log('[Seed] Connecting to Neon PostgreSQL via Drizzle ORM...');
  const sql = neon(databaseUrl);
  const db = drizzle(sql, { schema });

  console.log('[Seed] Seeding standard market instruments...');
  for (const inst of INITIAL_INSTRUMENTS) {
    await db
      .insert(schema.instruments)
      .values({
        ...inst,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .onConflictDoNothing();
  }
  console.log(`[Seed] Seeded ${INITIAL_INSTRUMENTS.length} instruments.`);

  console.log('[Seed] Seeding initial research articles...');
  for (const post of INITIAL_BLOG_POSTS) {
    await db.insert(schema.blogPosts).values(post).onConflictDoNothing();
  }
  console.log(`[Seed] Seeded ${INITIAL_BLOG_POSTS.length} research dossiers.`);

  // Admin user provisioning via environment variables only (no hardcoded credentials)
  const adminEmail = process.env.ADMIN_SEED_EMAIL;
  const adminPassword = process.env.ADMIN_SEED_PASSWORD;

  if (adminEmail && adminPassword) {
    console.log(`[Seed] Seeding administrator user (${adminEmail})...`);
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(adminPassword, salt);
    await db
      .insert(schema.adminUsers)
      .values({
        id: `admin-${Date.now()}`,
        email: adminEmail.toLowerCase().trim(),
        passwordHash: hash,
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .onConflictDoNothing();
    console.log('[Seed] Administrator user seeded successfully.');
  } else {
    console.log(
      '[Seed] Note: ADMIN_SEED_EMAIL and ADMIN_SEED_PASSWORD not set in environment. Skipping admin creation.'
    );
  }

  console.log('[Seed] Neon PostgreSQL database initialization complete!');
}

runSeed().catch((err) => {
  console.error('[Seed] Database initialization error:', err);
  process.exit(1);
});
