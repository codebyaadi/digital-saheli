# Digital Saheli: Project Handoff (Next.js 16 + shadcn/ui + Phosphor + Prisma)

Topic: **Smartphone Usage & Online Safety for Women Self-Help Groups (SHGs)**
Tagline: *Learn. Connect. Stay Safe.* Type: College CEP project (demo, fictional data).

Use this file to continue the build on any account or platform. Paste it into a new chat and say: "Continue from Phase N."

---

## 1. Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack, React 19.2, TypeScript) |
| UI | shadcn/ui + Tailwind CSS |
| Icons | `@phosphor-icons/react` |
| Database | PostgreSQL (SQLite is fine for local demo) |
| ORM | Prisma |
| Auth | Own session auth: `bcryptjs` + `jose` (JWT in httpOnly cookie) |
| Validation | `zod` |
| i18n | `next-intl` or a simple JSON dictionary (`en`, `hi`; add more later) |
| Charts (admin) | shadcn `chart` (Recharts) |

Notes on Next.js 16: `params` and `searchParams` are async (`await params`), and the old `middleware.ts` is now `proxy.ts`. Check the official upgrade guide if something differs. Check Prisma docs for your installed version; Prisma 7 uses a `prisma.config.ts` file and may need a driver adapter and a generator `output` path.

## 2. Setup commands

```bash
npx create-next-app@latest digital-saheli --ts --tailwind --app --eslint
cd digital-saheli
npx shadcn@latest init
npx shadcn@latest add button card input label textarea select checkbox tabs dialog sheet dropdown-menu navigation-menu progress badge alert table accordion radio-group sonner chart avatar tooltip form
npm i @phosphor-icons/react zod bcryptjs jose @prisma/client
npm i -D prisma tsx @types/bcryptjs
npx prisma init
```

`.env`:
```
DATABASE_URL="postgresql://user:pass@localhost:5432/saheli"
AUTH_SECRET="generate-a-long-random-string"
```

Daily commands: `npx prisma migrate dev`, `npx prisma db seed`, `npm run dev`.

`package.json` seed hook: `"prisma": { "seed": "tsx prisma/seed.ts" }`

## 3. Navigation (do NOT list 16 items in the navbar)

`HOME | LEARN | SAFETY | PAYMENTS | SHG | TRAINING | HELP | LOGIN` + language selector + profile icon. Mobile: shadcn `Sheet` hamburger. Desktop: `NavigationMenu` dropdowns.

| Menu | Opens |
|---|---|
| LEARN | Smartphone Basics, WhatsApp, Internet Literacy |
| SAFETY | Cyber Safety Academy, Scam Simulator, Check Message |
| PAYMENTS | Safe Digital Payments |
| SHG | Community, Meetings, Digital Business, Government Services |
| TRAINING | Courses, Quiz, Certificate |
| HELP | Report & Get Help, Privacy & Emergency Center |
| LOGIN | Login, Register, Profile (Admin visible only for ADMIN role) |

## 4. The 16 modules: routes, tables, APIs

