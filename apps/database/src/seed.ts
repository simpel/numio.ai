import { faker } from '@faker-js/faker';
import { db, Role } from './index.js';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

async function main() {
	console.log('🧹 Cleaning database...');

	// Delete all data in reverse order of dependencies
	await db.event.deleteMany();
	await db.membership.deleteMany();
	await db.case.deleteMany();
	await db.client.deleteMany();
	await db.team.deleteMany();
	await db.invite.deleteMany();
	await db.organisation.deleteMany();
	await db.userProfile.deleteMany();
	await db.user.deleteMany();
	await db.account.deleteMany();
	await db.session.deleteMany();
	await db.verificationToken.deleteMany();

	console.log('✅ Database cleaned');
	console.log('🌱 Starting seed...');

	// Create admin user
	const hashedPassword = await bcrypt.hash('sdfasfaefaegasdgfewER', 10);

	const adminUser = await db.user.create({
		data: {
			name: 'Admin User',
			email: 'admin@numio.com',
			password: hashedPassword,
			emailVerified: new Date(),
		},
	});

	console.log('✅ Created admin user and profile');

	// Helper function to create date spread across the last 30 days
	const createSpreadDate = (daysAgo: number) => {
		const now = new Date();
		const targetDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
		// Add some randomness within the day (0-23 hours)
		const randomHours = faker.number.int({ min: 0, max: 23 });
		const randomMinutes = faker.number.int({ min: 0, max: 59 });
		targetDate.setHours(randomHours, randomMinutes, 0, 0);
		return targetDate;
	};

	// Helper function to create date spread across the last 6 months (180 days)
	const createSpreadDate6Months = (daysAgo: number) => {
		const now = new Date();
		const targetDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
		// Add some randomness within the day (0-23 hours)
		const randomHours = faker.number.int({ min: 0, max: 23 });
		const randomMinutes = faker.number.int({ min: 0, max: 59 });
		targetDate.setHours(randomHours, randomMinutes, 0, 0);
		return targetDate;
	};

	// Create admin user profile
	const adminProfile = await db.userProfile.create({
		data: {
			userId: adminUser.id,
			firstName: 'Admin',
			lastName: 'User',
			email: 'admin@numio.com',
			role: Role.superadmin,
			hasDoneIntro: true,
			jobTitle: 'System Administrator',
			bio: 'System administrator with full access to all organizations and teams.',
			createdAt: createSpreadDate(30), // Admin created 30 days ago
		},
	});

	// Create organizations with specific pattern for chart trends
	// More organizations in first 7 days (negative 7-day trend), fewer in last 7 days
	// But overall positive 30-day trend
	const organizations = [];

	// Create 6 organizations in the first 7 days (days 0-6)
	for (let i = 1; i <= 6; i++) {
		const daysAgo = faker.number.int({ min: 0, max: 6 }); // First 7 days
		const createdAt = createSpreadDate(daysAgo);

		const org = await db.organisation.create({
			data: {
				name: faker.company.name(),
				createdAt: createdAt,
			},
		});
		organizations.push(org);
		console.log(`✅ Created organization (early): ${org.name}`);
	}

	// Create 2 organizations in the middle period (days 7-22)
	for (let i = 1; i <= 2; i++) {
		const daysAgo = faker.number.int({ min: 7, max: 22 }); // Middle period
		const createdAt = createSpreadDate(daysAgo);

		const org = await db.organisation.create({
			data: {
				name: faker.company.name(),
				createdAt: createdAt,
			},
		});
		organizations.push(org);
		console.log(`✅ Created organization (middle): ${org.name}`);
	}

	// Create 2 organizations in the last 7 days (days 23-29)
	for (let i = 1; i <= 2; i++) {
		const daysAgo = faker.number.int({ min: 23, max: 29 }); // Last 7 days
		const createdAt = createSpreadDate(daysAgo);

		const org = await db.organisation.create({
			data: {
				name: faker.company.name(),
				createdAt: createdAt,
			},
		});
		organizations.push(org);
		console.log(`✅ Created organization (recent): ${org.name}`);
	}

	// Create 150 users with profiles
	const users = [];
	const userProfiles = [];

	console.log('👥 Creating 150 users...');

	for (let i = 1; i <= 150; i++) {
		const firstName = faker.person.firstName();
		const lastName = faker.person.lastName();
		const email = faker.internet.email({ firstName, lastName });

		const user = await db.user.create({
			data: {
				name: `${firstName} ${lastName}`,
				email: email,
				password: await bcrypt.hash('password123', 10),
				emailVerified: new Date(),
			},
		});

		const daysAgo = faker.number.int({ min: 0, max: 29 }); // Spread across 30 days
		const createdAt = createSpreadDate(daysAgo);

		const userProfile = await db.userProfile.create({
			data: {
				userId: user.id,
				firstName: firstName,
				lastName: lastName,
				email: email,
				role: faker.helpers.arrayElement([
					Role.authenticated,
					Role.member,
					Role.assignee,
				]),
				hasDoneIntro: faker.datatype.boolean(),
				jobTitle: faker.person.jobTitle(),
				bio: faker.lorem.sentence(),
				createdAt: createdAt,
			},
		});

		users.push(user);
		userProfiles.push(userProfile);

		if (i % 25 === 0) {
			console.log(`✅ Created ${i} users...`);
		}
	}

	console.log('✅ Created all 150 users and profiles');

	// Create teams with a clear negative trend over 6 months
	// More teams in early months, fewer in recent months
	const teams = [];

	// Create teams with a clear negative trend pattern
	// Month 1-2 (days 150-120): 40% of teams - High activity early
	// Month 3-4 (days 119-60): 35% of teams - Moderate activity
	// Month 5-6 (days 59-0): 25% of teams - Low activity recently

	// Calculate total teams needed for a clear negative trend
	const totalTeamsNeeded = organizations.length * 5; // Average 5 teams per org
	const earlyTeams = Math.floor(totalTeamsNeeded * 0.4); // 40% in first 2 months
	const middleTeams = Math.floor(totalTeamsNeeded * 0.35); // 35% in middle 2 months
	const recentTeams = totalTeamsNeeded - earlyTeams - middleTeams; // 25% in last 2 months

	console.log(`📊 Team creation plan for negative 6-month trend:`);
	console.log(`   - Early teams (months 1-2): ${earlyTeams}`);
	console.log(`   - Middle teams (months 3-4): ${middleTeams}`);
	console.log(`   - Recent teams (months 5-6): ${recentTeams}`);
	console.log(`   - Total teams: ${totalTeamsNeeded}`);

	// Create early teams (days 150-120)
	for (let i = 0; i < earlyTeams; i++) {
		const daysAgo = faker.number.int({ min: 120, max: 150 }); // Months 1-2
		const createdAt = createSpreadDate6Months(daysAgo);
		const randomOrg = faker.helpers.arrayElement(organizations);

		const team = await db.team.create({
			data: {
				name: faker.company.name() + ' Team',
				description: faker.lorem.sentence(),
				organisationId: randomOrg.id,
				state: faker.helpers.arrayElement(['active', 'inactive']),
				createdAt: createdAt,
			},
		});
		teams.push(team);
	}

	// Create middle teams (days 119-60)
	for (let i = 0; i < middleTeams; i++) {
		const daysAgo = faker.number.int({ min: 60, max: 119 }); // Months 3-4
		const createdAt = createSpreadDate6Months(daysAgo);
		const randomOrg = faker.helpers.arrayElement(organizations);

		const team = await db.team.create({
			data: {
				name: faker.company.name() + ' Team',
				description: faker.lorem.sentence(),
				organisationId: randomOrg.id,
				state: faker.helpers.arrayElement(['active', 'inactive']),
				createdAt: createdAt,
			},
		});
		teams.push(team);
	}

	// Create recent teams (days 59-0)
	for (let i = 0; i < recentTeams; i++) {
		const daysAgo = faker.number.int({ min: 0, max: 59 }); // Months 5-6
		const createdAt = createSpreadDate6Months(daysAgo);
		const randomOrg = faker.helpers.arrayElement(organizations);

		const team = await db.team.create({
			data: {
				name: faker.company.name() + ' Team',
				description: faker.lorem.sentence(),
				organisationId: randomOrg.id,
				state: faker.helpers.arrayElement(['active', 'inactive']),
				createdAt: createdAt,
			},
		});
		teams.push(team);
	}

	console.log(
		`✅ Created ${teams.length} total teams with negative 6-month trend`
	);

	// Create owner memberships for organizations
	console.log('👑 Creating owner memberships for organizations...');
	for (const org of organizations) {
		// Assign admin as owner of all organizations
		await db.membership.create({
			data: {
				userProfileId: adminProfile.id,
				organisationId: org.id,
				role: Role.owner,
			},
		});
	}
	console.log(
		`✅ Created owner memberships for ${organizations.length} organizations`
	);

	// Create owner memberships for teams
	console.log('👑 Creating owner memberships for teams...');
	for (const team of teams) {
		// Assign admin as owner of all teams
		await db.membership.create({
			data: {
				userProfileId: adminProfile.id,
				teamContextId: team.id,
				role: Role.owner,
			},
		});
	}
	console.log(`✅ Created owner memberships for ${teams.length} teams`);

	// Create organization memberships for users
	console.log('🏢 Creating organization memberships...');

	// Include admin user in membership creation
	const allUserProfiles = [adminProfile, ...userProfiles];

	for (let i = 0; i < allUserProfiles.length; i++) {
		const userProfile = allUserProfiles[i];
		if (!userProfile) continue;

		// Each user belongs to 1-3 organizations
		const orgCount = faker.number.int({ min: 1, max: 3 });
		const selectedOrgs = faker.helpers.arrayElements(organizations, orgCount);

		for (const org of selectedOrgs) {
			const role = faker.helpers.arrayElement([
				Role.owner,
				Role.member,
				Role.assignee,
			]);

			await db.membership.create({
				data: {
					userProfileId: userProfile.id,
					organisationId: org.id,
					role: role,
				},
			});
		}

		if ((i + 1) % 25 === 0) {
			console.log(`✅ Created memberships for ${i + 1} users...`);
		}
	}

	console.log('✅ Created organization memberships');

	// Create team memberships for users
	console.log('👥 Creating team memberships...');

	for (let i = 0; i < allUserProfiles.length; i++) {
		const userProfile = allUserProfiles[i];
		if (!userProfile) continue;

		// Each user belongs to 1-4 teams
		const teamCount = faker.number.int({ min: 1, max: 4 });
		const selectedTeams = faker.helpers.arrayElements(teams, teamCount);

		for (const team of selectedTeams) {
			const role = faker.helpers.arrayElement([
				Role.owner,
				Role.member,
				Role.assignee,
			]);

			await db.membership.create({
				data: {
					userProfileId: userProfile.id,
					teamContextId: team.id,
					role: role,
				},
			});
		}

		if ((i + 1) % 25 === 0) {
			console.log(`✅ Created team memberships for ${i + 1} users...`);
		}
	}

	console.log('✅ Created team memberships');

	// Create clients
	const clients = [];

	for (let i = 0; i < 25; i++) {
		const client = await db.client.create({
			data: {
				name: faker.company.name(),
				orgNumber: faker.string.alphanumeric(10).toUpperCase(),
				description: faker.lorem.sentence(),
			},
		});
		clients.push(client);
	}

	console.log('✅ Created 25 clients');

	// Create client memberships
	for (const client of clients) {
		// Each client belongs to 1-3 organizations
		const orgCount = faker.number.int({ min: 1, max: 3 });
		const selectedOrgs = faker.helpers.arrayElements(organizations, orgCount);

		for (const _org of selectedOrgs) {
			await db.membership.create({
				data: {
					teamId: faker.helpers.arrayElement(teams).id,
					clientId: client.id,
					role: Role.member,
				},
			});
		}
	}

	console.log('✅ Created client memberships');

	// Create cases for each team
	const cases = [];

	for (const team of teams) {
		const caseCount = faker.number.int({ min: 2, max: 8 });

		for (let i = 0; i < caseCount; i++) {
			const caseItem = await db.case.create({
				data: {
					title: faker.lorem.sentence(),
					description: faker.lorem.paragraph(),
					teamId: team.id,
					clientId: faker.helpers.arrayElement(clients).id,
					state: faker.helpers.arrayElement([
						'created',
						'active',
						'on_hold',
						'completed',
						'closed',
					]),
				},
			});
			cases.push(caseItem);
		}
	}

	console.log(`✅ Created ${cases.length} cases`);

	// Create case memberships
	for (const caseItem of cases) {
		// Add team membership for the case
		await db.membership.create({
			data: {
				teamId: caseItem.teamId,
				caseId: caseItem.id,
				role: Role.assignee,
			},
		});

		// Add admin user membership to the case
		await db.membership.create({
			data: {
				userProfileId: adminProfile.id,
				caseId: caseItem.id,
				role: Role.owner,
			},
		});
	}

	console.log('✅ Created case memberships');

	// Create events for cases
	for (const caseItem of cases) {
		const eventCount = faker.number.int({ min: 1, max: 5 });

		for (let i = 0; i < eventCount; i++) {
			await db.event.create({
				data: {
					caseId: caseItem.id,
					actorId: faker.helpers.arrayElement(userProfiles).id,
					type: faker.helpers.arrayElement([
						'created',
						'updated',
						'assigned',
						'completed',
						'reviewed',
						'commented',
					]),
					metadata: {
						description: faker.lorem.sentence(),
					},
				},
			});
		}
	}

	console.log('✅ Created events');

	// Create invites with different statuses and 72-hour expiration
	console.log('📧 Creating invites with different statuses...');

	// Helper function to generate random token
	const generateToken = () => uuidv4();

	// Helper function to create date 72 hours from now
	const createExpiryDate = () => {
		const now = new Date();
		return new Date(now.getTime() + 72 * 60 * 60 * 1000); // 72 hours
	};

	// Helper function to create expired date (more than 72 hours ago)
	const createExpiredDate = () => {
		const now = new Date();
		return new Date(
			now.getTime() -
				72 * 60 * 60 * 1000 -
				faker.number.int({ min: 1, max: 168 }) * 60 * 60 * 1000
		); // 72+ hours ago
	};

	// Helper function to create recent date (less than 72 hours ago)
	const _createRecentDate = () => {
		const now = new Date();
		return new Date(
			now.getTime() - faker.number.int({ min: 1, max: 71 }) * 60 * 60 * 1000
		); // 1-71 hours ago
	};

	// Create specific test users with multiple invites
	console.log('👤 Creating test users with multiple invites...');

	// Test User 1: Multiple pending invites to different organizations
	const testUser1 = await db.user.create({
		data: {
			name: 'John InviteTest',
			email: 'john.invitetest@example.com',
			password: await bcrypt.hash('password123', 10),
			emailVerified: new Date(),
		},
	});

	const testUser1Profile = await db.userProfile.create({
		data: {
			userId: testUser1.id,
			firstName: 'John',
			lastName: 'InviteTest',
			email: 'john.invitetest@example.com',
			role: Role.authenticated,
			hasDoneIntro: true,
			jobTitle: 'Test User',
			bio: 'User with multiple pending invites for testing',
		},
	});

	// Test User 2: Mix of pending and expired invites
	const testUser2 = await db.user.create({
		data: {
			name: 'Sarah MultiInvite',
			email: 'sarah.multiinvite@example.com',
			password: await bcrypt.hash('password123', 10),
			emailVerified: new Date(),
		},
	});

	const testUser2Profile = await db.userProfile.create({
		data: {
			userId: testUser2.id,
			firstName: 'Sarah',
			lastName: 'MultiInvite',
			email: 'sarah.multiinvite@example.com',
			role: Role.authenticated,
			hasDoneIntro: true,
			jobTitle: 'Test User',
			bio: 'User with mix of pending and expired invites',
		},
	});

	// Test User 3: Only expired invites (needs re-invite)
	const testUser3 = await db.user.create({
		data: {
			name: 'Mike ExpiredOnly',
			email: 'mike.expiredonly@example.com',
			password: await bcrypt.hash('password123', 10),
			emailVerified: new Date(),
		},
	});

	const testUser3Profile = await db.userProfile.create({
		data: {
			userId: testUser3.id,
			firstName: 'Mike',
			lastName: 'ExpiredOnly',
			email: 'mike.expiredonly@example.com',
			role: Role.authenticated,
			hasDoneIntro: true,
			jobTitle: 'Test User',
			bio: 'User with only expired invites',
		},
	});

	// Test User 4: No profile yet, only invites (simulates invited but not accepted)
	const testUser4 = await db.user.create({
		data: {
			name: 'Lisa NoProfile',
			email: 'lisa.noprofile@example.com',
			password: await bcrypt.hash('password123', 10),
			emailVerified: new Date(),
		},
	});

	// No profile for testUser4 - they only have invites

	console.log('✅ Created test users');

	// Create multiple invites for test users
	console.log('📧 Creating multiple invites for test users...');

	// Test User 1: Multiple pending invites to different organizations
	for (let i = 0; i < 3; i++) {
		const org = organizations[i];
		if (!org || !testUser1Profile.email) continue;

		await db.invite.create({
			data: {
				email: testUser1Profile.email,
				organisationId: org.id,
				role: faker.helpers.arrayElement([
					Role.member,
					Role.assignee,
					Role.owner,
				]),
				token: generateToken(),
				expiresAt: createExpiryDate(),
				status: 'pending',
			},
		});
	}

	// Test User 1: Also invite to a team
	const randomTeam = faker.helpers.arrayElement(teams);
	if (randomTeam && testUser1Profile.email) {
		await db.invite.create({
			data: {
				email: testUser1Profile.email,
				teamId: randomTeam.id,
				role: faker.helpers.arrayElement([Role.member, Role.assignee]),
				token: generateToken(),
				expiresAt: createExpiryDate(),
				status: 'pending',
			},
		});
	}

	// Test User 2: Mix of pending and expired invites
	// pending invite to organization
	if (organizations[0] && testUser2Profile.email) {
		await db.invite.create({
			data: {
				email: testUser2Profile.email,
				organisationId: organizations[0].id,
				role: Role.owner,
				token: generateToken(),
				expiresAt: createExpiryDate(),
				status: 'pending',
			},
		});
	}

	// expired invite to organization
	if (organizations[1] && testUser2Profile.email) {
		await db.invite.create({
			data: {
				email: testUser2Profile.email,
				organisationId: organizations[1].id,
				role: Role.member,
				token: generateToken(),
				expiresAt: createExpiredDate(),
				status: 'expired',
			},
		});
	}

	// pending invite to team
	const teamForUser2 = faker.helpers.arrayElement(teams);
	if (teamForUser2 && testUser2Profile.email) {
		await db.invite.create({
			data: {
				email: testUser2Profile.email,
				teamId: teamForUser2.id,
				role: Role.assignee,
				token: generateToken(),
				expiresAt: createExpiryDate(),
				status: 'pending',
			},
		});
	}

	// Test User 3: Only expired invites
	for (let i = 2; i < 4; i++) {
		const org = organizations[i];
		if (!org || !testUser3Profile.email) continue;

		await db.invite.create({
			data: {
				email: testUser3Profile.email,
				organisationId: org.id,
				role: faker.helpers.arrayElement([Role.member, Role.assignee]),
				token: generateToken(),
				expiresAt: createExpiredDate(),
				status: 'expired',
			},
		});
	}

	// Test User 4: No profile, only pending invites
	for (let i = 4; i < 6; i++) {
		const org = organizations[i];
		if (!org || !testUser4.email) continue;

		await db.invite.create({
			data: {
				email: testUser4.email,
				organisationId: org.id,
				role: faker.helpers.arrayElement([
					Role.member,
					Role.assignee,
					Role.owner,
				]),
				token: generateToken(),
				expiresAt: createExpiryDate(),
				status: 'pending',
			},
		});
	}

	// Test User 4: Also expired invite
	if (organizations[6] && testUser4.email) {
		await db.invite.create({
			data: {
				email: testUser4.email,
				organisationId: organizations[6].id,
				role: Role.member,
				token: generateToken(),
				expiresAt: createExpiredDate(),
				status: 'expired',
			},
		});
	}

	console.log('✅ Created multiple invites for test users');

	// Create diverse invites for existing users (team and case invites)
	console.log('📧 Creating team and case invites for existing users...');

	// Create team invites for existing users with spread dates
	for (let i = 0; i < 15; i++) {
		const randomUserProfile = faker.helpers.arrayElement(userProfiles);
		const randomTeam = faker.helpers.arrayElement(teams);
		const daysAgo = faker.number.int({ min: 0, max: 29 }); // Spread across 30 days

		if (randomUserProfile?.email && randomTeam) {
			await db.invite.create({
				data: {
					email: randomUserProfile.email,
					teamId: randomTeam.id,
					role: faker.helpers.arrayElement([
						Role.member,
						Role.assignee,
						Role.owner,
					]),
					token: generateToken(),
					expiresAt: createExpiryDate(),
					status: 'pending',
					createdAt: createSpreadDate(daysAgo),
				},
			});
		}
	}

	// Create case invites for existing users (simulated as team invites with specific context)
	for (let i = 0; i < 12; i++) {
		const randomUserProfile = faker.helpers.arrayElement(userProfiles);
		const randomCase = faker.helpers.arrayElement(cases);
		const daysAgo = faker.number.int({ min: 0, max: 29 }); // Spread across 30 days

		if (randomUserProfile?.email && randomCase) {
			// For case invites, we'll use the team context since cases belong to teams
			await db.invite.create({
				data: {
					email: randomUserProfile.email,
					teamId: randomCase.teamId,
					role: Role.assignee, // Cases typically use assignee role
					token: generateToken(),
					expiresAt: createExpiryDate(),
					status: 'pending',
					createdAt: createSpreadDate(daysAgo),
				},
			});
		}
	}

	// Create invites for completely new users (no UserProfile yet)
	console.log('📧 Creating invites for new users...');

	// New user organization invites with more consistent distribution
	for (let i = 0; i < 20; i++) {
		const randomOrg = faker.helpers.arrayElement(organizations);
		// Distribute more evenly across the 30 days
		const daysAgo =
			Math.floor((i * 30) / 20) + faker.number.int({ min: 0, max: 1 }); // More consistent spread

		if (randomOrg) {
			await db.invite.create({
				data: {
					email: faker.internet.email(),
					organisationId: randomOrg.id,
					role: faker.helpers.arrayElement([
						Role.member,
						Role.assignee,
						Role.owner,
					]),
					token: generateToken(),
					expiresAt: createExpiryDate(),
					status: 'pending',
					createdAt: createSpreadDate(daysAgo),
				},
			});
		}
	}

	// New user team invites with more consistent distribution
	for (let i = 0; i < 15; i++) {
		const randomTeam = faker.helpers.arrayElement(teams);
		// Distribute more evenly across the 30 days
		const daysAgo =
			Math.floor((i * 30) / 15) + faker.number.int({ min: 0, max: 1 }); // More consistent spread

		if (randomTeam) {
			await db.invite.create({
				data: {
					email: faker.internet.email(),
					teamId: randomTeam.id,
					role: faker.helpers.arrayElement([Role.member, Role.assignee]),
					token: generateToken(),
					expiresAt: createExpiryDate(),
					status: 'pending',
					createdAt: createSpreadDate(daysAgo),
				},
			});
		}
	}

	// Create regular invites for other organizations with more consistent distribution
	for (const org of organizations) {
		// Create 4 pending invites with more consistent spread
		for (let i = 0; i < 4; i++) {
			// Distribute more evenly across the 30 days
			const daysAgo =
				Math.floor((i * 30) / 4) + faker.number.int({ min: 0, max: 2 }); // More consistent spread
			await db.invite.create({
				data: {
					email: faker.internet.email(),
					organisationId: org.id,
					role: faker.helpers.arrayElement([
						Role.member,
						Role.assignee,
						Role.owner,
					]),
					token: generateToken(),
					expiresAt: createExpiryDate(),
					status: 'pending',
					createdAt: createSpreadDate(daysAgo),
				},
			});
		}

		// Create 3 accepted invites with consistent spread
		for (let i = 0; i < 3; i++) {
			const randomUserProfile = faker.helpers.arrayElement(userProfiles);
			// Distribute more evenly across the 30 days
			const daysAgo =
				Math.floor((i * 30) / 3) + faker.number.int({ min: 0, max: 3 }); // More consistent spread
			const acceptedDaysAgo = faker.number.int({ min: 0, max: daysAgo }); // Accepted after creation

			if (randomUserProfile?.email) {
				await db.invite.create({
					data: {
						email: randomUserProfile.email,
						organisationId: org.id,
						role: faker.helpers.arrayElement([
							Role.member,
							Role.assignee,
							Role.owner,
						]),
						token: generateToken(),
						expiresAt: createExpiryDate(),
						status: 'accepted',
						createdAt: createSpreadDate(daysAgo),
						acceptedAt: createSpreadDate(acceptedDaysAgo),
						acceptedById: randomUserProfile.id,
					},
				});
			}
		}

		// Create 2 expired invites with consistent spread
		for (let i = 0; i < 2; i++) {
			// Distribute more evenly across the 30 days
			const daysAgo =
				Math.floor((i * 30) / 2) + faker.number.int({ min: 0, max: 2 }); // More consistent spread
			await db.invite.create({
				data: {
					email: faker.internet.email(),
					organisationId: org.id,
					role: faker.helpers.arrayElement([
						Role.member,
						Role.assignee,
						Role.owner,
					]),
					token: generateToken(),
					expiresAt: createExpiredDate(),
					status: 'expired',
					createdAt: createSpreadDate(daysAgo),
				},
			});
		}

		// Create 1 cancelled invite with spread dates
		const cancelledDaysAgo = faker.number.int({ min: 0, max: 29 }); // Spread across 30 days
		await db.invite.create({
			data: {
				email: faker.internet.email(),
				organisationId: org.id,
				role: faker.helpers.arrayElement([
					Role.member,
					Role.assignee,
					Role.owner,
				]),
				token: generateToken(),
				expiresAt: createExpiredDate(),
				status: 'cancelled',
				createdAt: createSpreadDate(cancelledDaysAgo),
			},
		});
	}

	// Create additional accepted invites with more consistent distribution
	console.log(
		'📧 Creating additional accepted invites for better chart data...'
	);

	for (let i = 0; i < 20; i++) {
		const randomUserProfile = faker.helpers.arrayElement(userProfiles);
		const randomOrg = faker.helpers.arrayElement(organizations);
		// Distribute more evenly across the 30 days
		const daysAgo =
			Math.floor((i * 30) / 20) + faker.number.int({ min: 0, max: 1 }); // More consistent spread
		const acceptedDaysAgo = faker.number.int({ min: 0, max: daysAgo }); // Accepted after creation

		if (randomUserProfile?.email && randomOrg) {
			await db.invite.create({
				data: {
					email: randomUserProfile.email,
					organisationId: randomOrg.id,
					role: faker.helpers.arrayElement([
						Role.member,
						Role.assignee,
						Role.owner,
					]),
					token: generateToken(),
					expiresAt: createExpiryDate(),
					status: 'accepted',
					createdAt: createSpreadDate(daysAgo),
					acceptedAt: createSpreadDate(acceptedDaysAgo),
					acceptedById: randomUserProfile.id,
				},
			});
		}
	}

	// Create additional cancelled invites for better chart data
	console.log(
		'📧 Creating additional cancelled invites for better chart data...'
	);

	for (let i = 0; i < 15; i++) {
		const randomOrg = faker.helpers.arrayElement(organizations);
		// Distribute more evenly across the 30 days
		const daysAgo =
			Math.floor((i * 30) / 15) + faker.number.int({ min: 0, max: 1 }); // More consistent spread

		if (randomOrg) {
			await db.invite.create({
				data: {
					email: faker.internet.email(),
					organisationId: randomOrg.id,
					role: faker.helpers.arrayElement([
						Role.member,
						Role.assignee,
						Role.owner,
					]),
					token: generateToken(),
					expiresAt: createExpiredDate(),
					status: 'cancelled',
					createdAt: createSpreadDate(daysAgo),
				},
			});
		}
	}

	console.log('✅ Created invites with different statuses');

	// Manually create metric events with correct timestamps for historical data
	console.log('📊 Creating historical metric events...');

	// Clear existing metric events first
	await db.metricEvent.deleteMany();

	// Create organization events with correct timestamps
	for (const org of organizations) {
		await db.metricEvent.create({
			data: {
				type: 'organization_created',
				entityId: org.id,
				timestamp: org.createdAt,
				metadata: {},
			},
		});
	}

	// Create team events with correct timestamps
	for (const team of teams) {
		await db.metricEvent.create({
			data: {
				type: 'team_created',
				entityId: team.id,
				timestamp: team.createdAt,
				metadata: {
					organisationId: team.organisationId,
				},
			},
		});
	}

	// Create user profile events with correct timestamps
	for (const userProfile of userProfiles) {
		await db.metricEvent.create({
			data: {
				type: 'user_profile_created',
				entityId: userProfile.id,
				timestamp: userProfile.createdAt,
				metadata: {},
			},
		});
	}

	// Create invite events with correct timestamps
	const allInvites = await db.invite.findMany();
	for (const invite of allInvites) {
		await db.metricEvent.create({
			data: {
				type: 'invite_created',
				entityId: invite.id,
				timestamp: invite.createdAt,
				metadata: {
					organisationId: invite.organisationId,
					teamId: invite.teamId,
				},
			},
		});

		// Create accepted events for accepted invites
		if (invite.status === 'accepted' && invite.acceptedAt) {
			await db.metricEvent.create({
				data: {
					type: 'invite_accepted',
					entityId: invite.id,
					timestamp: invite.acceptedAt,
					metadata: {
						organisationId: invite.organisationId,
						teamId: invite.teamId,
					},
				},
			});
		}

		// Create expired events for expired invites
		if (invite.status === 'expired') {
			await db.metricEvent.create({
				data: {
					type: 'invite_expired',
					entityId: invite.id,
					timestamp: invite.expiresAt,
					metadata: {
						organisationId: invite.organisationId,
						teamId: invite.teamId,
					},
				},
			});
		}

		// Create deleted events for cancelled invites
		if (invite.status === 'cancelled') {
			await db.metricEvent.create({
				data: {
					type: 'invite_deleted',
					entityId: invite.id,
					timestamp: invite.createdAt, // Use creation date as deletion date for seed data
					metadata: {
						organisationId: invite.organisationId,
						teamId: invite.teamId,
					},
				},
			});
		}
	}

	// Create case events with correct timestamps
	const allCases = await db.case.findMany();
	for (const caseItem of allCases) {
		await db.metricEvent.create({
			data: {
				type: 'case_created',
				entityId: caseItem.id,
				timestamp: caseItem.createdAt,
				metadata: {
					teamId: caseItem.teamId,
					clientId: caseItem.clientId,
				},
			},
		});
	}

	// Create deletion events for some entities to show realistic patterns
	console.log('🗑️ Creating deletion events for realistic chart data...');

	// Delete some organizations (about 20% of them)
	const orgsToDelete = faker.helpers.arrayElements(
		organizations,
		Math.floor(organizations.length * 0.2)
	);
	for (const org of orgsToDelete) {
		const deletionDate = createSpreadDate(
			faker.number.int({ min: 5, max: 25 })
		); // Delete 5-25 days ago
		await db.metricEvent.create({
			data: {
				type: 'organization_deleted',
				entityId: org.id,
				timestamp: deletionDate,
				metadata: {},
			},
		});
	}

	// Delete some teams (about 15% of them)
	const teamsToDelete = faker.helpers.arrayElements(
		teams,
		Math.floor(teams.length * 0.15)
	);
	for (const team of teamsToDelete) {
		const deletionDate = createSpreadDate(
			faker.number.int({ min: 3, max: 20 })
		); // Delete 3-20 days ago
		await db.metricEvent.create({
			data: {
				type: 'team_deleted',
				entityId: team.id,
				timestamp: deletionDate,
				metadata: {
					organisationId: team.organisationId,
				},
			},
		});
	}

	// Delete some user profiles (about 10% of them)
	const usersToDelete = faker.helpers.arrayElements(
		userProfiles,
		Math.floor(userProfiles.length * 0.1)
	);
	for (const userProfile of usersToDelete) {
		const deletionDate = createSpreadDate(
			faker.number.int({ min: 1, max: 15 })
		); // Delete 1-15 days ago
		await db.metricEvent.create({
			data: {
				type: 'user_profile_deleted',
				entityId: userProfile.id,
				timestamp: deletionDate,
				metadata: {},
			},
		});
	}

	// Delete some cases (about 25% of them)
	const casesToDelete = faker.helpers.arrayElements(
		allCases,
		Math.floor(allCases.length * 0.25)
	);
	for (const caseItem of casesToDelete) {
		const deletionDate = createSpreadDate(
			faker.number.int({ min: 2, max: 18 })
		); // Delete 2-18 days ago
		await db.metricEvent.create({
			data: {
				type: 'case_deleted',
				entityId: caseItem.id,
				timestamp: deletionDate,
				metadata: {
					teamId: caseItem.teamId,
					clientId: caseItem.clientId,
				},
			},
		});
	}

	// Create additional invite deletion events for better chart data
	console.log('🗑️ Creating additional invite deletion events...');

	// Create some invite deletion events with different timestamps than creation
	for (let i = 0; i < 10; i++) {
		const randomInvite = faker.helpers.arrayElement(allInvites);
		if (randomInvite && randomInvite.status !== 'cancelled') {
			// Create a deletion event that happens after the invite was created
			const deletionDate = new Date(
				randomInvite.createdAt.getTime() +
					faker.number.int({ min: 1, max: 48 }) * 60 * 60 * 1000
			); // 1-48 hours after creation

			await db.metricEvent.create({
				data: {
					type: 'invite_deleted',
					entityId: randomInvite.id,
					timestamp: deletionDate,
					metadata: {
						organisationId: randomInvite.organisationId,
						teamId: randomInvite.teamId,
					},
				},
			});
		}
	}

	console.log('✅ Created historical metric events');

	console.log('🎉 Seed completed successfully!');
	console.log(`📊 Summary:`);
	console.log(
		`   - 1 Admin user (admin@numio.com / password: sdfasfaefaegasdgfewER)`
	);
	console.log(`   - 150 Regular users (password: password123)`);
	console.log(`   - 4 Test users with multiple invites:`);
	console.log(
		`     * john.invitetest@example.com - Multiple pending invites to orgs + team`
	);
	console.log(
		`     * sarah.multiinvite@example.com - Mix of pending and expired invites`
	);
	console.log(
		`     * mike.expiredonly@example.com - Only expired invites (needs re-invite)`
	);
	console.log(`     * lisa.noprofile@example.com - No profile, only invites`);
	console.log(
		`   - 10 Organizations (with negative 7-day trend, positive 30-day trend)`
	);
	console.log(`   - ${teams.length} Teams`);
	console.log(`   - 25 Clients`);
	console.log(`   - ${cases.length} Cases`);
	console.log(`   - Comprehensive metric events:`);
	console.log(`     * organization_created, organization_deleted`);
	console.log(`     * team_created, team_deleted`);
	console.log(`     * user_profile_created, user_profile_deleted`);
	console.log(
		`     * invite_created, invite_accepted, invite_expired, invite_deleted`
	);
	console.log(`     * case_created, case_deleted`);
	console.log(`   - Diverse invite types:`);
	console.log(`     * Organization invites (for existing and new users)`);
	console.log(`     * Team invites (for existing and new users)`);
	console.log(`     * Case invites (simulated as team invites)`);
	console.log(
		`     * Mix of pending, expired, accepted, and cancelled invites`
	);
	console.log(`   - All invites expire after 72 hours`);
	console.log(`   - Various roles: owner, admin, member, assignee, client`);
}

main()
	.catch((e) => {
		console.error('❌ Seed failed:', e);
		process.exit(1);
	})
	.finally(async () => {
		await db.$disconnect();
	});
