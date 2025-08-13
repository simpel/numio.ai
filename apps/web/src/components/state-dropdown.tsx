'use client';

import { useState } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@src/utils';
import { Button } from '@shadcn/ui/button';
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandItem,
	CommandList,
} from '@shadcn/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@shadcn/ui/popover';
import { useTranslations } from 'next-intl';
import {
	getStateDisplayName,
	CaseState,
} from '@src/lib/state-machines/case-state-machine';

interface StateOption {
	value: string;
	label: string;
	color: string;
}

interface StateDropdownProps {
	currentState: string;
	availableStates: StateOption[];
	onStateChange: (newState: string) => void;
	disabled?: boolean;
	placeholder?: string;
	className?: string;
}

export default function StateDropdown({
	currentState,
	availableStates,
	onStateChange,
	disabled = false,
	placeholder,
	className,
}: StateDropdownProps) {
	const t = useTranslations('common');
	const [open, setOpen] = useState(false);

	const defaultPlaceholder = placeholder || t('select_state');

	// Always show the current state as text, even if it's not in available transitions
	const currentStateText = currentState
		? getStateDisplayName(currentState as CaseState)
		: defaultPlaceholder;

	// Get all possible states
	const allStates = Object.values(CaseState).map((state) => ({
		value: state,
		label: getStateDisplayName(state),
		isAvailable: availableStates.some((available) => available.value === state),
	}));

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					role="combobox"
					aria-expanded={open}
					className={cn('justify-between', className)}
					disabled={disabled}
				>
					{currentStateText}
					<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-[200px] p-0">
				<Command>
					<CommandList>
						<CommandEmpty>{t('no_state_found')}</CommandEmpty>
						<CommandGroup>
							{allStates.map((state) => (
								<CommandItem
									key={state.value}
									value={state.value}
									onSelect={() => {
										if (state.isAvailable) {
											onStateChange(state.value);
											setOpen(false);
										}
									}}
									className={cn(
										!state.isAvailable && 'cursor-not-allowed opacity-50'
									)}
									disabled={!state.isAvailable}
								>
									<Check
										className={cn(
											'mr-2 h-4 w-4',
											currentState === state.value ? 'opacity-100' : 'opacity-0'
										)}
									/>
									{state.label}
									{!state.isAvailable && (
										<span className="text-muted-foreground ml-2 text-xs">
											{t('not_available')}
										</span>
									)}
								</CommandItem>
							))}
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
