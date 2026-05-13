export type Skill = {
  id: string;
  mentorId: string;
  mentorName: string;
  mentorBadge: "verified" | "community";
  mentorRating: number;
  sessionsCompleted: number;
  trustScore: number;
  title: string;
  description: string;
  category: string;
  priceToken: number;
  mode: "online" | "offline" | "hybrid";
  location: string;
  schedule: string[];
};

export type BusinessProject = {
  id: string;
  businessName: string;
  title: string;
  description: string;
  requiredSkill: string;
  rewardToken: number;
  applicants: number;
  status: "open" | "in_review" | "assigned";
};

export type Booking = {
  id: string;
  skillId: string;
  skillTitle: string;
  learnerName: string;
  mentorName: string;
  scheduleTime: string;
  status: "pending" | "confirmed" | "completed";
  priceToken: number;
};

export type WalletTransaction = {
  id: string;
  label: string;
  amount: number;
  type: "debit" | "credit" | "bonus";
  createdAt: string;
};

export type LeaderboardEntry = {
  rank: number;
  name: string;
  specialty: string;
  sessions: number;
  rating: number;
  badge: "verified" | "rising" | "community";
};

export type SkillHeatmapZone = {
  area: string;
  demand: string;
  supply: string;
  intensity: "high" | "medium" | "emerging";
};

export type GovernanceRule = {
  title: string;
  status: "active" | "watching";
  detail: string;
};

export const seedSkills: Skill[] = [
  {
    id: "skill-canva-umkm",
    mentorId: "user-nadia",
    mentorName: "Nadia Putri",
    mentorBadge: "verified",
    mentorRating: 4.8,
    sessionsCompleted: 126,
    trustScore: 92,
    title: "Basic Canva for UMKM",
    description: "Design promo posters, simple catalogs, and campaign templates for small businesses.",
    category: "Design",
    priceToken: 24,
    mode: "offline",
    location: "Jakarta Selatan",
    schedule: ["Friday, 15 May 2026 16:00", "Saturday, 16 May 2026 10:00", "Tuesday, 19 May 2026 19:00"]
  },
  {
    id: "skill-excel-finance",
    mentorId: "user-raka",
    mentorName: "Raka Santoso",
    mentorBadge: "verified",
    mentorRating: 4.7,
    sessionsCompleted: 84,
    trustScore: 89,
    title: "Excel Cashflow Basics",
    description: "Build a practical daily cashflow tracker for community projects and micro-businesses.",
    category: "Business",
    priceToken: 18,
    mode: "hybrid",
    location: "Online + Bandung",
    schedule: ["Monday, 18 May 2026 19:00", "Wednesday, 20 May 2026 18:30", "Sunday, 24 May 2026 09:00"]
  },
  {
    id: "skill-interview",
    mentorId: "user-maya",
    mentorName: "Maya Chen",
    mentorBadge: "community",
    mentorRating: 4.9,
    sessionsCompleted: 52,
    trustScore: 86,
    title: "Interview Preparation Clinic",
    description: "Practice structured answers, portfolio storytelling, and role-specific interview drills.",
    category: "Career",
    priceToken: 20,
    mode: "online",
    location: "Google Meet",
    schedule: ["Thursday, 21 May 2026 20:00", "Friday, 22 May 2026 13:00", "Monday, 25 May 2026 19:30"]
  },
  {
    id: "skill-code-web",
    mentorId: "user-dimas",
    mentorName: "Dimas Pratama",
    mentorBadge: "verified",
    mentorRating: 4.6,
    sessionsCompleted: 98,
    trustScore: 90,
    title: "Website Sederhana untuk UMKM",
    description: "Create a responsive landing page, contact CTA, and product catalog section for a local business.",
    category: "Coding",
    priceToken: 32,
    mode: "hybrid",
    location: "Online + Surabaya",
    schedule: ["Saturday, 23 May 2026 13:00", "Sunday, 24 May 2026 15:00", "Wednesday, 27 May 2026 19:00"]
  }
];

export const seedProjects: BusinessProject[] = [
  {
    id: "project-poster",
    businessName: "Roti Nusa",
    title: "Poster promo Ramadan",
    description: "A local bakery needs a social promo poster and WhatsApp catalog cover.",
    requiredSkill: "Canva design",
    rewardToken: 40,
    applicants: 3,
    status: "open"
  },
  {
    id: "project-website",
    businessName: "Loop Cowork",
    title: "Simple profile website",
    description: "A community coworking space needs a one-page site for events and booking inquiries.",
    requiredSkill: "Frontend",
    rewardToken: 90,
    applicants: 5,
    status: "in_review"
  },
  {
    id: "project-ads",
    businessName: "Kain Kita",
    title: "Social ads setup",
    description: "An UMKM fashion seller needs help setting up Meta Ads audiences and first campaign.",
    requiredSkill: "Digital marketing",
    rewardToken: 55,
    applicants: 2,
    status: "open"
  }
];

