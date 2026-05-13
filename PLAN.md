# Skill Loop
## Community Skill Exchange & Business Skill Platform

**Tagline:**  
**Building Smarter Communities Through Shared Skills**

---

# 1. Big Idea

Skill Loop adalah platform pertukaran skill berbasis komunitas, di mana user bisa belajar, mengajar, booking sesi, mendapatkan token, membangun reputasi, dan terhubung dengan kebutuhan bisnis lokal/UMKM.

Fokusnya bukan cuma kursus online, tapi:

> Local Skill Economy Platform

Artinya skill warga bisa diputar kembali menjadi value untuk komunitas dan bisnis lokal.

---

# 2. Smart City Angle

## Problem Kota Modern

Banyak orang:
- punya skill tapi tidak punya akses pasar
- ingin belajar tapi mahal
- komunitas lokal kurang terkoneksi
- UMKM sulit mencari talent lokal
- skill warga tidak terpetakan

## Solusi Skill Loop

Skill Loop menghubungkan:
- warga
- mentor
- learner
- UMKM
- komunitas
- coworking space
- local business

dalam satu platform pertukaran skill.

---

# 3. Core Interaction

## Main Flow

Mentor membuat kelas → Learner booking → Token berpindah → Sesi berjalan → Review diberikan → Reputasi mentor naik

## Contoh Flow

1. Mentor upload kelas “Basic Canva for UMKM”
2. Learner booking kelas menggunakan token
3. Sistem mengurangi token learner
4. Sistem menambah token mentor setelah sesi selesai
5. Learner memberikan review
6. Rating mentor meningkat
7. Mentor naik leaderboard

---

# 4. User Roles

| Role | Fungsi |
|---|---|
| Learner | Belajar skill dan booking sesi |
| Mentor | Membuka kelas dan menerima token |
| UMKM / Business | Posting kebutuhan skill atau project |
| Admin | Moderasi, verifikasi mentor, dan kontrol platform |

---

# 5. Fitur Utama

## A. Skill Marketplace

User dapat:
- membuka kelas
- mentoring
- workshop
- konsultasi singkat

### Contoh Skill
- Excel
- Canva
- coding
- public speaking
- bahasa Inggris
- desain
- social media marketing
- financial planning
- content creation

---

## B. Business Skill Hub

Kategori khusus untuk skill bisnis dan karier.

### Contoh
- CV review
- interview preparation
- business plan mentoring
- UMKM digitalization
- pitching
- basic accounting
- branding
- social media ads

---

## C. Token Wallet System

### Teach to Earn

### Flow Token
- Mengajar → mendapatkan token
- Belajar → membayar token
- Memberikan review → bonus token kecil
- Mentor aktif → naik ranking

### Fungsi Token
- booking kelas
- unlock workshop premium
- priority booking
- reward system

---

## D. Booking System

User dapat:
- memilih kelas
- memilih mentor
- memilih jadwal
- booking sesi online/offline

---

## E. Review & Reputation System

Setiap mentor memiliki:
- rating
- jumlah sesi selesai
- trust score
- mentor badge
- leaderboard ranking

---

## F. Community Project Board

UMKM dapat memposting kebutuhan project.

### Contoh
- “Butuh desain poster promo”
- “Butuh mentor digital marketing”
- “Butuh website sederhana”
- “Butuh video editor untuk produk”

Mentor atau user lain dapat apply ke project tersebut.

---

# 6. Kenapa Ini Platform

Skill Loop memiliki multi-sided ecosystem.

| Producer | Consumer |
|---|---|
| Mentor | Learner |
| UMKM | Mentor / freelancer |
| Community organizer | Participant |

Platform berfungsi untuk:
- memfasilitasi interaksi
- mengatur trust
- mengelola transaksi skill dan token

Skill Loop bukan sekadar CRUD application.

---

# 7. Arsitektur Platform

# A. Infrastructure Layer

## Tech Stack

| Component | Technology |
|---|---|
| Frontend | Next.js + Tailwind CSS |
| Backend | Next.js API Routes / Server Actions |
| Database | Supabase PostgreSQL |
| Authentication | Supabase Auth |
| Storage | Supabase Storage |
| ORM | Prisma / Supabase Client |
| Hosting | Vercel |
| Optional AI | Gemini API / OpenAI API |