| # | Module | Route | Prisma models | API |
|---|---|---|---|---|
| 1 | Home / Dashboard | `/` , `/dashboard` | Alert, SafetyTip, Progress | `GET /api/alerts`, `GET /api/tips/today` |
| 2 | Registration & Login | `/login`, `/register`, `/profile` | User, Profile | `POST /api/auth/register`, `/login`, `/logout`, `GET/PATCH /api/me` |
| 3 | Smartphone Basics | `/learn/smartphone-basics` | Course, Lesson, LessonProgress | `GET /api/courses/[slug]`, `POST /api/lessons/[id]/complete` |
| 4 | WhatsApp & Communication | `/learn/whatsapp` | same | same |
| 5 | Internet Literacy | `/learn/internet` | same | same |
| 6 | Cyber Safety Academy | `/safety/academy` | Course, Lesson | same |
| 7 | Safe Digital Payments | `/payments` | Course, Lesson (stage: before/during/after) | same |
| 8 | Scam Awareness & Simulator | `/safety/simulator` | ScamScenario, SimulatorAttempt | `GET /api/scenarios`, `POST /api/scenarios/[id]/attempt` |
| 9 | Report & Get Help | `/help`, `/help/report` | HelpTopic, Report | `GET /api/help-topics`, `POST /api/reports` |
| 10 | SHG Community | `/shg`, `/shg/[id]` | ShgGroup, ShgMember, Meeting, Announcement, Resource | `GET/POST /api/shgs`, `/api/shgs/[id]/meetings` |
| 11 | Training & Certification | `/training`, `/training/[slug]/quiz`, `/training/certificate/[id]` | Course, Quiz, Question, QuizAttempt, Certificate | `POST /api/quizzes/[id]/submit`, `GET /api/certificates/[id]` |
| 12 | Check Suspicious Message | `/safety/check-message` | MessageCheck | `POST /api/check-message` (rule-based scoring; label it "educational, not a guaranteed detector") |
| 13 | Digital Business | `/shg/business` | Product | `GET/POST /api/products` |
| 14 | Government Services | `/government` | GovResource | `GET /api/gov-resources` |
| 15 | Privacy & Emergency Center | `/privacy` | PrivacyGuide, HelpTopic | `GET /api/privacy-guides` |
| 16 | Admin Panel | `/admin/*` | all, plus Notification | CRUD under `/api/admin/*`, `GET /api/admin/analytics` |

Admin sub-pages: overview, users, shgs, courses, lessons, quizzes, certificates, alerts, resources, announcements, reports, notifications, analytics. Protect them with a role check in a server helper and `proxy.ts`.

## 5. Prisma schema (`prisma/schema.prisma`)

For SQLite, change `provider` and turn enums into `String` fields.

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role         { LEARNER SHG_LEADER ADMIN }
enum Language     { en hi }
enum Severity     { LOW MEDIUM HIGH }
enum ReportStatus { NEW REVIEWED ESCALATED CLOSED }
enum ReportType   { CYBER_FRAUD SUSPICIOUS_CALL SUSPICIOUS_MESSAGE ACCOUNT_HACKED PAYMENT_FRAUD LOST_PHONE HARASSMENT GENERAL }
enum Category     { SMARTPHONE WHATSAPP INTERNET CYBER_SAFETY PAYMENTS SCAM_AWARENESS DIGITAL_BUSINESS }
enum Verdict      { LIKELY_SAFE BE_CAREFUL POTENTIAL_SCAM }

model User {
  id           String   @id @default(cuid())
  name         String
  email        String?  @unique
  mobile       String?  @unique
  passwordHash String
  role         Role     @default(LEARNER)
  language     Language @default(en)
  createdAt    DateTime @default(now())

  shgMemberships  ShgMember[]
  lessonProgress  LessonProgress[]
  quizAttempts    QuizAttempt[]
  certificates    Certificate[]
  reports         Report[]
  simAttempts     SimulatorAttempt[]
  messageChecks   MessageCheck[]
  notifications   Notification[]
  products        Product[]
}

model Course {
  id          String   @id @default(cuid())
  slug        String   @unique
  titleEn     String
  titleHi     String?
  summaryEn   String
  summaryHi   String?
  category    Category
  published   Boolean  @default(true)
  order       Int      @default(0)
  lessons     Lesson[]
  quiz        Quiz?
  certificates Certificate[]
}

model Lesson {
  id         String  @id @default(cuid())
  courseId   String
  course     Course  @relation(fields: [courseId], references: [id], onDelete: Cascade)
  slug       String
  titleEn    String
  titleHi    String?
  bodyEn     String  // markdown
  bodyHi     String?
  steps      Json?   // ["Open Settings", "Tap Wi-Fi", ...]
  order      Int     @default(0)
  progress   LessonProgress[]
  @@unique([courseId, slug])
}