export const seedBookings: Booking[] = [
  {
    id: "booking-1",
    skillId: "skill-canva-umkm",
    skillTitle: "Basic Canva for UMKM",
    learnerName: "Tiffany Chu",
    mentorName: "Nadia Putri",
    scheduleTime: "Friday, 15 May 2026 16:00",
    status: "confirmed",
    priceToken: 24
  },
  {
    id: "booking-2",
    skillId: "skill-excel-finance",
    skillTitle: "Excel Cashflow Basics",
    learnerName: "Tiffany Chu",
    mentorName: "Raka Santoso",
    scheduleTime: "Monday, 18 May 2026 19:00",
    status: "pending",
    priceToken: 18
  },
  {
    id: "booking-3",
    skillId: "skill-interview",
    skillTitle: "Interview Preparation Clinic",
    learnerName: "Ayu Lestari",
    mentorName: "Maya Chen",
    scheduleTime: "Thursday, 21 May 2026 20:00",
    status: "completed",
    priceToken: 20
  }
];

export const seedWalletTransactions: WalletTransaction[] = [
  {
    id: "tx-1",
    label: "Booked Basic Canva for UMKM",
    amount: -24,
    type: "debit",
    createdAt: "13 May 2026"
  },
  {
    id: "tx-2",
    label: "Review bonus",
    amount: 2,
    type: "bonus",
    createdAt: "12 May 2026"
  },
  {
    id: "tx-3",
    label: "Mentoring release",
    amount: 18,
    type: "credit",
    createdAt: "10 May 2026"
  }
];

export const seedLeaderboard: LeaderboardEntry[] = [
  {
    rank: 1,
    name: "Nadia Putri",
    specialty: "UMKM design",
    sessions: 126,
    rating: 4.8,
    badge: "verified"
  },
  {
    rank: 2,
    name: "Dimas Pratama",
    specialty: "Frontend websites",
    sessions: 98,
    rating: 4.6,
    badge: "verified"
  },
  {
    rank: 3,
    name: "Raka Santoso",
    specialty: "Business finance",
    sessions: 84,
    rating: 4.7,
    badge: "verified"
  },
  {
    rank: 4,
    name: "Maya Chen",
    specialty: "Career coaching",
    sessions: 52,
    rating: 4.9,
    badge: "rising"
  }
];

export const seedSkillHeatmap: SkillHeatmapZone[] = [
  {
    area: "Jakarta Selatan",
    demand: "Canva, social ads, video editing",
    supply: "High mentor availability",
    intensity: "high"
  },
  {
    area: "Bandung",
    demand: "Excel, finance, content planning",
    supply: "Balanced learner demand",
    intensity: "medium"
  },
  {
    area: "Surabaya",
    demand: "Simple websites, product catalog",
    supply: "Emerging mentor cluster",
    intensity: "emerging"
  }
];

export const seedGovernanceRules: GovernanceRule[] = [
  {
    title: "Review lock",
    status: "active",
    detail: "Learners can review only after a booking is marked completed."
  },
  {
    title: "Self-booking prevention",
    status: "active",
    detail: "Mentors cannot spend tokens on their own classes."
  },
  {
    title: "Token escrow",
    status: "active",
    detail: "Learner tokens are held first and released to mentors after completion."
  },
  {
    title: "UMKM applicant privacy",
    status: "watching",
    detail: "Only the project owner can review the applicant pipeline."
  }
];

export function getSkillById(id: string) {
  return seedSkills.find((skill) => skill.id === id);
}

export function getMarketplaceSnapshot() {
  return {
    skills: seedSkills,
    projects: seedProjects,
    featuredSkill: seedSkills[0],
    featuredProject: seedProjects[0],
    stats: {
      activeSessions: 12,
      learnerBalance: 120,
      mentorTokensEarned: 18,
      trustScore: 88,
      mentorRating: 4.8
    },
    bookings: seedBookings,
    walletTransactions: seedWalletTransactions,
    leaderboard: seedLeaderboard,
    heatmap: seedSkillHeatmap,
    governanceRules: seedGovernanceRules
  };
}
