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
		},
	});

	console.log('✅ Created admin user and profile');

	// Create 10 organizations
	const organizations = [];

	for (let i = 1; i <= 10; i++) {
		const org = await db.organisation.create({
			data: {
				name: faker.company.name(),
				ownerId: adminProfile.id,
			},
		});
		organizations.push(org);
		console.log(`✅ Created organization: ${org.name}`);
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
			},
		});

		users.push(user);
		userProfiles.push(userProfile);

		if (i % 25 === 0) {
			console.log(`✅ Created ${i} users...`);
		}
	}

	console.log('✅ Created all 150 users and profiles');

	// Create teams for each organization (3-6 teams per org)
	const teams = [];

	for (let orgIndex = 0; orgIndex < organizations.length; orgIndex++) {
		const org = organizations[orgIndex];
		if (!org) continue;

		const teamCount = faker.number.int({ min: 3, max: 6 });

		for (let teamIndex = 0; teamIndex < teamCount; teamIndex++) {
			const team = await db.team.create({
				data: {
					name: faker.company.name() + ' Team',
					description: faker.lorem.sentence(),
					organisationId: org.id,
					ownerId: adminProfile.id,
					state: faker.helpers.arrayElement(['active', 'inactive']),
				},
			});
			teams.push(team);
		}
		console.log(`✅ Created ${teamCount} teams for organization: ${org.name}`);
	}

	console.log(`✅ Created ${teams.length} total teams`);

	// Create organization memberships for users
	console.log('🏢 Creating organization memberships...');

	for (let i = 0; i < userProfiles.length; i++) {
		const userProfile = userProfiles[i];
		if (!userProfile) continue;

		// Each user belongs to 1-3 organizations
		const orgCount = faker.number.int({ min: 1, max: 3 });
		const selectedOrgs = faker.helpers.arrayElements(organizations, orgCount);

		for (const org of selectedOrgs) {
			const role = faker.helpers.arrayElement([
				Role.owner,
				Role.admin,
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

	for (let i = 0; i < userProfiles.length; i++) {
		const userProfile = userProfiles[i];
		if (!userProfile) continue;

		// Each user belongs to 1-4 teams
		const teamCount = faker.number.int({ min: 1, max: 4 });
		const selectedTeams = faker.helpers.arrayElements(teams, teamCount);

		for (const team of selectedTeams) {
			const role = faker.helpers.arrayElement([
				Role.admin,
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

		for (const org of selectedOrgs) {
			await db.membership.create({
				data: {
					teamId: faker.helpers.arrayElement(teams).id,
					clientId: client.id,
					role: Role.client,
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
				role: Role.admin,
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
	const createRecentDate = () => {
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
					Role.admin,
				]),
				token: generateToken(),
				expiresAt: createExpiryDate(),
				status: 'PENDING',
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
				status: 'PENDING',
			},
		});
	}

	// Test User 2: Mix of pending and expired invites
	// Pending invite to organization
	if (organizations[0] && testUser2Profile.email) {
		await db.invite.create({
			data: {
				email: testUser2Profile.email,
				organisationId: organizations[0].id,
				role: Role.admin,
				token: generateToken(),
				expiresAt: createExpiryDate(),
				status: 'PENDING',
			},
		});
	}

	// Expired invite to organization
	if (organizations[1] && testUser2Profile.email) {
		await db.invite.create({
			data: {
				email: testUser2Profile.email,
				organisationId: organizations[1].id,
				role: Role.member,
				token: generateToken(),
				expiresAt: createExpiredDate(),
				status: 'EXPIRED',
			},
		});
	}

	// Pending invite to team
	const teamForUser2 = faker.helpers.arrayElement(teams);
	if (teamForUser2 && testUser2Profile.email) {
		await db.invite.create({
			data: {
				email: testUser2Profile.email,
				teamId: teamForUser2.id,
				role: Role.assignee,
				token: generateToken(),
				expiresAt: createExpiryDate(),
				status: 'PENDING',
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
				status: 'EXPIRED',
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
					Role.admin,
				]),
				token: generateToken(),
				expiresAt: createExpiryDate(),
				status: 'PENDING',
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
				status: 'EXPIRED',
			},
		});
	}

	console.log('✅ Created multiple invites for test users');

	// Create diverse invites for existing users (team and case invites)
	console.log('📧 Creating team and case invites for existing users...');

	// Create team invites for existing users
	for (let i = 0; i < 10; i++) {
		const randomUserProfile = faker.helpers.arrayElement(userProfiles);
		const randomTeam = faker.helpers.arrayElement(teams);

		if (randomUserProfile?.email && randomTeam) {
			await db.invite.create({
				data: {
					email: randomUserProfile.email,
					teamId: randomTeam.id,
					role: faker.helpers.arrayElement([
						Role.member,
						Role.assignee,
						Role.admin,
					]),
					token: generateToken(),
					expiresAt: faker.datatype.boolean()
						? createExpiryDate()
						: createExpiredDate(),
					status: faker.helpers.arrayElement(['PENDING', 'EXPIRED']),
				},
			});
		}
	}

	// Create case invites for existing users (simulated as team invites with specific context)
	for (let i = 0; i < 8; i++) {
		const randomUserProfile = faker.helpers.arrayElement(userProfiles);
		const randomCase = faker.helpers.arrayElement(cases);

		if (randomUserProfile?.email && randomCase) {
			// For case invites, we'll use the team context since cases belong to teams
			await db.invite.create({
				data: {
					email: randomUserProfile.email,
					teamId: randomCase.teamId,
					role: Role.assignee, // Cases typically use assignee role
					token: generateToken(),
					expiresAt: faker.datatype.boolean()
						? createExpiryDate()
						: createExpiredDate(),
					status: faker.helpers.arrayElement(['PENDING', 'EXPIRED']),
				},
			});
		}
	}

	// Create invites for completely new users (no UserProfile yet)
	console.log('📧 Creating invites for new users...');

	// New user organization invites
	for (let i = 0; i < 15; i++) {
		const randomOrg = faker.helpers.arrayElement(organizations);
		if (randomOrg) {
			await db.invite.create({
				data: {
					email: faker.internet.email(),
					organisationId: randomOrg.id,
					role: faker.helpers.arrayElement([
						Role.member,
						Role.assignee,
						Role.admin,
					]),
					token: generateToken(),
					expiresAt: faker.datatype.boolean()
						? createExpiryDate()
						: createExpiredDate(),
					status: faker.helpers.arrayElement(['PENDING', 'EXPIRED']),
				},
			});
		}
	}

	// New user team invites
	for (let i = 0; i < 12; i++) {
		const randomTeam = faker.helpers.arrayElement(teams);
		if (randomTeam) {
			await db.invite.create({
				data: {
					email: faker.internet.email(),
					teamId: randomTeam.id,
					role: faker.helpers.arrayElement([Role.member, Role.assignee]),
					token: generateToken(),
					expiresAt: faker.datatype.boolean()
						? createExpiryDate()
						: createExpiredDate(),
					status: faker.helpers.arrayElement(['PENDING', 'EXPIRED']),
				},
			});
		}
	}

	// Create regular invites for other organizations
	for (const org of organizations) {
		// Create 2-4 pending invites (not expired yet)
		const pendingCount = faker.number.int({ min: 2, max: 4 });
		for (let i = 0; i < pendingCount; i++) {
			await db.invite.create({
				data: {
					email: faker.internet.email(),
					organisationId: org.id,
					role: faker.helpers.arrayElement([
						Role.member,
						Role.assignee,
						Role.admin,
					]),
					token: generateToken(),
					expiresAt: createExpiryDate(),
					status: 'PENDING',
				},
			});
		}

		// Create 1-2 accepted invites
		const acceptedCount = faker.number.int({ min: 1, max: 2 });
		for (let i = 0; i < acceptedCount; i++) {
			const randomUserProfile = faker.helpers.arrayElement(userProfiles);
			if (randomUserProfile?.email) {
				await db.invite.create({
					data: {
						email: randomUserProfile.email,
						organisationId: org.id,
						role: faker.helpers.arrayElement([
							Role.member,
							Role.assignee,
							Role.admin,
						]),
						token: generateToken(),
						expiresAt: createRecentDate(),
						status: 'ACCEPTED',
						acceptedAt: createRecentDate(),
						acceptedById: randomUserProfile.id,
					},
				});
			}
		}

		// Create 1-3 expired invites (need to be re-invited)
		const expiredCount = faker.number.int({ min: 1, max: 3 });
		for (let i = 0; i < expiredCount; i++) {
			await db.invite.create({
				data: {
					email: faker.internet.email(),
					organisationId: org.id,
					role: faker.helpers.arrayElement([
						Role.member,
						Role.assignee,
						Role.admin,
					]),
					token: generateToken(),
					expiresAt: createExpiredDate(),
					status: 'EXPIRED',
				},
			});
		}

		// Create 0-1 cancelled invites
		const cancelledCount = faker.number.int({ min: 0, max: 1 });
		for (let i = 0; i < cancelledCount; i++) {
			await db.invite.create({
				data: {
					email: faker.internet.email(),
					organisationId: org.id,
					role: faker.helpers.arrayElement([
						Role.member,
						Role.assignee,
						Role.admin,
					]),
					token: generateToken(),
					expiresAt: createExpiredDate(),
					status: 'CANCELLED',
				},
			});
		}
	}

	console.log('✅ Created invites with different statuses');

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
	console.log(`   - 10 Organizations`);
	console.log(`   - ${teams.length} Teams`);
	console.log(`   - 25 Clients`);
	console.log(`   - ${cases.length} Cases`);
	console.log(`   - Multiple events`);
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
