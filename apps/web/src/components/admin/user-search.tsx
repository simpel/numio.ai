'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Search, User, ChevronDown } from 'lucide-react';
import { Input } from '@shadcn/ui/input';
import { Button } from '@shadcn/ui/button';
import { UserProfileSearchData } from '@src/lib/db/user-profile/user-profile.types';
import { searchUserProfilesAction } from '@src/lib/db/user-profile/user-profile.actions';

interface UserSearchProps {
	className?: string;
}

export function UserSearch({ className }: UserSearchProps) {
	const t = useTranslations('pages.admin');
	const router = useRouter();
	const [searchQuery, setSearchQuery] = useState('');
	const [searchResults, setSearchResults] = useState<UserProfileSearchData[]>([]);
	const [isSearching, setIsSearching] = useState(false);
	const [showDropdown, setShowDropdown] = useState(false);
	const [selectedIndex, setSelectedIndex] = useState(-1);
	const searchRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	// Debounced search effect
	useEffect(() => {
		const timeoutId = setTimeout(() => {
			if (searchQuery.trim().length >= 2) {
				performSearch(searchQuery);
			} else {
				setSearchResults([]);
				setShowDropdown(false);
			}
		}, 300);

		return () => clearTimeout(timeoutId);
	}, [searchQuery]);

	// Close dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
				setShowDropdown(false);
				setSelectedIndex(-1);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	const performSearch = async (query: string) => {
		setIsSearching(true);
		try {
			const result = await searchUserProfilesAction(query);
			if (result.isSuccess && result.data) {
				setSearchResults(result.data.slice(0, 10)); // Limit to 10 results
				setShowDropdown(result.data.length > 0);
			} else {
				setSearchResults([]);
				setShowDropdown(false);
			}
		} catch (error) {
			console.error('Error searching users:', error);
			setSearchResults([]);
			setShowDropdown(false);
		} finally {
			setIsSearching(false);
		}
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setSearchQuery(value);
		setSelectedIndex(-1);
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'ArrowDown') {
			e.preventDefault();
			setSelectedIndex(prev => 
				prev < searchResults.length - 1 ? prev + 1 : prev
			);
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
		} else if (e.key === 'Enter') {
			e.preventDefault();
			if (selectedIndex >= 0 && searchResults[selectedIndex]) {
				handleUserSelect(searchResults[selectedIndex]);
			}
		} else if (e.key === 'Escape') {
			setShowDropdown(false);
			setSelectedIndex(-1);
			inputRef.current?.blur();
		}
	};

	const handleUserSelect = (user: UserProfileSearchData) => {
		setSearchQuery('');
		setSearchResults([]);
		setShowDropdown(false);
		setSelectedIndex(-1);
		router.push(`/admin/user/${user.id}`);
	};

	const getUserDisplayName = (user: UserProfileSearchData) => {
		const firstName = user.firstName || '';
		const lastName = user.lastName || '';
		const fullName = `${firstName} ${lastName}`.trim();
		return fullName || user.email || 'Unknown User';
	};

	return (
		<div ref={searchRef} className={`relative ${className}`}>
			<div className="relative">
				<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
				<Input
					ref={inputRef}
					placeholder={t('search_placeholder')}
					value={searchQuery}
					onChange={handleInputChange}
					onKeyDown={handleKeyDown}
					onFocus={() => {
						if (searchResults.length > 0) {
							setShowDropdown(true);
						}
					}}
					className="pl-10 pr-4"
				/>
				{isSearching && (
					<div className="absolute right-3 top-1/2 -translate-y-1/2">
						<div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
					</div>
				)}
			</div>

			{/* Dropdown */}
			{showDropdown && searchResults.length > 0 && (
				<div className="absolute top-full z-50 mt-1 w-full rounded-md border bg-background shadow-lg">
					<div className="max-h-60 overflow-auto">
						{searchResults.map((user, index) => (
							<div
								key={user.id}
								className={`flex cursor-pointer items-center gap-3 px-3 py-2 hover:bg-muted/50 ${
									index === selectedIndex ? 'bg-muted/50' : ''
								}`}
								onClick={() => handleUserSelect(user)}
								onMouseEnter={() => setSelectedIndex(index)}
							>
								<div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-full">
									<User className="text-primary h-4 w-4" />
								</div>
								<div className="flex-1 min-w-0">
									<p className="font-medium truncate">
										{getUserDisplayName(user)}
									</p>
									{user.email && (
										<p className="text-muted-foreground text-sm truncate">
											{user.email}
										</p>
									)}
								</div>
								<ChevronDown className="h-4 w-4 text-muted-foreground" />
							</div>
						))}
					</div>
				</div>
			)}

			{/* No results */}
			{showDropdown && searchQuery.trim().length >= 2 && searchResults.length === 0 && !isSearching && (
				<div className="absolute top-full z-50 mt-1 w-full rounded-md border bg-background shadow-lg">
					<div className="px-3 py-4 text-center text-muted-foreground">
						{t('no_results')}
					</div>
				</div>
			)}
		</div>
	);
}
