import { defineConfig } from 'prisma/config';

export default defineConfig({
	migrations: {
		seed: `tsx src/seed.ts`,
	},
});
