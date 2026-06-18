import { NextResponse } from "next/server";
import { db, users, skills } from "@skill-loop/db";
import { requireUser } from "../../_lib/auth";
import { hashPassword } from "../../_lib/password";

export const runtime = "nodejs";

// ─── All demo accounts (including extra mentors for the seed skills) ──────────

const SEED_USERS = [
  {
    id: "11111111-1111-4111-8111-111111111111",
    name: "Tiffany Chu",
    email: "learner@skillloop.test",
    password: "skillloop123",
    role: "learner"  as const,
    tokenBalance: 120,
    trustScore: 88,
  },
  {
    id: "22222222-2222-4222-8222-222222222222",
    name: "Nadia Putri",
    email: "mentor@skillloop.test",
    password: "skillloop123",
    role: "mentor" as const,
    tokenBalance: 260,
    trustScore: 92,
  },
  {
    id: "33333333-3333-4333-8333-333333333333",
    name: "Roti Nusa",
    email: "business@skillloop.test",
    password: "skillloop123",
    role: "business" as const,
    tokenBalance: 420,
    trustScore: 81,
  },
  {
    id: "44444444-4444-4444-8444-444444444444",
    name: "Skill Loop Admin",
    email: "admin@skillloop.test",
    password: "skillloop123",
    role: "admin" as const,
    tokenBalance: 0,
    trustScore: 100,
  },
  // Extra mentors referenced by seed skills
  {
    id: "55555555-5555-4555-8555-555555555555",
    name: "Raka Santoso",
    email: "raka@skillloop.test",
    password: "skillloop123",
    role: "mentor" as const,
    tokenBalance: 180,
    trustScore: 89,
  },
  {
    id: "66666666-6666-4666-8666-666666666666",
    name: "Maya Chen",
    email: "maya@skillloop.test",
    password: "skillloop123",
    role: "mentor" as const,
    tokenBalance: 140,
    trustScore: 86,
  },
  {
    id: "77777777-7777-4777-8777-777777777777",
    name: "Dimas Pratama",
    email: "dimas@skillloop.test",
    password: "skillloop123",
    role: "mentor" as const,
    tokenBalance: 220,
    trustScore: 90,
  },
];

const SEED_SKILLS = [
  {
    id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    mentorId: "22222222-2222-4222-8222-222222222222",
    title: "Basic Canva for UMKM",
    description: "Design promo posters, simple catalogs, and campaign templates for small businesses.",
    category: "Design",
    priceToken: 24,
    mode: "offline" as const,
    location: "Jakarta Selatan",
  },
  {
    id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
    mentorId: "55555555-5555-4555-8555-555555555555",
    title: "Excel Cashflow Basics",
    description: "Build a practical daily cashflow tracker for community projects and micro-businesses.",
    category: "Business",
    priceToken: 18,
    mode: "hybrid" as const,
    location: "Online + Bandung",
  },
  {
    id: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
    mentorId: "66666666-6666-4666-8666-666666666666",
    title: "Interview Preparation Clinic",
    description: "Practice structured answers, portfolio storytelling, and role-specific interview drills.",
    category: "Career",
    priceToken: 20,
    mode: "online" as const,
    location: "Google Meet",
  },
  {
    id: "dddddddd-dddd-4ddd-8ddd-dddddddddddd",
    mentorId: "77777777-7777-4777-8777-777777777777",
    title: "Website Sederhana untuk UMKM",
    description: "Create a responsive landing page, contact CTA, and product catalog section for a local business.",
    category: "Coding",
    priceToken: 32,
    mode: "hybrid" as const,
    location: "Online + Surabaya",
  },
];

export async function POST(request: Request) {
  if (!process.env.POSTGRES_URL) {
    return NextResponse.redirect(new URL("/admin?seed=demo-mode", request.url), 303);
  }

  // Only admin can trigger seed
  const caller = await requireUser(["admin"]);
  void caller; // just for auth check

  let usersInserted = 0;
  let skillsInserted = 0;
  const errors: string[] = [];

  // Insert users (skip if already exists)
  for (const u of SEED_USERS) {
    try {
      const result = await db
        .insert(users)
        .values({
          id: u.id,
          name: u.name,
          email: u.email,
          passwordHash: hashPassword(u.password),
          role: u.role,
          tokenBalance: u.tokenBalance,
          trustScore: u.trustScore,
          verified: u.role === "mentor" && u.trustScore >= 90,
        })
        .onConflictDoNothing();
      if ((result.rowCount ?? 0) > 0) usersInserted++;
    } catch (e) {
      errors.push(`User ${u.name}: ${e instanceof Error ? e.message : "unknown"}`);
    }
  }

  // Insert skills (skip if already exists)
  for (const s of SEED_SKILLS) {
    try {
      const result = await db
        .insert(skills)
        .values({
          id: s.id,
          mentorId: s.mentorId,
          title: s.title,
          description: s.description,
          category: s.category,
          priceToken: s.priceToken,
          mode: s.mode,
          location: s.location,
        })
        .onConflictDoNothing();
      if ((result.rowCount ?? 0) > 0) skillsInserted++;
    } catch (e) {
      errors.push(`Skill ${s.title}: ${e instanceof Error ? e.message : "unknown"}`);
    }
  }

  const hasErrors = errors.length > 0;
  const params = new URLSearchParams({
    seed: hasErrors ? "partial" : "done",
    users: String(usersInserted),
    skills: String(skillsInserted),
  });

  return NextResponse.redirect(new URL(`/admin?${params}`, request.url), 303);
}
