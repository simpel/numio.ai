import { Button } from '@shadcn/ui/button';
import { Progress } from '@shadcn/ui/progress';
import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';

export interface Step {
	label: string;
	content: React.ReactNode;
	optional?: boolean;
	canNext?: boolean;
}

interface MultiStepFormProps {
	steps: Step[];
	onFinish: () => void;
	onCancel: () => void;
	initialStep?: number;
	showStepIndicators?: boolean;
	pending?: boolean;
}

export default function MultiStepForm({
	steps,
	onFinish,
	onCancel,
	initialStep = 0,
	showStepIndicators = true,
	pending = false,
}: MultiStepFormProps) {
	const [current, setCurrent] = useState(initialStep);

	const isLast = current === steps.length - 1;
	const isFirst = current === 0;
	const completed = ((current + 1) / steps.length) * 100;

	if (!steps[current]) return null;

	const canNext =
		steps[current].canNext !== undefined ? steps[current].canNext : true;

	return (
		<div className="w-full">
			{/* Progress Bar */}
			<Progress value={completed} className="mb-4" />

			{/* Step Indicators */}
			{showStepIndicators && (
				<div className="mb-4 flex gap-2">
					{steps.map((step, idx) => (
						<div
							key={step.label}
							className={`rounded px-2 py-1 text-xs font-medium ${
								idx === current
									? 'bg-primary text-white'
									: 'bg-muted text-muted-foreground'
							}`}
						>
							{step.label}
							{step.optional && (
								<span className="ml-1 text-xs">(optional)</span>
							)}
						</div>
					))}
				</div>
			)}

			{/* Step Content */}
			<div>{steps[current].content}</div>

			{/* Navigation */}
			<div className="mt-4 flex justify-between gap-2">
				<div className="flex gap-2">
					{!isFirst && (
						<Button
							variant="outline"
							onClick={() => setCurrent(current - 1)}
							aria-label="Previous step"
						>
							<ArrowLeft className="mr-1 h-4 w-4" /> Previous
						</Button>
					)}
					<Button variant="outline" onClick={onCancel} aria-label="Cancel">
						Cancel
					</Button>
				</div>
				<div>
					{!isLast ? (
						<Button
							onClick={() => setCurrent(current + 1)}
							disabled={!canNext}
							variant="default"
							aria-label="Next step"
						>
							Next <ArrowRight className="ml-1 h-4 w-4" />
						</Button>
					) : (
						<Button
							variant="default"
							onClick={onFinish}
							disabled={pending}
							aria-label="Finish"
						>
							{pending ? (
								<span className="flex items-center gap-2">
									<Loader2 className="h-4 w-4 animate-spin" />
									Finishing...
								</span>
							) : (
								'Finish'
							)}
						</Button>
					)}
				</div>
			</div>
		</div>
	);
}
