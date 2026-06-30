import { timestamp } from "drizzle-orm/cockroach-core";
import { pgTable, uuid, text, pgEnum } from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum('user_role', ['user', 'admin'])

export const UserTable = pgTable('users', {
    id: uuid().primaryKey().defaultRandom(),
    email: text().notNull().unique(),
    password: text().notNull(),
    role: userRoleEnum().notNull().default('user'),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
})