---

## Fungsi Infrastructure Layer

- menyimpan user data
- menyimpan booking
- menyimpan token transaction
- file upload
- authentication
- centralized data management

---

# B. Service Layer

Skill Loop menggunakan modular service architecture.

| Service | Fungsi |
|---|---|
| Auth Service | Login, register, role user |
| Skill Service | Create, edit, search kelas |
| Booking Service | Booking dan update status |
| Wallet Service | Token transaction |
| Review Service | Rating dan review |
| Project Service | Posting dan apply project |
| Admin Service | Moderasi dan governance |

Semua service dipisahkan dari tampilan frontend sehingga reusable untuk interface lain.

---

# C. Interface Layer

Interface dibangun menggunakan Next.js dan responsive untuk mobile.

## Pages
- Landing page
- Skill marketplace
- Class detail page
- Booking page
- Mentor dashboard
- Learner dashboard
- UMKM project board
- Admin dashboard

---

# D. Governance & Trust

## Security Features

- Supabase Authentication
- JWT session validation
- Role-based access control
- Row Level Security
- Verified mentor badge
- Report system
- Protected API routes

## Governance Rules

- learner tidak dapat review sebelum sesi selesai
- mentor tidak dapat booking kelas sendiri
- token mentor masuk setelah sesi selesai
- UMKM hanya dapat melihat applicant project miliknya
- admin dapat suspend user atau class bermasalah

---

# E. Ecosystem Incentives

## Retention Features

- token reward
- mentor leaderboard
- verified mentor badge
- learning streak
- featured mentor
- project reward
- community ranking

---

# 8. Database Design

## users
- id
- name
- email
- role
- token_balance
- trust_score
- created_at

---

## skills
- id
- mentor_id
- title
- description
- category
- price_token
- mode
- location
- created_at

---

## bookings
- id
- skill_id
- learner_id
- mentor_id
- schedule_time
- status
- created_at

---

## wallet_transactions
- id
- sender_id
- receiver_id
- amount
- type
- booking_id
- created_at

---

## reviews
- id
- booking_id
- reviewer_id
- mentor_id
- rating
- comment
- created_at

---

## business_projects
- id
- business_id
- title
- description
- required_skill
- reward_token
- status
- created_at

---

## project_applications
- id
- project_id
- applicant_id
- proposal
- status
- created_at

---

# 9. Architecture Flow

## Data Flow

1. User login menggunakan Supabase Auth
2. User mengakses frontend Next.js
3. Frontend memanggil API Routes / Server Actions
4. Service layer memproses request
5. Database PostgreSQL menyimpan data
6. Response dikirim kembali ke frontend

---

# 10. Deployment Architecture

## Vercel-First Architecture

Skill Loop dirancang agar deployment mudah untuk tim kecil.

| Layer | Deployment |
|---|---|
| Frontend | Vercel |
| API Routes | Vercel Serverless Functions |
| Database | Supabase PostgreSQL |
| Storage | Supabase Storage |
| Authentication | Supabase Auth |

## Keuntungan

- tidak perlu setup VPS
- deployment otomatis
- mudah scaling
- mudah integrasi Next.js
- cocok untuk 2 developer

---

# 11. Business Model

## A. Token Top Up

User dapat membeli token untuk kelas premium.

---

## B. Featured Mentor

Mentor dapat membayar agar kelas tampil lebih atas.

---

## C. UMKM Project Fee

UMKM membayar biaya kecil untuk posting project atau mencari talent.

---

## D. Community Partnership

Kampus, komunitas, coworking space, atau kelurahan dapat membuat program sponsor.

### Contoh
“100 warga belajar digital skill bulan ini”

---

# 12. Value Proposition

## Untuk Learner
- belajar murah
- local mentor
- komunitas nyata

## Untuk Mentor
- monetisasi skill
- membangun reputasi
- networking

## Untuk UMKM
- akses cepat ke talent lokal

## Untuk Kota / Komunitas
- peningkatan skill warga
- community empowerment
- local economy growth

---

# 13. MVP Scope

## Core Features
- login/register
- role management
- skill marketplace
- create class
- booking class
- token wallet
- review mentor
- mentor dashboard
- learner dashboard
- project board
- admin moderation

