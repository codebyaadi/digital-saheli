import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { COURSES } from "./content-courses";
import {
  SCENARIOS, ALERTS, TIPS, HELP_TOPICS, PRIVACY_GUIDES, GOV_RESOURCES, SHGS, ANNOUNCEMENTS, PRODUCTS, NOTIFICATIONS,
} from "./content-misc";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_URL || process.env.DATABASE_URL,
    },
  },
});
const LEARNER_PW = "Demo@123";

/** Fixed "today" anchor so seeded meetings are always in the future after a re-seed. */
function atHour(daysFromNow: number, hour: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  d.setHours(hour, 0, 0, 0);
  return d;
}

async function main() {
  /* ---------------------------------------------------------------- users */
  const pw = await bcrypt.hash(LEARNER_PW, 10);
  const [admin] = await Promise.all([
    prisma.user.upsert({ where: { email: "admin@saheli.demo" }, update: {}, create: { name: "Demo Admin", email: "admin@saheli.demo", password: pw, role: "ADMIN", village: "Rampur", language: "en" } }),
    prisma.user.upsert({ where: { email: "demo@saheli.demo" }, update: {}, create: { name: "Demo Saheli", email: "demo@saheli.demo", password: pw, role: "LEARNER", village: "Rampur" } }),
  ]);

  const leaders = await Promise.all(
    [
      ["Sunita Devi", "sunita@saheli.demo", "Bhilwara", "SHG_LEADER"],
      ["Kamla Patel", "kamla@saheli.demo", "Sonpur", "SHG_LEADER"],
      ["Rekha Yadav", "rekha@saheli.demo", "Kishanganj", "SHG_LEADER"],
    ].map(([name, email, village, role]) =>
      prisma.user.upsert({ where: { email }, update: {}, create: { name, email, password: pw, village, role } }),
    ),
  );

  // Extra learners so the admin analytics charts have something to show.
  const extras = await Promise.all(
    [
      ["Meena Kumari", "meena@saheli.demo", "Rampur"],
      ["Lakshmi Bai", "lakshmi@saheli.demo", "Bhilwara"],
      ["Anita Sharma", "anita@saheli.demo", "Sonpur"],
      ["Pooja Singh", "pooja@saheli.demo", "Kishanganj"],
    ].map(([name, email, village], i) =>
      prisma.user.upsert({ where: { email }, update: {}, create: { name, email, password: pw, village, createdAt: new Date(Date.now() - (i + 1) * 86_400_000) } }),
    ),
  );
  const demo = await prisma.user.findUniqueOrThrow({ where: { email: "demo@saheli.demo" } });
  const allLearners = [demo, ...extras];

  /* -------------------------------------------------------------- courses */
  const courseIds = new Map<string, string>();
  for (const [i, c] of COURSES.entries()) {
    const course = await prisma.course.upsert({
      where: { slug: c.slug },
      update: { title: c.title, titleHi: c.titleHi, summary: c.summary, summaryHi: c.summaryHi, category: c.category, order: i },
      create: { slug: c.slug, title: c.title, titleHi: c.titleHi, summary: c.summary, summaryHi: c.summaryHi, category: c.category, order: i },
    });
    courseIds.set(c.slug, course.id);

    // Upsert lessons by (courseId, slug) so ids stay stable and progress is preserved.
    for (const [j, l] of c.lessons.entries()) {
      await prisma.lesson.upsert({
        where: { courseId_slug: { courseId: course.id, slug: l.slug } },
        update: { title: l.title, titleHi: l.titleHi, body: l.body, bodyHi: l.bodyHi, steps: l.steps, stepsHi: l.stepsHi, order: j },
        create: { courseId: course.id, slug: l.slug, title: l.title, titleHi: l.titleHi, body: l.body, bodyHi: l.bodyHi, steps: l.steps, stepsHi: l.stepsHi, order: j },
      });
    }

    // Only create the quiz once, so re-seeding does not wipe attempts and certificates.
    if (!(await prisma.quiz.findUnique({ where: { courseId: course.id } }))) {
      await prisma.quiz.create({
        data: {
          courseId: course.id,
          passMark: 60,
          questions: { create: c.quiz.map((q, qi) => ({ text: q.q, textHi: q.qHi, options: JSON.stringify(q.options), correctIdx: q.correct, explanation: q.why, order: qi })) },
        },
      });
    }
  }

  /* ---------------------------------------------------- demo learner state */
  // Give the demo learner a believable partial history so the dashboard is not empty.
  const partial = ["smartphone-basics", "internet-literacy"];
  for (const slug of partial) {
    const courseId = courseIds.get(slug)!;
    const lessons = await prisma.lesson.findMany({ where: { courseId }, orderBy: { order: "asc" }, select: { id: true } });
    for (const l of lessons.slice(0, 2)) {
      await prisma.lessonProgress.upsert({
        where: { userId_lessonId: { userId: demo.id, lessonId: l.id } },
        update: {},
        create: { userId: demo.id, lessonId: l.id },
      });
    }
  }
  // Simulated practice + two sample reports for the demo learner.
  const scenarios = await prisma.scamScenario.findMany({ take: 4 });
  if (scenarios.length > 0 && (await prisma.simulatorAttempt.count({ where: { userId: demo.id } })) === 0) {
    for (const s of scenarios) {
      await prisma.simulatorAttempt.create({ data: { userId: demo.id, scenarioId: s.id, answeredScam: s.isScam, correct: true } });
    }
  }

  /* --------------------------------------------------------- safety content */
  await prisma.scamScenario.deleteMany();
  await prisma.scamScenario.createMany({
    data: SCENARIOS.map((s, i) => ({ ...s, order: i })),
  });

  await prisma.alert.deleteMany();
  await prisma.alert.createMany({
    data: ALERTS.map((a, i) => ({ ...a, active: true, createdAt: new Date(Date.now() - i * 36_00_000) })),
  });

  await prisma.safetyTip.deleteMany();
  await prisma.safetyTip.createMany({ data: TIPS });

  for (const [i, h] of HELP_TOPICS.entries()) {
    await prisma.helpTopic.upsert({ where: { type: h.type }, update: { ...h, order: i }, create: { ...h, order: i } });
  }

  for (const [i, g] of PRIVACY_GUIDES.entries()) {
    await prisma.privacyGuide.upsert({ where: { topic: g.topic }, update: { ...g, order: i }, create: { ...g, order: i } });
  }

  await prisma.govResource.deleteMany();
  await prisma.govResource.createMany({
    data: GOV_RESOURCES.map((g) => ({ ...g, verifiedAt: new Date() })),
  });

  await prisma.announcement.deleteMany();
  await prisma.announcement.createMany({
    data: ANNOUNCEMENTS.map((a, i) => ({ ...a, groupId: null, createdAt: new Date(Date.now() - i * 36_00_000) })),
  });

  await prisma.notification.deleteMany();
  await prisma.notification.createMany({ data: NOTIFICATIONS.map((n) => ({ ...n, userId: null })) });

  /* ------------------------------------------------------------- SHGs */
  const allUsers = [demo, admin, ...leaders, ...extras];
  for (const seed of SHGS) {
    let group = await prisma.shgGroup.findFirst({ where: { name: seed.name } });
    group = group
      ? await prisma.shgGroup.update({ where: { id: group.id }, data: { village: seed.village, description: seed.description } })
      : await prisma.shgGroup.create({ data: { name: seed.name, village: seed.village, description: seed.description, formedAt: new Date("2021-04-01") } });

    // Add members, spreading the demo users across groups; first member is the leader.
    const members = allUsers.filter((u) => u.role !== "ADMIN").slice(0, 6);
    for (const [mi, u] of members.entries()) {
      await prisma.shgMember.upsert({
        where: { userId_groupId: { userId: u.id, groupId: group.id } },
        update: { isLeader: mi === 0 },
        create: { userId: u.id, groupId: group.id, isLeader: mi === 0 },
      });
    }

    if ((await prisma.meeting.count({ where: { groupId: group.id } })) === 0) {
      await prisma.meeting.createMany({
        data: seed.meetings.map((m) => ({
          groupId: group.id, title: m.title, startsAt: atHour(m.inDays, m.hour),
          mode: m.mode, location: m.location || null, agenda: m.agenda,
        })),
      });
    }
    if ((await prisma.announcement.count({ where: { groupId: group.id } })) === 0) {
      await prisma.announcement.createMany({
        data: seed.announcements.map((a) => ({ ...a, groupId: group.id })),
      });
    }
    if ((await prisma.resource.count({ where: { groupId: group.id } })) === 0) {
      await prisma.resource.createMany({ data: seed.resources.map((r) => ({ ...r, groupId: group.id })) });
    }
  }

  /* -------------------------------------------------------- digital business */
  if ((await prisma.product.count()) === 0) {
    const owners = [demo, ...leaders.slice(0, 2)];
    await prisma.product.createMany({
      data: PRODUCTS.map((p, i) => ({ ...p, ownerId: owners[i % owners.length].id })),
    });
  }

  /* ------------------------------------------------------------ reports */
  if ((await prisma.report.count()) === 0) {
    await prisma.report.createMany({
      data: [
        { userId: demo.id, type: "SUSPICIOUS_MESSAGE", description: "Got a fake KYC SMS with a link. I did not tap it and checked my app instead.", incidentDate: new Date(Date.now() - 3 * 86_400_000).toISOString().slice(0, 10), status: "REVIEWED" },
        { userId: demo.id, type: "PAYMENT_FRAUD", description: "A buyer sent a QR asking for my UPI PIN to receive money. I refused and blocked him.", status: "NEW" },
        { userId: extras[0].id, type: "CYBER_FRAUD", description: "Lost money in a fake job offer after paying a registration fee. Reporting for the demo.", incidentDate: new Date(Date.now() - 9 * 86_400_000).toISOString().slice(0, 10), status: "NEW" },
      ],
    });
  }

  /* ------------------------------------------------ message-check history */
  if ((await prisma.messageCheck.count()) === 0) {
    const { createHash } = await import("crypto");
    await prisma.messageCheck.createMany({
      data: [
        { userId: demo.id, textHash: createHash("sha256").update("demo-safe-sms").digest("hex"), indicators: "", verdict: "LIKELY_SAFE" },
        { userId: demo.id, textHash: createHash("sha256").update("demo-scam-sms").digest("hex"), indicators: "urgency,link,money", verdict: "POTENTIAL_SCAM" },
      ],
    });
  }

  console.log("Seed complete.");
  console.log(`  users: ${await prisma.user.count()}  courses: ${await prisma.course.count()}  lessons: ${await prisma.lesson.count()}`);
  console.log(`  questions: ${await prisma.question.count()}  shgs: ${await prisma.shgGroup.count()}  gov resources: ${await prisma.govResource.count()}`);
  console.log(`  admin:  ${admin.email} / ${LEARNER_PW}`);
  console.log(`  learner:${demo.email} / ${LEARNER_PW}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
