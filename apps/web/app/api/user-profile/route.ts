import { NextRequest, NextResponse } from 'next/server';
import { getUserProfileAction } from '@src/lib/auth/auth.actions';

export async function POST(request: NextRequest) {
	try {
		const { userId } = await request.json();

		if (!userId) {
			return NextResponse.json(
				{ error: 'User ID is required' },
				{ status: 400 }
			);
		}

		const result = await getUserProfileAction(userId);

		if (!result.isSuccess || !result.data) {
			return NextResponse.json(
				{ error: 'User profile not found' },
				{ status: 404 }
			);
		}

		return NextResponse.json({ data: result.data });
	} catch (error) {
		console.error('Error in user-profile API:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		);
	}
}