model LessonProgress {
  id          String   @id @default(cuid())
  userId      String
  lessonId    String
  completedAt DateTime @default(now())
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  lesson      Lesson   @relation(fields: [lessonId], references: [id], onDelete: Cascade)
  @@unique([userId, lessonId])
}

model Quiz {
  id        String     @id @default(cuid())
  courseId  String     @unique
  course    Course     @relation(fields: [courseId], references: [id], onDelete: Cascade)
  passMark  Int        @default(60)   // percent
  questions Question[]
  attempts  QuizAttempt[]
}

model Question {
  id          String @id @default(cuid())
  quizId      String
  quiz        Quiz   @relation(fields: [quizId], references: [id], onDelete: Cascade)
  textEn      String
  textHi      String?
  options     Json   // string[]
  correctIdx  Int
  explanation String
  order       Int    @default(0)
}

model QuizAttempt {
  id        String   @id @default(cuid())
  userId    String
  quizId    String
  score     Int
  total     Int
  passed    Boolean
  createdAt DateTime @default(now())
  user      User @relation(fields: [userId], references: [id], onDelete: Cascade)
  quiz      Quiz @relation(fields: [quizId], references: [id], onDelete: Cascade)
}

model Certificate {
  id        String   @id @default(cuid())
  code      String   @unique   // e.g. DS-2026-000123
  userId    String
  courseId  String
  issuedAt  DateTime @default(now())
  user      User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  course    Course @relation(fields: [courseId], references: [id], onDelete: Cascade)
  @@unique([userId, courseId])
}

model ScamScenario {
  id          String   @id @default(cuid())
  type        String   // fake_kyc, bank_call, job_offer, qr, lottery, support, genuine
  message     String
  isScam      Boolean
  explanation String
  attempts    SimulatorAttempt[]
}

model SimulatorAttempt {
  id         String   @id @default(cuid())
  userId     String
  scenarioId String
  answeredScam Boolean
  correct    Boolean
  createdAt  DateTime @default(now())
  user       User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  scenario   ScamScenario @relation(fields: [scenarioId], references: [id], onDelete: Cascade)
}

model MessageCheck {
  id        String   @id @default(cuid())
  userId    String?
  user      User?    @relation(fields: [userId], references: [id], onDelete: SetNull)
  textHash  String   // store a hash only, not the message (privacy)
  indicators Json    // ["urgency","link","otp_request"]
  verdict   Verdict
  createdAt DateTime @default(now())
}

model Alert {
  id        String   @id @default(cuid())
  title     String
  body      String?
  severity  Severity @default(LOW)
  active    Boolean  @default(true)
  createdAt DateTime @default(now())
}

model SafetyTip {
  id     String @id @default(cuid())
  textEn String
  textHi String?
}

model HelpTopic {
  id        String     @id @default(cuid())
  type      ReportType @unique
  titleEn   String
  titleHi   String?
  steps     Json       // ordered guidance
  officialLinks Json   // [{label,url}] only verified government URLs
}

model Report {
  id          String       @id @default(cuid())
  userId      String?
  user        User?        @relation(fields: [userId], references: [id], onDelete: SetNull)
  type        ReportType
  description String
  incidentDate DateTime?
  attachmentUrl String?
  status      ReportStatus @default(NEW)
  createdAt   DateTime     @default(now())
  // DEMO: stored locally only; not forwarded to any authority.
}

model ShgGroup {
  id          String   @id @default(cuid())
  name        String
  village     String?
  description String?
  createdAt   DateTime @default(now())
  members     ShgMember[]
  meetings    Meeting[]
  announcements Announcement[]
  resources   Resource[]
}

model ShgMember {
  id       String   @id @default(cuid())
  userId   String
  groupId  String
  isLeader Boolean  @default(false)
  user     User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  group    ShgGroup @relation(fields: [groupId], references: [id], onDelete: Cascade)
  @@unique([userId, groupId])
}

