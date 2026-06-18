import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
  varchar
} from "drizzle-orm/pg-core";

export const userRole = pgEnum("user_role", ["learner", "mentor", "business", "admin"]);
export const sessionMode = pgEnum("session_mode", ["online", "offline", "hybrid"]);
export const bookingStatus = pgEnum("booking_status", ["pending", "confirmed", "completed", "cancelled"]);
export const transactionType = pgEnum("transaction_type", ["booking_hold", "booking_release", "review_bonus", "top_up", "refund"]);
export const projectStatus = pgEnum("project_status", ["open", "in_review", "assigned", "completed", "cancelled"]);
export const applicationStatus = pgEnum("application_status", ["submitted", "shortlisted", "accepted", "rejected"]);

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash"),
  role: userRole("role").notNull().default("learner"),
  tokenBalance: integer("token_balance").notNull().default(100),
  trustScore: integer("trust_score").notNull().default(50),
  verified: boolean("verified").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
});

export const skills = pgTable("skills", {
  id: uuid("id").defaultRandom().primaryKey(),
  mentorId: uuid("mentor_id").notNull().references(() => users.id),
  title: varchar("title", { length: 160 }).notNull(),
  description: text("description").notNull(),
  category: varchar("category", { length: 80 }).notNull(),
  priceToken: integer("price_token").notNull(),
  mode: sessionMode("mode").notNull().default("online"),
  location: varchar("location", { length: 160 }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
});

export const bookings = pgTable("bookings", {
  id: uuid("id").defaultRandom().primaryKey(),
  skillId: uuid("skill_id").notNull().references(() => skills.id),
  learnerId: uuid("learner_id").notNull().references(() => users.id),
  mentorId: uuid("mentor_id").notNull().references(() => users.id),
  scheduleTime: timestamp("schedule_time", { withTimezone: true }).notNull(),
  status: bookingStatus("status").notNull().default("pending"),
  mentorCompleted: boolean("mentor_completed").notNull().default(false),
  learnerCompleted: boolean("learner_completed").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
});

export const walletTransactions = pgTable("wallet_transactions", {
  id: uuid("id").defaultRandom().primaryKey(),
  senderId: uuid("sender_id").references(() => users.id),
  receiverId: uuid("receiver_id").references(() => users.id),
  amount: integer("amount").notNull(),
  type: transactionType("type").notNull(),
  bookingId: uuid("booking_id").references(() => bookings.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
});

export const reviews = pgTable("reviews", {
  id: uuid("id").defaultRandom().primaryKey(),
  bookingId: uuid("booking_id").notNull().references(() => bookings.id).unique(),
  reviewerId: uuid("reviewer_id").notNull().references(() => users.id),
  mentorId: uuid("mentor_id").notNull().references(() => users.id),
  rating: integer("rating").notNull(),
  comment: text("comment").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
});

export const businessProjects = pgTable("business_projects", {
  id: uuid("id").defaultRandom().primaryKey(),
  businessId: uuid("business_id").notNull().references(() => users.id),
  title: varchar("title", { length: 160 }).notNull(),
  description: text("description").notNull(),
  requiredSkill: varchar("required_skill", { length: 120 }).notNull(),
  rewardToken: integer("reward_token").notNull(),
  status: projectStatus("status").notNull().default("open"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
});

export const projectApplications = pgTable("project_applications", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id").notNull().references(() => businessProjects.id),
  applicantId: uuid("applicant_id").notNull().references(() => users.id),
  proposal: text("proposal").notNull(),
  status: applicationStatus("status").notNull().default("submitted"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
}, (table) => ({
  uniqueApplicant: unique("project_applications_project_applicant_unique").on(
    table.projectId,
    table.applicantId
  )
}));