## Optional Features
- AI skill description generator
- leaderboard
- mentor badges
- skill heatmap

---

# 14. Pembagian Kerja 2 Orang

## Developer 1
Frontend:
- landing page
- dashboard
- marketplace UI
- booking UI
- project board UI

## Developer 2
Backend:
- database schema
- Supabase integration
- auth
- API routes
- token logic
- booking logic
- governance rules

---

# 15. Demo Scenario

1. Mentor login
2. Mentor membuat kelas “Canva for UMKM”
3. Learner login
4. Learner booking kelas
5. Token learner berkurang
6. Mentor menyelesaikan sesi
7. Token mentor bertambah
8. Learner memberikan review
9. Rating mentor meningkat
10. UMKM memposting project
11. Mentor apply ke project

Demo ini menunjukkan:
- platform interaction
- governance
- reusable service architecture
- ecosystem incentives
- smart city relevance
- business impact

---

# 16. Mapping Komponen Wajib Platform

Berdasarkan dokumen tugas II2210 Teknologi Platform, Skill Loop memenuhi seluruh komponen wajib platform berikut.

| Komponen Wajib | Implementasi pada Skill Loop |
|---|---|
| Core Interaction | Mentor membuat kelas → learner booking → token transaction → sesi berlangsung → review → reputasi mentor meningkat |
| Infrastructure Layer | Menggunakan Supabase PostgreSQL, Supabase Storage, dan Supabase Auth untuk pengelolaan data, file, dan authentication secara terpusat |
| Service Layer | Menggunakan modular services seperti Auth Service, Skill Service, Booking Service, Wallet Service, Review Service, dan Project Service |
| Governance & Trust | Menggunakan authentication, role-based access control, Row Level Security, report system, dan verified mentor badge |
| Ecosystem Incentives | Menggunakan token reward, leaderboard, mentor badge, learning streak, featured mentor, dan project reward untuk menjaga keberlanjutan platform |

---

# 17. Penjelasan Komponen Wajib Secara Detail

## A. Core Interaction

### Penjelasan
Core interaction pada Skill Loop adalah proses pertukaran value antara mentor dan learner.

### Producer
- Mentor
- UMKM

### Consumer
- Learner
- Mentor/freelancer lain

### Alur Interaksi
1. Mentor membuat kelas
2. Learner melakukan booking
3. Sistem melakukan token transaction
4. Sesi berlangsung
5. Learner memberikan review
6. Reputasi mentor meningkat

### Nilai yang Dipertukarkan
- Skill
- Knowledge
- Reputation
- Token
- Opportunity/project

Skill Loop memenuhi konsep platform karena mempertemukan producer dan consumer dalam satu ecosystem.

---

## B. Infrastructure Layer

### Penjelasan
Infrastructure Layer digunakan untuk mengelola seluruh resource dan data platform secara terpusat.

### Implementasi
| Resource | Technology |
|---|---|
| Database | Supabase PostgreSQL |
| Authentication | Supabase Auth |
| File Storage | Supabase Storage |
| Hosting | Vercel |
| Backend Runtime | Next.js Serverless Functions |

### Fungsi
- menyimpan data user
- menyimpan booking
- menyimpan transaction token
- upload profile image
- authentication management
- centralized resource management

### Alasan Pemilihan
Arsitektur dipilih karena:
- deployment mudah untuk tim kecil
- scalable
- mudah integrasi dengan Next.js
- serverless friendly
- cocok untuk deployment cepat menggunakan Vercel

---

## C. Service Layer

### Penjelasan
Skill Loop menggunakan modular service architecture sehingga logic platform dipisahkan dari tampilan frontend.

### Service Modules

| Service | Fungsi |
|---|---|
| Auth Service | Login dan register |
| Skill Service | Create/search/edit class |
| Booking Service | Booking dan schedule management |
| Wallet Service | Token transaction |
| Review Service | Rating dan review |
| Project Service | UMKM project management |
| Admin Service | Moderation dan governance |

### Keuntungan
- reusable
- scalable
- maintainable
- mudah dikembangkan ke mobile app di masa depan

Skill Loop memenuhi syarat service layer karena functionality dipisahkan dari interface.

---

## D. Governance & Trust

