'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { createCaseAction } from '@src/lib/db/case/case.actions';
import { Prisma } from '@numio/ai-database';
import { CaseFormSchema, CaseFormValues } from '@src/lib/db/case/case.types';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@shadcn/ui/form';
import { Input } from '@shadcn/ui/input';
import { Textarea } from '@shadcn/ui/textarea';
import { Button } from '@shadcn/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@shadcn/ui/popover';
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from '@shadcn/ui/command';
import { ChevronsUpDown, Check } from 'lucide-react';
import { cn } from '@src/utils';

interface CaseCreateFormProps {
	initialClientId?: string;
	initialTeamId?: string;
	initialOrganisationId?: string;
	organisations?: { id: string; name: string }[];
	clients: { id: string; name: string; organisationIds?: string[] }[];
	teams: {
		id: string;
		name: string;
		organisationId?: string;
		organisation?: { name: string } | null;
	}[];
}

export default function CaseCreateForm({
	initialClientId,
	initialTeamId,
	initialOrganisationId,
	organisations = [],
	clients,
	teams,
}: CaseCreateFormProps) {
	const t = useTranslations('common');
	const router = useRouter();
	const [pending, startTransition] = useTransition();
	const [error, setError] = useState<string | null>(null);

	const form = useForm<CaseFormValues>({
		resolver: zodResolver(CaseFormSchema),
		defaultValues: {
			clientId: initialClientId ?? '',
			teamId: initialTeamId ?? '',
			title: '',
			description: '',
		},
	});

	const [organisationId, setOrganisationId] = useState<string>(
		initialOrganisationId ?? ''
	);

	const watchedTeamId = form.watch('teamId');
	const watchedClientId = form.watch('clientId');
	const filteredTeams = useMemo(
		() =>
			teams.filter(
				(t) => !organisationId || t.organisationId === organisationId
			),
		[teams, organisationId]
	);
	const filteredClients = useMemo(
		() =>
			clients.filter(
				(c) =>
					!organisationId || (c.organisationIds ?? []).includes(organisationId)
			),
		[clients, organisationId]
	);

	// When team changes, align organisation with the team's organisation
	const selectedTeamOrgId = useMemo(
		() => teams.find((t) => t.id === watchedTeamId)?.organisationId,
		[teams, watchedTeamId]
	);

	// Sync organisation with selected team
	useEffect(() => {
		if (selectedTeamOrgId && selectedTeamOrgId !== organisationId) {
			setOrganisationId(selectedTeamOrgId);
		}
	}, [selectedTeamOrgId, organisationId]);

	// When client changes and it belongs to a single org, align organisation (only if no team selected)
	const selectedClientOrgIds = useMemo(
		() => clients.find((c) => c.id === watchedClientId)?.organisationIds ?? [],
		[clients, watchedClientId]
	);
	useEffect(() => {
		if (!selectedTeamOrgId && selectedClientOrgIds.length === 1) {
			setOrganisationId(selectedClientOrgIds[0] || '');
		}
	}, [selectedTeamOrgId, selectedClientOrgIds]);

	// If there is exactly one available organisation and none selected yet, default to it
	useEffect(() => {
		if (!organisationId && organisations.length === 1) {
			setOrganisationId(organisations[0]?.id || '');
		}
	}, [organisations, organisationId]);

	// Validate cross-organisation consistency
	const isCrossOrgValid = useMemo(() => {
		const teamOrg = teams.find((t) => t.id === watchedTeamId)?.organisationId;
		const clientOrgs =
			clients.find((c) => c.id === watchedClientId)?.organisationIds ?? [];
		if (!watchedTeamId || !watchedClientId) return true;
		if (!teamOrg) return true;
		return clientOrgs.includes(teamOrg);
	}, [teams, clients, watchedTeamId, watchedClientId]);

	async function onSubmit(values: CaseFormValues) {
		setError(null);
		startTransition(async () => {
			const input: Prisma.CaseCreateInput = {
				client: { connect: { id: values.clientId } },
				team: { connect: { id: values.teamId } },
				title: values.title,
				description: values.description || undefined,
			};
			const res = await createCaseAction(input);

			if (!res.isSuccess || !res.data) {
				setError(res.message || t('failed_to_create'));
				return;
			}
			router.push(`/case/${res.data.id}`);
		});
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
				{/* Organisation selection when applicable */}
				{!initialTeamId && organisations.length > 1 && (
					<div>
						<FormItem>
							<FormLabel>Organisation</FormLabel>
							<FormControl>
								<Combobox
									value={organisationId}
									onChange={(v) => setOrganisationId(v)}
									options={organisations.map((o) => ({
										value: o.id,
										label: o.name,
									}))}
									placeholder={t('select_organisation')}
									disabled={pending}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					</div>
				)}

				{!initialClientId && (
					<FormField
						control={form.control}
						name="clientId"
						render={({ field }) => (
							<FormItem>
								<FormLabel>{t('client')}</FormLabel>
								<FormControl>
									<Combobox
										value={field.value}
										onChange={(v) => {
											field.onChange(v);
											const orgIds =
												clients.find((c) => c.id === v)?.organisationIds ?? [];
											if (!selectedTeamOrgId && orgIds.length === 1) {
												setOrganisationId(orgIds[0] || '');
											}
										}}
										options={filteredClients.map((c) => ({
											value: c.id,
											label: c.name,
										}))}
										placeholder={t('select_client')}
										disabled={pending}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				)}

				{!initialTeamId && (
					<FormField
						control={form.control}
						name="teamId"
						render={({ field }) => (
							<FormItem>
								<FormLabel>{t('team')}</FormLabel>
								<FormControl>
									<Combobox
										value={field.value}
										onChange={(v) => {
											field.onChange(v);
											const orgId = teams.find(
												(t) => t.id === v
											)?.organisationId;
											if (orgId) setOrganisationId(orgId);
										}}
										options={filteredTeams.map((t) => ({
											value: t.id,
											label: `${t.name}${t.organisation ? ` • ${t.organisation.name}` : ''}`,
										}))}
										placeholder={t('select_team')}
										disabled={pending}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				)}

				<FormField
					control={form.control}
					name="title"
					render={({ field }) => (
						<FormItem>
							<FormLabel>{t('title')}</FormLabel>
							<FormControl>
								<Input {...field} disabled={pending} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="description"
					render={({ field }) => (
						<FormItem>
							<FormLabel>{t('description')}</FormLabel>
							<FormControl>
								<Textarea {...field} disabled={pending} rows={4} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				{error && <div className="text-destructive text-sm">{error}</div>}

				{!isCrossOrgValid && (
					<div className="text-destructive text-sm">
						Selected client and team must belong to the same organisation.
					</div>
				)}

				<div className="flex gap-2">
					<Button type="submit" disabled={pending || !isCrossOrgValid}>
						{pending ? 'Creating…' : 'Create Case'}
					</Button>
				</div>
			</form>
		</Form>
	);
}

interface ComboboxProps {
	value: string;
	onChange: (value: string) => void;
	options: { value: string; label: string }[];
	placeholder?: string;
	disabled?: boolean;
}

function Combobox({
	value,
	onChange,
	options,
	placeholder = 'Select…',
	disabled,
}: ComboboxProps) {
	const [open, setOpen] = useState(false);
	const selected = options.find((o) => o.value === value);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					role="combobox"
					aria-expanded={open}
					className={cn('w-full justify-between')}
					disabled={disabled}
					type="button"
				>
					{selected ? (
						selected.label
					) : (
						<span className="text-muted-foreground">{placeholder}</span>
					)}
					<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-[--radix-popover-trigger-width] p-0">
				<Command>
					<CommandInput placeholder="Search…" />
					<CommandList>
						<CommandEmpty>No results found.</CommandEmpty>
						<CommandGroup>
							{options.map((opt) => (
								<CommandItem
									key={opt.value}
									value={opt.label}
									onSelect={() => {
										onChange(opt.value);
										setOpen(false);
									}}
								>
									<Check
										className={cn(
											'mr-2 h-4 w-4',
											value === opt.value ? 'opacity-100' : 'opacity-0'
										)}
									/>
									{opt.label}
								</CommandItem>
							))}
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
