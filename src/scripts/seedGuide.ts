/**
 * seed-guides-v3.ts
 * ─────────────────────────────────────────────────────────────────
 * Seeds up to 30 GuideApplications from real USER-role accounts.
 *
 * Flow:
 *  1. Fetch all { role: "USER" } accounts → shuffle → pick 30
 *  2. Create one GuideApplication per user  (status: PENDING)
 *  3. Does NOT create GuideProfile — that fires via post-save hook
 *     on GuideApplication when status becomes APPROVED.
 *
 * Run (from project root):
 *   ts-node -r tsconfig-paths/register src/app/db/seed-guides.ts
 * ─────────────────────────────────────────────────────────────────
 */

import mongoose from "mongoose";
import { GuideApplication } from "../app/modules/guide/guide.model";
import { User } from "../app/modules/user/user.model";
import { GuideApplicationStatus } from "../app/modules/guide/guide.interface";

// ─────────────────────────────────────────────────────────────────
// All 8 Bangladesh Divisions — real names, dummy-but-valid ObjectIds
// Swap with real _ids from your Division collection if you have them
// ─────────────────────────────────────────────────────────────────
const DIV = {
  chittagong: new mongoose.Types.ObjectId("000000000000000000000001"),
  sylhet:     new mongoose.Types.ObjectId("000000000000000000000002"),
};

// ─────────────────────────────────────────────────────────────────
// Deterministic dummy district ObjectId from name
// ─────────────────────────────────────────────────────────────────
function districtOid(name: string): mongoose.Types.ObjectId {
  const hex = Buffer.from(name.toLowerCase())
    .toString("hex")
    .slice(0, 24)
    .padEnd(24, "0");
  return new mongoose.Types.ObjectId(hex);
}

