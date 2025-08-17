'use client';

import { Check, Loader2 } from 'lucide-react';
import { Button } from '@shadcn/ui/button';
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from '@shadcn/ui/command';

import { UserProfileSearchData } from '@src/lib/db/user-profile/user-profile.types';
import { useEffect, useState } from 'react';

interface UserProfileCommandProps {
	value: string | null;
	onChange: (userId: string, user: UserProfileSearchData) => void;
	searchUsers: (query: string) => Promise<UserProfileSearchData[]>;
	selectedUser: UserProfileSearchData | null;
}

export function PickUserProfile({
	value,
	onChange,
	searchUsers,
	selectedUser,
}: UserProfileCommandProps) {
	const [query, setQuery] = useState('');
	const [results, setResults] = useState<UserProfileSearchData[]>([]);
	const [loading, setLoading] = useState(false);
	const [isSearching, setIsSearching] = useState(!selectedUser);

	useEffect(() => {
		setIsSearching(!selectedUser);
	}, [selectedUser]);

	useEffect(() => {
		if (!query) {
			setResults([]);
			setLoading(false);
			return;
		}
		setLoading(true);
		const timeout = setTimeout(() => {
			searchUsers(query)
				.then(setResults)
				.finally(() => setLoading(false));
		}, 300);
		return () => clearTimeout(timeout);
	}, [query, searchUsers]);

	if (!isSearching && selectedUser) {
		return (
			<div className="border-input bg-background flex items-center justify-between rounded-md border px-3 py-2 text-sm">
				<div className="flex flex-col">
					<span className="truncate">
						{[selectedUser.firstName, selectedUser.lastName]
							.filter(Boolean)
							.join(' ') || selectedUser.email}
					</span>
					<span className="text-muted-foreground text-xs">
						{selectedUser.email}
					</span>
				</div>
				<Button variant="ghost" size="sm" onClick={() => setIsSearching(true)}>
					Change
				</Button>
			</div>
		);
	}

	return (
		<Command shouldFilter={false} className="rounded-md border">
			<CommandInput
				placeholder="Search users..."
				value={query}
				onValueChange={setQuery}
				className="h-9"
				autoFocus
			/>

			{results.length > 0 && (
				<CommandList>
					{loading && (
						<div className="flex items-center justify-center py-2">
							<Loader2 className="text-muted-foreground h-4 w-4 animate-spin" />
						</div>
					)}
					{!loading && results.length === 0 && query && (
						<CommandEmpty>No users found.</CommandEmpty>
					)}
					<CommandGroup>
						{results.map((user) => (
							<CommandItem
								key={user.id}
								value={String(user.id)}
								onSelect={() => {
									onChange(user.id, user);
									setIsSearching(false);
									setQuery('');
								}}
							>
								<div className="flex flex-col">
									<span className="truncate">
										{[user.firstName, user.lastName]
											.filter(Boolean)
											.join(' ') || user.email}
									</span>
									<span className="text-muted-foreground text-xs">
										{user.email}
									</span>
								</div>
								{value === user.id && (
									<Check className="ml-auto h-4 w-4 shrink-0 opacity-100" />
								)}
							</CommandItem>
						))}
					</CommandGroup>
				</CommandList>
			)}
		</Command>
	);
}
