'use client';

import { useFormContext } from 'react-hook-form';
import { Input } from '@shadcn/ui/input';
import { Loader2, Check } from 'lucide-react';
import {
	FormField,
	FormItem,
	FormLabel,
	FormControl,
	FormMessage,
} from '@shadcn/ui/form';

interface AsyncInputProps {
	name: string;
	label: string;
	placeholder?: string;
	disabled?: boolean;
	required?: boolean;
}

export default function AsyncInput({
	name,
	label,
	placeholder,
	disabled = false,
	required = false,
}: AsyncInputProps) {
	const { control, formState, getFieldState } = useFormContext();
	const { isValidating } = formState;
	const fieldState = getFieldState(name, formState);

	const showCheckmark =
		!isValidating && fieldState.isDirty && !fieldState.error;

	return (
		<FormField
			control={control}
			name={name}
			render={({ field }) => (
				<FormItem>
					<FormLabel>
						{label}
						{required && <span className="text-destructive">*</span>}
					</FormLabel>
					<FormControl>
						<div className="relative flex items-center">
							<Input
								{...field}
								value={field.value ?? ''}
								placeholder={placeholder}
								disabled={disabled}
								aria-invalid={!!fieldState.error}
								className="pr-8"
							/>
							<div className="absolute inset-y-0 right-0 flex items-center pr-3">
								{isValidating ? (
									<Loader2 className="text-muted-foreground h-4 w-4 animate-spin" />
								) : showCheckmark ? (
									<Check className="h-4 w-4 text-green-500" />
								) : null}
							</div>
						</div>
					</FormControl>
					<FormMessage />
				</FormItem>
			)}
		/>
	);
}
