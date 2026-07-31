import { table, integer, text } from 'sdk/db';

export const users = table('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').unique().notNull(),
  username: text('username'),
  isAuthorized: integer('is_authorized', { mode: 'boolean' }).default(false),
});