model Meeting {
  id       String   @id @default(cuid())
  groupId  String
  title    String
  startsAt DateTime
  mode     String   // IN_PERSON | ONLINE
  location String?
  link     String?
  group    ShgGroup @relation(fields: [groupId], references: [id], onDelete: Cascade)
}

model Announcement {
  id        String    @id @default(cuid())
  groupId   String?   // null = platform-wide
  group     ShgGroup? @relation(fields: [groupId], references: [id], onDelete: Cascade)
  title     String
  body      String
  createdAt DateTime  @default(now())
}

model Resource {
  id       String    @id @default(cuid())
  groupId  String?
  group    ShgGroup? @relation(fields: [groupId], references: [id], onDelete: Cascade)
  title    String
  url      String
  kind     String    // pdf, link, video
}

model Product {
  id        String  @id @default(cuid())
  ownerId   String
  owner     User    @relation(fields: [ownerId], references: [id], onDelete: Cascade)
  name      String
  description String?
  priceInr  Int
  imageUrl  String?
  active    Boolean @default(true)
}

model GovResource {
  id          String @id @default(cuid())
  name        String
  description String
  eligibility String
  category    String   // SCHEMES, CERTIFICATES, EMPLOYMENT, WOMEN_WELFARE, SHG, DIGITAL
  officialUrl String   // must be a verified .gov.in / .nic.in URL
  verifiedAt  DateTime?
}

model PrivacyGuide {
  id      String @id @default(cuid())
  topic   String   // location, camera, microphone, contacts, app_permissions, account_security
  titleEn String
  bodyEn  String
  titleHi String?
  bodyHi  String?
}

model Notification {
  id        String   @id @default(cuid())
  userId    String?  // null = broadcast
  user      User?    @relation(fields: [userId], references: [id], onDelete: Cascade)
  title     String
  body      String
  readAt    DateTime?
  createdAt DateTime @default(now())
}
```

## 6. Suggested folder structure

```
src/
  app/
    (public)/ page.tsx  learn/  safety/  payments/  shg/  training/  help/  government/  privacy/
    (auth)/ login/  register/
    (app)/ dashboard/  profile/
    admin/ layout.tsx page.tsx users/ shgs/ courses/ ... analytics/
    api/ ... route handlers per section 4
  components/
    ui/ (shadcn)   layout/ (navbar, footer, logo, lang-switch)
    learn/ (lesson-view, step-list)   safety/ (simulator, message-checker)
    training/ (quiz, certificate)   admin/ (stat-card, data-table)
  lib/ prisma.ts  auth.ts  session.ts  scoring.ts  i18n/{en,hi}.json  gov-links.ts
  proxy.ts