### Penjelasan
Skill Loop memiliki sistem governance untuk memastikan hanya user legal yang dapat menggunakan platform.

### Implementasi Security
- Supabase Authentication
- JWT session validation
- protected API routes
- role-based access control
- Row Level Security
- report system
- mentor verification

### Governance Rules
- learner tidak bisa review sebelum sesi selesai
- mentor tidak bisa booking kelas sendiri
- token hanya berpindah setelah sesi selesai
- admin dapat suspend user bermasalah
- project hanya dapat diakses pihak terkait

### Tujuan
- menjaga keamanan platform
- meningkatkan trust antar user
- mencegah abuse/fraud

---

## E. Ecosystem Incentives

### Penjelasan
Skill Loop memiliki berbagai fitur retention agar user terus menggunakan platform.

### Incentive Features
- token reward
- mentor leaderboard
- learning streak
- verified mentor badge
- featured mentor
- project reward
- reputation score

### Dampak
- meningkatkan engagement user
- mendorong mentor aktif mengajar
- meningkatkan kualitas kelas
- membangun ecosystem berkelanjutan

Skill Loop memenuhi syarat ecosystem incentives karena memiliki sistem reward dan retention yang menjaga keberlanjutan platform.

---

# 18. Feature List & Flow Usage

Bagian ini merangkum fitur utama Skill Loop beserta alur penggunaan setiap fitur agar platform mudah dipahami, didemokan, dan diimplementasikan.

---

## 18.1 Skill Marketplace

### Deskripsi
Marketplace adalah tempat learner menemukan kelas, mentoring, workshop, atau konsultasi singkat dari mentor lokal.

### Fitur
- daftar kelas berdasarkan kategori skill
- detail mentor, rating, trust score, badge, dan jumlah sesi selesai
- informasi harga token
- mode kelas: online, offline, atau hybrid
- lokasi kelas
- jadwal sesi tersedia

### Flow Usage
1. Learner membuka halaman marketplace.
2. Learner memilih kategori skill atau melihat daftar kelas.
3. Learner membuka detail kelas.
4. Sistem menampilkan informasi mentor, harga token, jadwal, mode, dan lokasi.
5. Learner memilih jadwal.
6. Learner melakukan booking menggunakan token.
7. Booking masuk ke learner dashboard dan mentor dashboard.

---

## 18.2 Class Detail & Booking System

### Deskripsi
Halaman detail kelas menjadi titik utama transaksi antara learner dan mentor.

### Fitur
- detail kelas
- profil mentor
- pilihan jadwal
- harga token
- tombol booking
- status booking

### Flow Usage
1. Learner memilih kelas.
2. Learner melihat detail dan jadwal.
3. Learner menekan tombol booking.
4. Sistem memvalidasi:
   - learner memiliki token cukup
   - learner bukan mentor kelas tersebut
   - jadwal tersedia
5. Sistem membuat booking dengan status `pending`.
6. Token learner masuk ke mekanisme hold/escrow.
7. Setelah mentor mengonfirmasi, status menjadi `confirmed`.
8. Setelah sesi selesai, status menjadi `completed`.

---

## 18.3 Token Wallet System

### Deskripsi
Token menjadi medium transaksi utama untuk belajar, mengajar, reward, dan incentive.

### Fitur
- token balance
- riwayat transaksi
- token hold saat booking
- token release setelah sesi selesai
- bonus token untuk review
- reward untuk mentor aktif

### Flow Usage
1. Learner melakukan booking kelas.
2. Sistem mengurangi/menahan token learner.
3. Sesi berlangsung.
4. Mentor menandai sesi selesai.
5. Sistem memindahkan token ke mentor.
6. Learner memberi review.
7. Sistem memberi bonus token kecil kepada learner.
8. Riwayat transaksi tercatat di wallet.

---

## 18.4 Learner Dashboard

### Deskripsi
Dashboard learner digunakan untuk memantau aktivitas belajar, booking, wallet, dan review.

### Fitur
- booking aktif
- booking selesai
- token balance
- wallet activity
- review completed session
- rekomendasi kelas berikutnya
- trust score learner

