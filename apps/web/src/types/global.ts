// ActionState type for server actions
export type ActionState<T> = {
	isSuccess: boolean;
	message: string;
	data?: T;
};
