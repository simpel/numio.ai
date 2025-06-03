// Snaplet seed script for Supabase integration
//
// Usage:
//   # Directly seed your local database (recommended for dev):
//   npx tsx apps/web/supabase/seed.ts
//
//   # Output SQL for Supabase CLI (for supabase db reset):
//   DRY_RUN=1 npx tsx apps/web/supabase/seed.ts > apps/web/supabase/seed.sql
//   # or
//   npx tsx apps/web/supabase/seed.ts --dry-run > apps/web/supabase/seed.sql
//
//   # Then run:
//   npx supabase db reset

import "dotenv/config";
import { createSeedClient } from "@snaplet/seed";
import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";

import { fileURLToPath } from "url";

// Load AI-generated data examples
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataExamplesPath = path.join(__dirname, "../.snaplet/dataExamples.json");
const dataExamples = JSON.parse(fs.readFileSync(dataExamplesPath, "utf-8"));

function getExamples(input: string): string[] {
  const found = dataExamples.find((ex: any) => ex.input === input);
  return found ? found.examples : [];
}

const companyNames = getExamples("public companies name");
const companyUrls = getExamples("public companies url");
const companyDescriptions = getExamples("public companies description");
const orgNames = getExamples("public organisations name");
const firstNames = getExamples("public profiles first_name");
const lastNames = getExamples("public profiles last_name");
const emails = getExamples("public profiles email");
const projectNames = getExamples("public projects name");

// Detect dry run mode
const isDryRun =
  process.env.DRY_RUN === "1" || process.argv.includes("--dry-run");

console.log(
  "process.env.SUPABASE_SERVICE_ROLE_KEY",
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
console.log(
  "process.env.NEXT_PUBLIC_SUPABASE_URL",
  process.env.NEXT_PUBLIC_SUPABASE_URL
);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const usersToCreate = [
  { email: "admin@numio.com", password: "admin", role: "admin" },
  { email: "editor@numio.com", password: "admin", role: "editor" },
  { email: "viewer@numio.com", password: "admin", role: "viewer" },
];

(async () => {
  /

  // Seed roles
  await seed.roles([
    { name: "admin", description: "Role 1" },
    { name: "editor", description: "Role 2" },
    { name: "viewer", description: "Role 3" },
  ]);

  // Seed organisations, each with 2 companies (company_organisations)
  await seed.organisations((x) =>
    x(3, ({ index }) => ({
      name: orgNames[index % orgNames.length],
      company_organisations: (y) => y(2, () => ({})), // 2 companies per org
    }))
  );

  // Seed companies, each with 2 profiles (profile_companies)
  await seed.companies((x) =>
    x(5, ({ index }) => ({
      name: companyNames[index % companyNames.length],
      url: companyUrls[index % companyUrls.length],
      description: companyDescriptions[index % companyDescriptions.length],
      profile_companies: (y) => y(2, () => ({})), // 2 profiles per company
    }))
  );

  // Seed projects, each with 2 profiles (project_profiles)
  await seed.projects((x) =>
    x(5, ({ index }) => ({
      name: projectNames[index % projectNames.length],
      project_profiles: (y) => y(2, () => ({})), // 2 profiles per project
    }))
  );



  / 1. Create Auth users
  const createdUsers = [];
  for (const user of usersToCreate) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: user.email,
      password: user.password,
      email_confirm: true,
    });

    console.log({ data, error });

    if (error) throw error;
    createdUsers.push({ ...data.user, profileRole: user.role });
  }

  // 2. Use Snaplet to seed business data, linking to Auth user IDs
  const seed = await createSeedClient(isDryRun ? { dryRun: true } : {});
  await seed.$resetDatabase();

  // Example: create profiles for each user
  await seed.profiles(
    createdUsers.map((user) => {
      return {
        first_name: user.profileRole,
        last_name: "User",
        email: user.email,
        user_id: user.id, // Link to Auth user

        onboarded: true,
        is_public: true,
      };
    })
  );


  process.exit(0);
})();