prisma/ schema.prisma  seed.ts
```

`lib/prisma.ts` should use the standard singleton pattern so hot reload does not open many connections.

## 7. Key logic

- **Auth:** register hashes the password with bcrypt, then sets a signed JWT cookie (httpOnly, sameSite=lax). A `requireUser()` / `requireAdmin()` helper is used in server components and route handlers.
- **Message checker (`lib/scoring.ts`):** regex indicator groups (urgency, link, OTP/PIN/password request, money/fee request, authority claim, prize bait). 0 hits = LIKELY_SAFE, 1-2 = BE_CAREFUL, 3+ = POTENTIAL_SCAM. Always show the disclaimer. Store only a hash of the text.
- **Quiz submit:** compute the score on the server (never trust the client). If percent ≥ passMark, mark passed. If every lesson in the course is complete and the quiz is passed, create a Certificate with a unique code.
- **Progress:** percentage = completed lessons / total lessons in the course.
- **Analytics:** Prisma `count` and `groupBy` for the admin cards: total users, SHGs, courses completed, certificates, alerts, reports.

## 8. Seed data (`prisma/seed.ts`), all fictional

- Admin: `admin@saheli.demo` / `Admin@123` (change it). Learner: `demo@saheli.demo` / `Demo@123`.
- 7 courses (Smartphone Basics, Internet Literacy, WhatsApp Safety, Cyber Safety, Safe Digital Payments, Scam Awareness, Digital Business), each with 3-6 lessons and a 5-question quiz.
- 6 scam scenarios (fake KYC, fake bank call, fake job, QR, lottery, fake support) plus 1 genuine alert.
- 4 fictional SHGs (Lakshmi Mahila Mandal, Sunrise Women SHG, Navjeevan Sakhi Group, Gram Shakti SHG) with members, meetings, announcements.
- 4 fictional products, 3 alerts, 5 safety tips, 8 help topics, 6 privacy guides.
- GovResource links (official sites only): aajeevika.gov.in (DAY-NRLM), digilocker.gov.in, web.umang.gov.in, skillindiadigital.gov.in, india.gov.in, ncw.gov.in, sancharsaathi.gov.in, cybercrime.gov.in. **Re-check every link before the presentation.**

## 9. Content rules (important)

- Do not invent helplines, organizations or links. Known national numbers: 112 (emergency), 1930 (cyber fraud), 181 (women helpline). Re-verify on official sites before showing them.
- Report form and certificates must be labelled **demo**.
- Use simple language, large buttons, icons with labels, tooltips for difficult terms, and step-by-step lessons.
- Colours: purple `#5b2a86`, lavender `#f1eaff`, teal `#0f8a7e` for safety elements. Rounded cards. Support dark mode through shadcn tokens.
- Phosphor icon ideas: `DeviceMobile`, `ShieldCheck`, `WhatsappLogo`, `GlobeHemisphereWest`, `Password`, `CreditCard`, `Warning`, `LifebuoyIcon` (use `Lifebuoy`), `UsersThree`, `GraduationCap`, `MagnifyingGlass`, `Storefront`, `Bank`, `LockKey`, `Gear`.

## 10. Build phases

> **Live status is tracked in `PROGRESS.md`** (that file is the source of truth; the checklist below is the original plan only).

- [ ] **Phase 0:** scaffold, shadcn init, theme tokens, Phosphor, navbar/footer/logo, language switch
- [ ] **Phase 1:** Prisma schema, migration, seed script
- [ ] **Phase 2:** Auth (register, login, logout, profile, role guard, `proxy.ts`)
- [ ] **Phase 3:** Home dashboard (Modules 1), alerts, tip of the day, progress
- [ ] **Phase 4:** Learn modules (3, 4, 5) with lesson view and Mark as Complete (API + DB)
- [ ] **Phase 5:** Safety modules (6, 8, 12) with academy, simulator, message checker
- [ ] **Phase 6:** Payments (7), Help and Reports (9), Privacy and Emergency (15), Government (14)
- [ ] **Phase 7:** SHG (10) and Digital Business (13)
- [ ] **Phase 8:** Training (11): courses, quiz, certificate (printable)
- [ ] **Phase 9:** Admin panel (16): CRUD and analytics charts
- [ ] **Phase 10:** Hindi translations, responsive and accessibility pass, README, demo script

## 11. Demo path for the evaluator

Home → Learn → Smartphone Basics → WhatsApp → Internet Literacy → Safety → Scam Simulator → Check Message → Payments → SHG → Digital Business → Training → Quiz → Certificate → Help → Government Services → Privacy Center → Admin Dashboard.

## 12. Prompt to paste in a new chat

> I am building "Digital Saheli" (Next.js 16, shadcn/ui, Phosphor icons, Prisma + PostgreSQL). The full spec, schema and phase list are in the attached DIGITAL_SAHELI_PROJECT.md. Continue from Phase N. Output complete files with their paths, one phase at a time.

---

## Previous prototype

A single-file HTML prototype (`digital-saheli.html`) already covers the UI and demo flows (all main modules with in-browser data). Reuse its copy, lesson text, scam examples, quiz questions and layout when seeding the database.