// ─────────────────────────────────────────────────────────────────
// 30 guide templates — covers all major tour areas in your app
// ─────────────────────────────────────────────────────────────────
const TEMPLATES = [
  // ── Chattogram (5) ──────────────────────────────────────────
  {
    division: DIV.chittagong, district: "Chattogram",
    areas: ["Patenga", "Agrabad", "Karnaphuli River"],
    languages: ["Bengali", "English", "Chittagonian"],
    specializations: ["city-tour", "heritage"],
    experienceYears: 6, gender: "male" as const, photoIndex: 10,
    bio: "Born and raised in Chattogram, I've spent six years showing visitors the hidden gems of the port city — from the colonial-era Circuit House to Foy's Lake at golden hour.",
  },
  {
    division: DIV.chittagong, district: "Chattogram",
    areas: ["Pahartali", "Bayezid Bostami", "Halishahar"],
    languages: ["Bengali", "English"],
    specializations: ["heritage", "religious"],
    experienceYears: 4, gender: "female" as const, photoIndex: 11,
    bio: "A history graduate with a passion for Chattogram's Mughal and colonial past. I specialise in heritage trails and religious sites including the Bayezid Bostami shrine.",
  },
  {
    division: DIV.chittagong, district: "Chattogram",
    areas: ["Sitakunda", "Mirsharai", "Bhatiari"],
    languages: ["Bengali", "English", "Hindi"],
    specializations: ["eco-tourism", "adventure", "hill-trekking"],
    experienceYears: 8, gender: "male" as const, photoIndex: 12,
    bio: "Eight years guiding trekkers through Sitakunda Eco Park and Chandranath Hills. I know every trail, waterfall, and tea stall between the hills and the sea.",
  },
  {
    division: DIV.chittagong, district: "Chattogram",
    areas: ["Anwara", "Patiya", "Chandanaish"],
    languages: ["Bengali", "English"],
    specializations: ["food-tourism", "city-tour"],
    experienceYears: 3, gender: "female" as const, photoIndex: 13,
    bio: "Chattogram's food scene is my obsession — from mezban beef to shutki macher curry. I run culinary walking tours that locals and tourists both rave about.",
  },
  {
    division: DIV.chittagong, district: "Chattogram",
    areas: ["Rangunia", "Fatikchhari", "Kaptai Road"],
    languages: ["Bengali", "English", "Chittagonian"],
    specializations: ["eco-tourism", "wildlife"],
    experienceYears: 5, gender: "male" as const, photoIndex: 14,
    bio: "I guide birdwatching and nature trails in the forested areas of Rangunia and Fatikchhari — home to rare birds at the fringe of the Chittagong Hill Tracts.",
  },

  // ── Cox's Bazar (5) ─────────────────────────────────────────
  {
    division: DIV.chittagong, district: "Cox's Bazar",
    areas: ["Cox's Bazar Town", "Inani Beach", "Laboni Beach"],
    languages: ["Bengali", "English", "Arakanese"],
    specializations: ["beach", "eco-tourism"],
    experienceYears: 10, gender: "male" as const, photoIndex: 20,
    bio: "Ten years on the world's longest natural sea beach. I know every sunrise point, fishing village, and secluded cove that most tourists never discover.",
  },
  {
    division: DIV.chittagong, district: "Cox's Bazar",
    areas: ["Himchari", "Moheshkhali Island", "Reju Lake"],
    languages: ["Bengali", "English"],
    specializations: ["beach", "religious", "eco-tourism"],
    experienceYears: 5, gender: "female" as const, photoIndex: 21,
    bio: "Specialising in Cox's Bazar's islands — Moheshkhali's Adinath temple, Sonadia's mangroves, and the quieter stretches of Himchari beach at dawn.",
  },
  {
    division: DIV.chittagong, district: "Cox's Bazar",
    areas: ["Teknaf", "St. Martin's Island", "Shah Porir Dwip"],
    languages: ["Bengali", "English"],
    specializations: ["beach", "eco-tourism", "adventure"],
    experienceYears: 9, gender: "male" as const, photoIndex: 22,
    bio: "Boat tours to St. Martin's Island — snorkelling, coral reef walks, and overnight camp stays on Bangladesh's only coral island.",
  },
  {
    division: DIV.chittagong, district: "Cox's Bazar",
    areas: ["Ramu", "Ukhia", "Cox's Bazar"],
    languages: ["Bengali", "English"],
    specializations: ["heritage", "religious", "food-tourism"],
    experienceYears: 4, gender: "female" as const, photoIndex: 23,
    bio: "Ramu's Buddhist temples and Barua villages are rarely on tourist itineraries. I change that — pagodas, handicraft workshops, and authentic local cuisine.",
  },
  {
    division: DIV.chittagong, district: "Cox's Bazar",
    areas: ["Inani", "Pechardoba", "Nhilla"],
    languages: ["Bengali", "English", "Hindi"],
    specializations: ["adventure", "beach", "wildlife"],
    experienceYears: 7, gender: "male" as const, photoIndex: 24,
    bio: "Surfing, deep-sea fishing, and jungle treks — the adventurous side of Cox's Bazar that most packages ignore. Safety certified and first-aid trained.",
  },

  // ── Bandarban (5) ───────────────────────────────────────────
  {
    division: DIV.chittagong, district: "Bandarban",
    areas: ["Nilgiri", "Boga Lake", "Keokradong"],
    languages: ["Bengali", "English", "Tripuri", "Marma"],
    specializations: ["hill-trekking", "adventure", "eco-tourism"],
    experienceYears: 11, gender: "male" as const, photoIndex: 30,
    bio: "Summited Keokradong over 200 times. I offer treks from beginner level (Nilgiri) to expedition-grade. Safety and local community respect are my baseline.",
  },
  {
    division: DIV.chittagong, district: "Bandarban",
    areas: ["Bandarban Town", "Chimbuk", "Meghla"],
    languages: ["Bengali", "English", "Marma", "Burmese"],
    specializations: ["heritage", "eco-tourism", "hill-trekking"],
    experienceYears: 6, gender: "female" as const, photoIndex: 31,
    bio: "As a Marma community member, I share the culture, cuisine, and spirituality of the hill people. Village stays with Marma families — community-approved and run.",
  },
  {
    division: DIV.chittagong, district: "Bandarban",
    areas: ["Thanchi", "Remakri", "Nafakhum Waterfall"],
    languages: ["Bengali", "English"],
    specializations: ["adventure", "hill-trekking", "wildlife"],
    experienceYears: 9, gender: "male" as const, photoIndex: 32,
    bio: "Nafakhum waterfall specialist. 3–5 day expeditions covering river crossings, jungle camping, and Bangladesh's largest waterfall.",
  },
  {
    division: DIV.chittagong, district: "Bandarban",
    areas: ["Rowangchhari", "Lama", "Ali Kadam"],
    languages: ["Bengali", "English", "Chakma"],
    specializations: ["eco-tourism", "heritage", "wildlife"],
    experienceYears: 5, gender: "female" as const, photoIndex: 33,
    bio: "Sustainable tourism in Rowangchhari's forests. WWF-partnered eco-camps and birdwatching tours in the Lama reserve forest. All tours support local families directly.",
  },
  {
    division: DIV.chittagong, district: "Bandarban",
    areas: ["Boga Lake", "Ruma", "Saka Haphong"],
    languages: ["Bengali", "English"],
    specializations: ["hill-trekking", "adventure"],
    experienceYears: 12, gender: "male" as const, photoIndex: 34,
    bio: "12 years in the Bandarban hills. My speciality is multi-day treks to Saka Haphong — the route less taken to Bangladesh's highest peak.",
  },

  // ── Khagrachhari (3) ────────────────────────────────────────
  {
    division: DIV.chittagong, district: "Khagrachhari",
    areas: ["Khagrachhari Town", "Alutila Cave", "Matiranga"],
    languages: ["Bengali", "English", "Chakma", "Tripuri"],
    specializations: ["heritage", "adventure", "eco-tourism"],
    experienceYears: 7, gender: "male" as const, photoIndex: 40,
    bio: "Alutila cave is just the beginning. I take visitors beyond the tourist trail into Chakma villages, bamboo craft workshops, and the Chengi river valley.",
  },
  {
    division: DIV.chittagong, district: "Khagrachhari",
    areas: ["Dighinala", "Panchari", "Maischhara"],
    languages: ["Bengali", "English", "Tripuri"],
    specializations: ["eco-tourism", "wildlife", "heritage"],
    experienceYears: 4, gender: "female" as const, photoIndex: 41,
    bio: "Nature and culture guide focusing on Dighinala's forests and Tripuri weaving traditions. Tours directly support indigenous women artisans.",
  },
  {
    division: DIV.chittagong, district: "Khagrachhari",
    areas: ["Khagrachhari", "Ramgarh", "Guimara"],
    languages: ["Bengali", "English", "Hindi"],
    specializations: ["hill-trekking", "historical"],
    experienceYears: 6, gender: "male" as const, photoIndex: 42,
    bio: "Khagrachhari's history as a princely district is largely forgotten. I revive it through guided walks of the old Chakma Rajbari and British-era rest houses.",
  },

  // ── Rangamati + Sajek (5) ───────────────────────────────────
  {
    division: DIV.chittagong, district: "Rangamati",
    areas: ["Rangamati Town", "Kaptai Lake", "Shuvolong"],
    languages: ["Bengali", "English", "Chakma"],
    specializations: ["eco-tourism", "adventure", "heritage"],
    experienceYears: 8, gender: "male" as const, photoIndex: 50,
    bio: "Kaptai Lake is my second home. Boat tours through 54 islands — sunrise fishing with Chakma boatmen and the submerged ruins of Old Rangamati.",
  },
  {
    division: DIV.chittagong, district: "Rangamati",
    areas: ["Barkal", "Baghaichhari", "Bilaichhari"],
    languages: ["Bengali", "English", "Chakma", "Marma"],
    specializations: ["hill-trekking", "wildlife", "eco-tourism"],
    experienceYears: 10, gender: "male" as const, photoIndex: 51,
    bio: "Trekking through Barkal's dense forests to hidden waterfalls and Chakma hamlets rarely visited by outsiders. All tours are permit-compliant.",
  },
  {
    division: DIV.chittagong, district: "Rangamati",
    areas: ["Rangamati", "Kaptai", "Chandraghona"],
    languages: ["Bengali", "English"],
    specializations: ["heritage", "religious", "eco-tourism"],
    experienceYears: 5, gender: "female" as const, photoIndex: 52,
    bio: "One of very few female guides in Rangamati. Women-only and family-friendly tours of the lake district including the Shuvolong waterfall route.",
  },
  {
    division: DIV.chittagong, district: "Rangamati",
    areas: ["Sajek Valley", "Ruilui Para", "Konglak Para"],
    languages: ["Bengali", "English", "Lushai", "Marma"],
    specializations: ["hill-trekking", "eco-tourism", "heritage"],
    experienceYears: 7, gender: "male" as const, photoIndex: 53,
    bio: "Born in Ruilui Para, Sajek. I know every cloud-kissed ridge, sunrise spot, and Mizo family who opens their home to travellers.",
  },
  {
    division: DIV.chittagong, district: "Rangamati",
    areas: ["Sajek", "Baghaichhari"],
    languages: ["Bengali", "English", "Mizo"],
    specializations: ["heritage", "food-tourism", "eco-tourism"],
    experienceYears: 3, gender: "female" as const, photoIndex: 54,
    bio: "Introducing visitors to Lushai food traditions, weaving demonstrations, and the unique culture of Sajek's indigenous communities.",
  },

  // ── Sylhet (7) ──────────────────────────────────────────────
  {
    division: DIV.sylhet, district: "Sylhet",
    areas: ["Sylhet City", "Jaflong", "Ratargul Swamp Forest"],
    languages: ["Bengali", "English", "Sylheti"],
    specializations: ["eco-tourism", "heritage", "city-tour"],
    experienceYears: 6, gender: "male" as const, photoIndex: 60,
    bio: "From Ratargul swamp forest to crystal-blue Jaflong river stones, I cover Sylhet's extraordinary natural diversity with expert insight and good humour.",
  },
  {
    division: DIV.sylhet, district: "Sylhet",
    areas: ["Sreemangal", "Moulvibazar", "Lawachara National Park"],
    languages: ["Bengali", "English", "Sylheti", "Hindi"],
    specializations: ["eco-tourism", "wildlife", "food-tourism"],
    experienceYears: 5, gender: "female" as const, photoIndex: 61,
    bio: "Sreemangal's tea gardens and Lawachara rainforest are my territory. Certified birdwatching guide and tea-tasting instructor — a rare combo my guests love.",
  },
  {
    division: DIV.sylhet, district: "Sylhet",
    areas: ["Sunamganj", "Tanguar Haor", "Hakaluki Haor"],
    languages: ["Bengali", "English", "Sylheti"],
    specializations: ["adventure", "eco-tourism", "wildlife"],
    experienceYears: 8, gender: "male" as const, photoIndex: 62,
    bio: "Boat expeditions through Tanguar Haor and Hakaluki Haor — Bangladesh's largest wetlands. Migration season tours (November–March) are my flagship experience.",
  },
  {
    division: DIV.sylhet, district: "Sylhet",
    areas: ["Sylhet City", "Shah Jalal Shrine", "Keane Bridge"],
    languages: ["Bengali", "English"],
    specializations: ["religious", "heritage", "city-tour"],
    experienceYears: 4, gender: "female" as const, photoIndex: 63,
    bio: "Muslim heritage specialist guiding visitors through the Dargah of Hazrat Shah Jalal and Sylhet's rich Sufi tradition.",
  },
  {
    division: DIV.sylhet, district: "Sylhet",
    areas: ["Srimangal", "Lawachara", "Kalapur"],
    languages: ["Bengali", "English", "Hindi"],
    specializations: ["eco-tourism", "wildlife", "adventure"],
    experienceYears: 7, gender: "male" as const, photoIndex: 64,
    bio: "Lawachara National Park is home to the endangered hoolock gibbon. Seven years tracking and photographing them — ethical wildlife tours that leave no trace.",
  },
  {
    division: DIV.sylhet, district: "Sylhet",
    areas: ["Sylhet", "Jaflong", "Bisanakandi"],
    languages: ["Bengali", "English"],
    specializations: ["adventure", "eco-tourism", "food-tourism"],
    experienceYears: 3, gender: "female" as const, photoIndex: 65,
    bio: "Young and obsessed with Sylhet's hidden gems — from the zero-point border at Jaflong to Bisanakandi's turquoise waters. Every trip feels like a discovery.",
  },
  {
    division: DIV.sylhet, district: "Sylhet",
    areas: ["Sylhet", "Habiganj", "Chunarughat"],
    languages: ["Bengali", "English", "Sylheti", "Hindi"],
    specializations: ["heritage", "historical", "city-tour"],
    experienceYears: 9, gender: "male" as const, photoIndex: 66,
    bio: "Heritage researcher turned guide. Zamindari estates, colonial bungalows, and the tea-estate history of greater Sylhet — a past that shaped the British Empire's tea trade.",
  },
] as const;

