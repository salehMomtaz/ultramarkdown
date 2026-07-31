import { db } from 'sdk';
import { users } from 'schema';
import { eq } from 'sdk/db';

export async function isAuthorized(userId) {
  const user = await db.select().from(users).where(eq(users.userId, userId)).get();
  return user?.isAuthorized || false;
}

export async function addToWhitelist(userId, username) {
  await db.insert(users)
    .values({ userId, username, isAuthorized: true })
    .onConflictDoUpdate({
      target: users.userId,
      set: { isAuthorized: true }
    })
    .run();
}

export async function removeFromWhitelist(userId) {
  await db.update(users)
    .set({ isAuthorized: false })
    .where(eq(users.userId, userId))
    .run();
}
