export interface AuthErrorConfig {
	insufficientPermissions?: {
		code: string;
		message?: string;
	};
	notAuthenticated?: {
		code: string;
		message?: string;
	};
	notAuthorized?: {
		code: string;
		message?: string;
	};
}
