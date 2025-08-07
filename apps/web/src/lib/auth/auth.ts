// src/lib/auth/auth.ts
import NextAuth from 'next-auth';
import type { NextAuthConfig, NextAuthResult } from 'next-auth';
import MicrosoftEntraID from 'next-auth/providers/microsoft-entra-id';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { redirect } from 'next/navigation';
import { db, Role } from '@numio/ai-database';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcrypt';
import { sendWelcomeEmail } from '@src/mails/welcome';

export const authOptions: NextAuthConfig = {
	adapter: PrismaAdapter(db),
	session: {
		strategy: 'jwt',
	},
	providers: [
		MicrosoftEntraID({
			clientId: process.env.AUTH_MICROSOFT_ENTRA_ID_ID!,
			clientSecret: process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET!,
			issuer: process.env.AUTH_MICROSOFT_ENTRA_ID_ISSUER!,
			authorization: {
				params: {
					scope: 'openid profile email User.Read',
				},
			},
		}),
		CredentialsProvider({
			name: 'Credentials',
			credentials: {
				email: { label: 'Email', type: 'text' },
				password: { label: 'Password', type: 'password' },
			},
			async authorize(credentials) {
				if (!credentials?.email || !credentials?.password) return null;
				const user = await db.user.findUnique({
					where: { email: credentials.email as string },
				});
				if (!user || !user.password) return null;
				// Use bcrypt to compare passwords!
				const isValid = await bcrypt.compare(
					credentials.password as string,
					user.password
				);
				if (!isValid) return null;
				return {
					id: user.id,
					name: user.name,
					email: user.email,
				};
			},
		}),
	],
	events: {
		createUser: async ({ user }) => {
			const existing = await db.userProfile.findUnique({
				where: { userId: user.id },
			});

			if (!existing) {
				if (!user.id) {
					redirect('/error');
				}

				const profile = await db.userProfile.create({
					data: {
						userId: user.id,
						firstName: user.name?.split(' ')[0],
						lastName: user.name?.split(' ')[1],
						email: user.email,
						image: user.image, // Copy image from User to UserProfile
						role: Role.authenticated,
						hasDoneIntro: false,
					},
				});

				// Send welcome email
				if (profile.email && profile.firstName) {
					await sendWelcomeEmail(profile.email, profile.firstName);
				}
			}
		},
	},
	callbacks: {
		async signIn({ user }) {
			if (!user.email) return false;
			return true;
		},
		// JWT callback to pass the user ID to the token
		jwt: async ({ token, user }) => {
			if (user) {
				token.sub = user.id;
			}
			return token;
		},
		async session({ session, token }) {
			if (token?.sub && session.user) {
				session.user.id = token.sub;
				// Check if profile exists
				const profile = await db.userProfile.findUnique({
					where: { userId: token.sub },
				});
				if (!profile) {
					const dbUser = await db.user.findUnique({
						where: { id: token.sub },
						select: { id: true, name: true, email: true },
					});
					if (dbUser) {
						await db.userProfile.create({
							data: {
								userId: dbUser.id,
								firstName: dbUser.name?.split(' ')[0],
								lastName: dbUser.name?.split(' ')[1],
								email: dbUser.email,
								role: Role.authenticated,
								hasDoneIntro: false,
							},
						});
					}
				}
			}
			return session;
		},
	},
	debug: process.env.NODE_ENV === 'development',
};

export const auth: NextAuthResult['auth'] = NextAuth(authOptions).auth;
export const signIn: NextAuthResult['signIn'] = NextAuth(authOptions).signIn;
export const signOut: NextAuthResult['signOut'] = NextAuth(authOptions).signOut;
export const handlers: NextAuthResult['handlers'] =
	NextAuth(authOptions).handlers;
