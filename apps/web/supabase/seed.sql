-- Seed data for insurance companies, profiles, and cases (projects)
-- Generated as if using @faker-js/faker

-- Insert companies (insurance companies)
INSERT INTO companies (name, url, description) VALUES
  ('Apex Assurance', 'https://apexassure.com', 'Leading provider of life and property insurance.'),
  ('BlueSky Insurance', 'https://blueskyinsure.com', 'Comprehensive coverage for individuals and businesses.'),
  ('Guardian Mutual', 'https://guardianmutual.com', 'Trusted insurance for families and enterprises.');

-- Insert profiles (people)
INSERT INTO profiles (first_name, last_name, is_public, avatar) VALUES
  ('Olivia', 'Miller', true, 'https://randomuser.me/api/portraits/women/1.jpg'),
  ('Liam', 'Smith', false, 'https://randomuser.me/api/portraits/men/2.jpg'),
  ('Emma', 'Johnson', true, 'https://randomuser.me/api/portraits/women/3.jpg'),
  ('Noah', 'Williams', true, 'https://randomuser.me/api/portraits/men/4.jpg'),
  ('Ava', 'Brown', false, 'https://randomuser.me/api/portraits/women/5.jpg');

-- Insert projects (cases) for insurance companies
-- Assume company IDs are 1, 2, 3 (from above)
INSERT INTO projects (company_id, name) VALUES
  (1, 'Auto Accident Claim #A1023'),
  (1, 'Home Fire Claim #H2045'),
  (2, 'Travel Insurance Claim #T3098'),
  (3, 'Health Insurance Claim #H5678'),
  (2, 'Flood Damage Claim #F1122');

-- Link profiles to companies (profile_companies)
-- Assume profile IDs are 1-5, company IDs 1-3
INSERT INTO profile_companies (profile_id, company_id) VALUES
  (1, 1),
  (2, 2),
  (3, 1),
  (4, 3),
  (5, 2);

-- Link profiles to projects (project_profiles)
-- Assume project IDs are 1-5, profile IDs 1-5
INSERT INTO project_profiles (project_id, profile_id) VALUES
  (1, 1),
  (2, 3),
  (3, 2),
  (4, 4),
  (5, 5);

-- Insert roles
INSERT INTO roles (name, description) VALUES
  ('admin', 'Administrator with full access'),
  ('editor', 'Can edit and manage cases'),
  ('viewer', 'Can view cases only');

-- Link profiles to roles (profile_roles)
-- Assume role IDs: 1=admin, 2=editor, 3=viewer
-- Assign roles to profiles
INSERT INTO profile_roles (profile_id, role_id) VALUES
  (1, 1), -- Olivia Miller: admin
  (2, 2), -- Liam Smith: editor
  (3, 3), -- Emma Johnson: viewer
  (4, 2), -- Noah Williams: editor
  (5, 3); -- Ava Brown: viewer 