// ─────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function randomNid(): string {
  return String(Math.floor(Math.random() * 9_000_000_000) + 1_000_000_000);
}

function pastDate(maxDays: number): Date {
  return new Date(Date.now() - Math.random() * maxDays * 86_400_000);
}

function portrait(gender: "male" | "female", index: number): string {
  return `https://randomuser.me/api/portraits/${gender === "female" ? "women" : "men"}/${index % 100}.jpg`;
}

// ─────────────────────────────────────────────────────────────────
// Main seeder
// ─────────────────────────────────────────────────────────────────
export async function seedGuideApplications(): Promise<void> {
  // 1. Pull real USER accounts — super_admin is role "SUPER_ADMIN" so excluded automatically
  const allUsers = await User.find(
    { role: "USER", isDeleted: false, isActive: "ACTIVE" },
    { _id: 1, name: 1, email: 1, phone: 1, picture: 1, address: 1 },
  ).lean();

  if (allUsers.length === 0) {
    throw new Error("No USER-role accounts found in DB.");
  }

  const selected = shuffle(allUsers).slice(0, 30);
  console.log(`\n→ Found ${allUsers.length} users.  Seeding ${selected.length} guide applications.\n`);

  // 2. Wipe any previous seed applications for these users (idempotent re-runs)
  const selectedIds = selected.map((u) => u._id);
  const { deletedCount } = await GuideApplication.deleteMany({ user: { $in: selectedIds } });
  if (deletedCount > 0) console.log(`  Cleared ${deletedCount} existing application(s) for clean re-seed.\n`);

  // 3. Build documents
  const docs = selected.map((user, i) => {
    const tpl       = TEMPLATES[i % TEMPLATES.length];
    const photoUrl  = (user.picture as string) || portrait(tpl.gender, tpl.photoIndex);
    const submittedAt = pastDate(45); // applied within the last 45 days

    return {
      user:            user._id,

      // ── Personal ──────────────────────────────────────────────
      profilePhoto:         photoUrl,
      profilePhotoPublicId: `seed/profiles/${tpl.photoIndex}`,
      dateOfBirth: new Date(
        1982 + Math.floor(Math.random() * 18),  // born 1982–2000
        Math.floor(Math.random() * 12),
        Math.floor(Math.random() * 27) + 1,
      ),
      gender:          tpl.gender,
      phone:           (user.phone as string | undefined) || `017${String(tpl.photoIndex).padStart(8, "0")}`,
      presentAddress:  (user.address as string | undefined) || `${tpl.areas[0]}, ${tpl.district}`,
      permanentAddress: (user.address as string | undefined) || `${tpl.areas[0]}, ${tpl.district}`,

      // ── NID (dummy images via picsum) ─────────────────────────
      nidNumber:        randomNid(),
      nidFrontPhoto:    `https://picsum.photos/seed/nf${tpl.photoIndex}/600/380`,
      nidBackPhoto:     `https://picsum.photos/seed/nb${tpl.photoIndex}/600/380`,
      nidFrontPublicId: `seed/nid/front/${tpl.photoIndex}`,
      nidBackPublicId:  `seed/nid/back/${tpl.photoIndex}`,
      nidVerified:      false,

      // ── Location ──────────────────────────────────────────────
      division:       tpl.division,
      district:       districtOid(tpl.district),
      operatingAreas: tpl.areas,

      // ── Guide details ─────────────────────────────────────────
      languages:       tpl.languages,
      experienceYears: tpl.experienceYears,
      specializations: tpl.specializations,
      bio:             tpl.bio,

      // ── Status — PENDING, waiting for admin review ─────────────
      status:            GuideApplicationStatus.PENDING,
      submittedAt,
      resubmissionCount: 0,

      // Only one history entry: the initial submission
      statusHistory: [
        {
          status:    GuideApplicationStatus.PENDING,
          reason:    null,
          changedBy: user._id,   // ← the user submitted it themselves
          changedAt: submittedAt,
        },
      ],
    };
  });

  // 4. Bulk insert
  await GuideApplication.insertMany(docs, { ordered: false });

  // 5. Summary
  console.log("  #   Name                      District         Specializations");
  console.log("  " + "─".repeat(72));
  selected.forEach((u, i) => {
    const tpl  = TEMPLATES[i % TEMPLATES.length];
    const name = ((u.name as string) || "Unknown").padEnd(26);
    const dist = tpl.district.padEnd(16);
    const spec = tpl.specializations.slice(0, 2).join(", ");
    console.log(`  ${String(i + 1).padStart(2, "0")}  ${name}  ${dist}  ${spec}`);
  });

  console.log(`\n✓ ${selected.length} GuideApplications created with status PENDING.`);
  console.log("  Admin can now review and approve them via the dashboard.");
  console.log("  GuideProfile will be auto-created by the post-save hook on approval.\n");
}