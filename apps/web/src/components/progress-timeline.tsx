'use client';

import { cn } from '@src/utils';

interface Event {
	id: string;
	type: string;
	occurredAt: Date | string;
	actor: {
		id: string;
		firstName?: string;
		lastName?: string;
		email?: string;
	};
	metadata?: {
		description?: string;
		[key: string]: unknown;
	};
}

interface ProgressTimelineProps {
	events: Event[];
	className?: string;
}

export default function ProgressTimeline({
	events,
	className,
}: ProgressTimelineProps) {
	if (!events || events.length === 0) {
		return (
			<div className={cn('py-4 text-center', className)}>
				<p className="text-muted-foreground text-sm">No events yet</p>
			</div>
		);
	}

	return (
		<div className={cn('space-y-4', className)}>
			<div className="relative">
				{/* Timeline line */}
				<div className="bg-border absolute bottom-0 left-3 top-0 w-0.5" />

				{/* Events */}
				<div className="space-y-4">
					{events.map((event) => (
						<div key={event.id} className="relative flex items-start gap-4">
							{/* Timeline dot */}
							<div className="bg-primary border-background relative z-10 flex h-6 w-6 items-center justify-center rounded-full border-2">
								<div className="bg-primary-foreground h-2 w-2 rounded-full" />
							</div>

							{/* Event content */}
							<div className="flex-1 space-y-1">
								<div className="flex items-center justify-between">
									<h4 className="text-sm font-medium capitalize">
										{event.type.replace(/([A-Z])/g, ' $1').trim()}
									</h4>
									<time className="text-muted-foreground text-xs">
										{new Date(event.occurredAt).toLocaleDateString()}
									</time>
								</div>

								<div className="space-y-1">
									<div className="text-muted-foreground text-xs">
										<span className="font-medium">By</span>{' '}
										{event.actor.firstName && event.actor.lastName
											? `${event.actor.firstName} ${event.actor.lastName}`
											: event.actor.email || 'Unknown'}
									</div>
									{event.metadata?.description && (
										<div className="text-muted-foreground text-xs">
											{event.metadata.description}
										</div>
									)}
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