### Flow Usage
1. Learner login.
2. Learner melihat daftar booking.
3. Learner melihat status sesi: `pending`, `confirmed`, atau `completed`.
4. Jika sesi sudah selesai, learner dapat memberi review.
5. Learner melihat perubahan wallet setelah transaksi.
6. Sistem menampilkan rekomendasi kelas lanjutan.

---

## 18.5 Mentor Dashboard

### Deskripsi
Dashboard mentor digunakan untuk mengelola kelas, melihat booking masuk, menyelesaikan sesi, dan memantau reputasi.

### Fitur
- daftar kelas milik mentor
- draft kelas baru
- booking masuk
- pending token release
- rating mentor
- trust score
- leaderboard rank
- verified mentor badge

### Flow Usage
1. Mentor login.
2. Mentor membuat atau mengedit kelas.
3. Learner melakukan booking.
4. Booking muncul di dashboard mentor.
5. Mentor menjalankan sesi.
6. Mentor menandai sesi selesai.
7. Sistem me-release token ke wallet mentor.
8. Rating dan trust score mentor diperbarui setelah review.
9. Mentor dapat naik leaderboard.

---

## 18.6 Review & Reputation System

### Deskripsi
Sistem review menjaga kualitas mentor dan membangun trust antar user.

### Fitur
- rating mentor
- komentar learner
- trust score
- verified mentor badge
- completed session count
- leaderboard

### Flow Usage
1. Learner menyelesaikan sesi.
2. Sistem membuka akses review.
3. Learner memberi rating dan komentar.
4. Sistem memperbarui rating mentor.
5. Sistem memperbarui trust score.
6. Mentor dengan performa baik mendapat badge/ranking lebih tinggi.

### Governance Rule
Learner tidak dapat memberi review jika booking belum berstatus `completed`.

---

## 18.7 UMKM Project Board

### Deskripsi
Project board menghubungkan UMKM dengan mentor atau user yang memiliki skill sesuai kebutuhan bisnis.

### Fitur
- posting project UMKM
- required skill
- reward token
- project status
- applicant count
- apply to project

### Flow Usage
1. UMKM login sebagai business user.
2. UMKM membuat project baru.
3. Sistem menampilkan project di project board.
4. Mentor/user melihat project.
5. Mentor/user apply ke project.
6. UMKM melihat daftar applicant.
7. UMKM memilih applicant.
8. Project berjalan dan reward token diberikan setelah selesai.

---

## 18.8 Applicant Pipeline

### Deskripsi
Applicant pipeline membantu UMKM mengelola kandidat yang apply ke project.

### Fitur
- submitted applicants
- shortlisted applicants
- accepted applicant
- status application
- owner-only applicant visibility

### Flow Usage
1. User apply ke project.
2. Application masuk ke tahap `submitted`.
3. UMKM meninjau proposal.
4. UMKM memindahkan kandidat ke `shortlisted`.
5. UMKM memilih satu kandidat sebagai `accepted`.
6. Kandidat menjalankan project.

### Governance Rule
Daftar applicant hanya dapat dilihat oleh pemilik project dan admin.

---

## 18.9 Admin Governance Dashboard

### Deskripsi
Admin dashboard digunakan untuk moderasi, verifikasi mentor, dan menjaga keamanan platform.

### Fitur
- mentor verification
- project moderation
- trust rule preview
- report handling
- suspend user/class/project
- governance rule monitoring

### Flow Usage
1. Admin login.
2. Admin melihat daftar mentor.
3. Admin memverifikasi mentor yang memenuhi kriteria.
4. Admin melihat daftar project.
5. Admin memoderasi project bermasalah.
6. Admin menindak laporan user.
7. Sistem menjaga rule seperti token escrow, review lock, dan self-booking prevention.

---

## 18.10 Smart City Skill Heatmap

### Deskripsi
Skill heatmap digunakan untuk melihat kebutuhan skill di area tertentu. Fitur ini memperkuat aspek smart city Skill Loop.

### Fitur
- area demand
- skill demand
- mentor supply
- intensity level
- insight untuk komunitas atau pemerintah lokal

### Flow Usage
1. Sistem mengumpulkan data kelas, booking, project, dan pencarian skill.
2. Sistem mengelompokkan data berdasarkan area.
3. Sistem menampilkan area dengan demand skill tinggi.
4. Community organizer atau partner melihat gap skill.
5. Partner membuat program training sesuai kebutuhan area.

