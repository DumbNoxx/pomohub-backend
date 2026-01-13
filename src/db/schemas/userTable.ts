import { integer, pgEnum, pgTable, varchar } from "drizzle-orm/pg-core";

export const userRole = pgEnum("user_role", ["admin", "dev", "user"])

export const usersTable = pgTable("users", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  emailGithub: varchar("email_github", { length: 255 }).unique(),
  emailGoogle: varchar("email_google", { length: 255 }).unique(),
  usernameGithub: varchar("username_github", { length: 255 }).default(""),
  experience: integer("exp").default(0).notNull(),
  level: integer("level").default(1).notNull(),
  urlAvatarGithub: varchar("url_avatar_github", { length: 255 }).notNull().default(""),
  githubId: varchar("github_id", { length: 255 }),
  role: userRole().default("user")
});