### Contoh Insight
- Jakarta Selatan: demand tinggi untuk Canva, social ads, dan video editing.
- Bandung: demand menengah untuk Excel, finance, dan content planning.
- Surabaya: demand berkembang untuk website sederhana dan product catalog.

---

## 18.11 Mentor Leaderboard

### Deskripsi
Leaderboard memberi incentive kepada mentor aktif dan berkualitas.

### Fitur
- ranking mentor
- jumlah sesi selesai
- rating
- specialty
- badge

### Flow Usage
1. Mentor menyelesaikan sesi.
2. Learner memberi review.
3. Sistem menghitung rating, session count, dan trust score.
4. Sistem memperbarui leaderboard.
5. Mentor terbaik muncul sebagai featured mentor.

---

## 18.12 API Layer

### Deskripsi
API layer menyediakan backend function yang reusable dan siap dihubungkan dengan database PostgreSQL.

### Endpoint
- `GET /api/health`
- `GET /api/skills`
- `GET /api/projects`
- `POST /api/projects`
- `GET /api/bookings`
- `POST /api/bookings`
- `POST /api/projects/applications`
- `POST /api/reviews`
- `POST /api/admin/mentor-verification`

### Flow Usage
1. Frontend mengirim request ke API route.
2. API melakukan validasi input.
3. API menjalankan service/domain logic.
4. API membaca atau menulis data ke PostgreSQL.
5. API mengembalikan response atau redirect ke halaman terkait.

---

## 18.13 Full Platform Demo Flow

Flow berikut dapat digunakan untuk demo end-to-end.

1. Mentor membuka mentor dashboard.
2. Mentor membuat kelas “Basic Canva for UMKM”.
3. Learner membuka marketplace.
4. Learner memilih kelas Canva.
5. Learner booking kelas menggunakan token.
6. Booking muncul di learner dashboard dan mentor dashboard.
7. Mentor menyelesaikan sesi.
8. Token learner berpindah ke mentor.
9. Learner memberi review.
10. Rating mentor naik.
11. Mentor naik leaderboard.
12. UMKM memposting project “Poster promo Ramadan”.
13. Mentor apply ke project.
14. UMKM melihat applicant pipeline.
15. Admin memverifikasi mentor dan memoderasi project.
16. Skill heatmap memperlihatkan demand Canva/design meningkat di area tertentu.

---

# 19. Kesesuaian Dengan Kriteria Penilaian

| Kriteria Penilaian | Implementasi Skill Loop |
|---|---|
| Arsitektur Platform (35%) | Pemisahan jelas antara interface layer, service layer, dan infrastructure layer |
| Fungsionalitas/Core Interaction (25%) | Booking, token transaction, review, project collaboration berjalan end-to-end |
| Governance & Trust (10%) | Authentication, authorization, RLS, dan governance rules |
| Ecosystem Incentives (5%) | Token reward, leaderboard, badge, streak |
| Referensi (5%) | Menggunakan referensi arsitektur platform dan marketplace systems |
| Implementasi & Presentasi (20%) | Demo multi-role interaction dan architecture flow |

---

# 20. Architecture Justification

Skill Loop menggunakan pendekatan Vercel-first architecture dengan Next.js dan Supabase karena:

- deployment lebih sederhana untuk tim kecil
- tidak memerlukan setup VPS/manual server
- mendukung rapid development
- serverless architecture lebih scalable
- integrasi authentication dan database lebih cepat
- cocok untuk MVP dan platform prototype

Arsitektur ini juga memenuhi kebutuhan:
- centralized infrastructure
- modular services
- reusable backend functions
- secure authentication
- online deployment requirement

---

# 21. Kesimpulan

Skill Loop merupakan platform smart city berbasis community skill exchange yang:
- menghubungkan mentor, learner, dan UMKM
- membangun local knowledge economy
- memiliki modular architecture
- memiliki governance dan ecosystem incentives
- memenuhi seluruh komponen wajib platform pada tugas II2210 Teknologi Platform

Skill Loop tidak hanya berfungsi sebagai aplikasi pembelajaran, tetapi sebagai platform digital yang memungkinkan komunitas menciptakan value baru melalui pertukaran skill dan kolaborasi bisnis.
