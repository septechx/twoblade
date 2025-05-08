<script lang="ts">
	import {
		Square,
		CheckSquare,
		Inbox,
		TagsIcon,
		MessagesSquare,
		Users,
		Bell,
		Bomb,
		Clock
	} from 'lucide-svelte';
	import { ScrollArea } from '$lib/components/ui/scroll-area';
	import { scale } from 'svelte/transition';
	import Star from '$lib/components/self/icons/Star.svelte';
	import EmailViewer from '$lib/components/self/EmailViewer.svelte';
	import type { Email } from '$lib/types/email';
	import * as Resizable from '$lib/components/ui/resizable/index.js';
	import SnoozeButton from './SnoozeButton.svelte';
	import UnsnoozeButton from './UnsnoozeButton.svelte';
	import TimeUntil from '$lib/components/self/TimeUntil.svelte';
	import { toast } from 'svelte-sonner';
	import { USER_DATA } from '$lib/stores/user';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import { classificationColors } from '$lib/utils/classification-colors';
	import { formatEmailDate } from '$lib/utils/format-date';
	import { onMount } from 'svelte';

	let props = $props<{
		emails: Email[];
		showStatus?: boolean;
		showUnsnooze?: boolean;
		showRecipient?: boolean;
	}>();

	let emails = $derived(props.emails);
	let showStatus = $derived(props.showStatus ?? false);
	let showUnsnooze = $derived(props.showUnsnooze ?? false);
	let showRecipient = $derived(props.showRecipient ?? false);

	let selectedEmail: Email | null = $state(null);
	let selectedEmails = $state<Set<string>>(new Set());
	let starredEmails = $derived(
		new Set(emails.filter((e: Email) => e.starred).map((e: Email) => e.id))
	);

	let isReceiver = $derived(
		(email: Email) => email.to_address === $USER_DATA?.username + '#' + $USER_DATA?.domain
	);

	function formatScheduledDate(date: string) {
		const scheduledDate = new Date(date);

		return `${scheduledDate.toLocaleString([], {
			dateStyle: 'medium',
			timeStyle: 'short'
		})}`;
	}

	function formatExpiration(date: string) {
		const expiryDate = new Date(date);
		const now = new Date();
		const diff = expiryDate.getTime() - now.getTime();
		const isAgo = diff < 0;
		const absDiff = Math.abs(diff);

		const seconds = Math.floor(absDiff / 1000);
		const minutes = Math.floor(seconds / 60);
		const hours = Math.floor(minutes / 60);
		const days = Math.floor(hours / 24);

		let result = '';
		if (days > 0) {
			result = `${days} days`;
		} else if (hours > 0) {
			result = `${hours} hours`;
		} else if (minutes > 0) {
			result = `${minutes} minutes`;
		} else {
			result = `${seconds} seconds`;
		}

		return isAgo ? `${result} ago` : result;
	}

	function toggleSelect(emailId: string) {
		const newSet = new Set(selectedEmails);
		if (newSet.has(emailId)) newSet.delete(emailId);
		else newSet.add(emailId);
		selectedEmails = newSet;
	}

	async function toggleStar(emailId: string) {
		const emailIndex = emails.findIndex((e: Email) => e.id === emailId);
		if (emailIndex === -1) return;
		const email = emails[emailIndex];

		try {
			const response = await fetch('/api/emails/star', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ emailId, starred: !email.starred })
			});

			if (response.ok) {
				emails[emailIndex] = { ...email, starred: !email.starred };
			} else {
				toast.error('Failed to update star status');
			}
		} catch (error) {
			toast.error('Failed to update star status');
		}
	}

	async function handleEmailSelect(email: Email) {
		const emailIndex = emails.findIndex((e: Email) => e.id === email.id);
		if (emailIndex === -1) return;

		if (email.self_destruct && isReceiver(email)) {
			selectedEmail = email;
			const newEmails = emails.filter((e: Email) => e.id !== email.id);
			emails = newEmails;
			toast.info('Self-destructing email has been removed', {
				duration: 4000
			});
			return;
		}

		if (isReceiver(email) && !email.read_at) {
			try {
				const response = await fetch('/api/emails/read', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ emailId: email.id })
				});

				if (response.ok) {
					const updatedEmails = [...emails];
					updatedEmails[emailIndex] = {
						...updatedEmails[emailIndex],
						read_at: new Date().toISOString()
					};
					emails = updatedEmails;
				} else {
					console.error('Failed to mark email as read via API');
				}
			} catch (error) {
				console.error('Failed to mark email as read:', error);
			}
		}
		selectedEmail = email;
	}

	function handleKeyDown(event: KeyboardEvent, email: Email) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			selectedEmail = email;
		}
	}

	function handleActionComplete(ids: string[]) {
		const idsSet = new Set(ids);
		const newEmails = emails.filter((email: Email) => !idsSet.has(email.id));
		props = { ...props, emails: newEmails };
		selectedEmails = new Set();
		if (selectedEmail && idsSet.has(selectedEmail.id)) {
			selectedEmail = null;
		}
	}

	type Classification = 'primary' | 'promotions' | 'social' | 'forums' | 'updates';

	const classificationIcons: Record<
		Classification,
		typeof Inbox | typeof TagsIcon | typeof Users | typeof MessagesSquare | typeof Bell
	> = {
		primary: Inbox,
		promotions: TagsIcon,
		social: Users,
		forums: MessagesSquare,
		updates: Bell
	};

	function truncateText(text: string, maxLength: number) {
		if (!text) return '';
		return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
	}

	let isMobile = $state(false);
	let subjectMaxLength = $state(35);
	let bodyMaxLength = $state(50);

	function updateScreenSizes() {
		isMobile = window.innerWidth < 768;
		subjectMaxLength = isMobile ? 25 : 50;
		bodyMaxLength = isMobile ? 35 : 70;
	}

	onMount(() => {
		updateScreenSizes();
		window.addEventListener('resize', updateScreenSizes);
		return () => window.removeEventListener('resize', updateScreenSizes);
	});
</script>

<div class="h-[calc(100vh-6rem)] w-full">
	{#if selectedEmails.size > 0}
		<div
			class="bg-background/95 supports-[backdrop-filter]:bg-background/60 flex items-center gap-2 border-b p-2 backdrop-blur"
		>
			<span class="text-muted-foreground text-sm">
				{selectedEmails.size} selected
			</span>
			{#if showUnsnooze}
				<UnsnoozeButton {selectedEmails} onUnsnooze={handleActionComplete} />
			{:else}
				<SnoozeButton {selectedEmails} onSnooze={handleActionComplete} />
			{/if}
		</div>
	{/if}
	<Resizable.PaneGroup direction="horizontal" class="relative">
		<Resizable.Pane
			minSize={25}
			maxSize={80}
			class="absolute inset-0 z-10 md:relative md:z-0 {selectedEmail ? 'hidden md:block' : 'block'}"
		>
			<ScrollArea class="h-full w-full">
				<div class="flex flex-col gap-1 px-2 py-2 md:px-6 md:py-4">
					{#if emails.length === 0}
						<div class="text-muted-foreground flex h-32 items-center justify-center">
							<p>No emails</p>
						</div>
					{:else}
						{#each emails as email (email.id)}
							<button
								type="button"
								class={`hover:bg-accent hover:text-accent-foreground flex flex-col items-start gap-1 rounded-lg p-2 text-left text-xs transition-colors md:gap-2 md:p-3 md:text-sm ${
									selectedEmails.has(email.id) ? 'bg-accent text-accent-foreground' : ''
								} ${selectedEmail?.id === email.id ? 'bg-accent text-accent-foreground' : ''}`}
								aria-label={`Email from ${email.from_address} with subject ${email.subject}`}
								onclick={() => handleEmailSelect(email)}
								onkeydown={(e) => handleKeyDown(e, email)}
							>
								<div class="flex w-full items-center">
									<div class="flex items-center space-x-1">
										<span
											class="hover:bg-primary/10 group rounded-full p-1.5 transition-colors"
											role="checkbox"
											aria-checked={selectedEmails.has(email.id)}
											tabindex="0"
											onclick={(e) => {
												e.stopPropagation();
												toggleSelect(email.id);
											}}
											onkeydown={(e) => {
												if (e.key === 'Enter' || e.key === ' ') {
													e.preventDefault();
													e.stopPropagation();
													toggleSelect(email.id);
												}
											}}
										>
											{#if selectedEmails.has(email.id)}
												<div in:scale|fade={{ duration: 150 }}>
													<CheckSquare class="text-primary h-5 w-5" />
												</div>
											{:else}
												<div in:scale|fade={{ duration: 150 }}>
													<Square class="group-hover:text-primary h-5 w-5 text-gray-400" />
												</div>
											{/if}
										</span>
										<span
											class="group rounded-full p-1.5 transition-colors ease-in-out hover:bg-yellow-400/10"
											role="button"
											aria-pressed={starredEmails.has(email.id)}
											tabindex="0"
											onclick={(e) => {
												e.stopPropagation();
												toggleStar(email.id);
											}}
											onkeydown={(e) => {
												if (e.key === 'Enter' || e.key === ' ') {
													e.preventDefault();
													e.stopPropagation();
													toggleStar(email.id);
												}
											}}
										>
											{#if starredEmails.has(email.id)}
												<div in:scale|fade={{ duration: 150 }}>
													<Star class="h-5 w-5 text-yellow-500" filled={true} />
												</div>
											{:else}
												<div in:scale|fade={{ duration: 150 }}>
													<Star class="group-hover:text-red-40 h-5 w-5 text-gray-400" />
												</div>
											{/if}
										</span>
									</div>
									<div class="ml-2 flex min-w-0 flex-1 items-center md:ml-3">
										<!-- Mobile Layout -->
										<div class="flex w-full min-w-0 flex-col md:hidden">
											<div class="flex w-full min-w-0 items-center">
												<div class="mr-2 min-w-0 max-w-[60%] flex-1">
													<span
														class="block truncate {isReceiver(email) && !email.read_at
															? 'font-bold'
															: ''}"
													>
														{truncateText(email.subject, subjectMaxLength)}
													</span>
												</div>
												<div class="flex flex-shrink-0 items-center gap-1">
													<div class="inline-flex gap-1">
														<Tooltip.Root>
															<Tooltip.Trigger
																class="flex h-6 w-6 items-center justify-center rounded-full transition-colors 
																{classificationColors[email.classification as Classification].bg}/10
																{classificationColors[email.classification as Classification].text}
																{classificationColors[email.classification as Classification].bgStrong}"
															>
																{@const Icon =
																	classificationIcons[email.classification as Classification]}
																<Icon class="h-3.5 w-3.5" />
															</Tooltip.Trigger>
															<Tooltip.Content>
																<p class="capitalize">{email.classification}</p>
															</Tooltip.Content>
														</Tooltip.Root>

														{#if email.self_destruct}
															<Tooltip.Root>
																<Tooltip.Trigger
																	class="text-destructive bg-destructive/10 hover:bg-destructive/20 flex h-6 w-6 items-center justify-center
																	rounded-full transition-colors"
																>
																	<Bomb class="h-3.5 w-3.5" />
																</Tooltip.Trigger>
																<Tooltip.Content>
																	<p>Self-destructing email (deletes after reading)</p>
																</Tooltip.Content>
															</Tooltip.Root>
														{/if}

														{#if email.expires_at}
															<Tooltip.Root>
																<Tooltip.Trigger
																	class="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/10
																	text-amber-500 transition-colors hover:bg-amber-500/20"
																>
																	<Clock class="h-3.5 w-3.5" />
																</Tooltip.Trigger>
																<Tooltip.Content>
																	<p>Expires in {formatExpiration(email.expires_at)}</p>
																</Tooltip.Content>
															</Tooltip.Root>
														{/if}
													</div>
													<span class="flex-shrink-0 whitespace-nowrap text-xs/snug">
														{formatEmailDate(email.sent_at)}
													</span>
												</div>
											</div>
											<span class="text-muted-foreground block text-xs"
												>{truncateText(email.body, bodyMaxLength)}</span
											>
										</div>

										<!-- Desktop Layout -->
										<div class="hidden min-w-0 flex-1 items-center gap-2 md:flex">
											<div class="flex max-w-[200px] flex-shrink-0 items-center gap-2">
												<span
													class="max-w-[200px] truncate font-medium {isReceiver(email) &&
													!email.read_at
														? 'font-bold'
														: ''}"
												>
													{showRecipient ? email.to_address : email.from_address}
												</span>

												<!-- Classification icon moved here for desktop -->
												<Tooltip.Root>
													<Tooltip.Trigger
														class="flex h-6 w-6 items-center justify-center rounded-full transition-colors 
														{classificationColors[email.classification as Classification].bg}/10
														{classificationColors[email.classification as Classification].text}
														{classificationColors[email.classification as Classification].bgStrong}"
													>
														{@const Icon =
															classificationIcons[email.classification as Classification]}
														<Icon class="h-3.5 w-3.5" />
													</Tooltip.Trigger>
													<Tooltip.Content>
														<p class="capitalize">{email.classification}</p>
													</Tooltip.Content>
												</Tooltip.Root>
											</div>

											<div class="min-w-0 flex-1">
												<div class="flex min-w-0 items-center gap-1">
													<span
														class="min-w-0 {isReceiver(email) && !email.read_at ? 'font-bold' : ''}"
													>
														{truncateText(email.subject, subjectMaxLength)}
													</span>
													<span class="text-muted-foreground min-w-0"
														>- {truncateText(email.body, bodyMaxLength)}</span
													>
												</div>
											</div>

											<div class="flex flex-shrink-0 items-center gap-2">
												<div class="inline-flex gap-2">
													{#if email.self_destruct}
														<Tooltip.Root>
															<Tooltip.Trigger
																class="text-destructive bg-destructive/10 hover:bg-destructive/20 flex h-6 w-6 items-center justify-center
																rounded-full transition-colors"
															>
																<Bomb class="h-3.5 w-3.5" />
															</Tooltip.Trigger>
															<Tooltip.Content>
																<p>Self-destructing email (deletes after reading)</p>
															</Tooltip.Content>
														</Tooltip.Root>
													{/if}

													{#if email.expires_at}
														<Tooltip.Root>
															<Tooltip.Trigger
																class="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/10
																text-amber-500 transition-colors hover:bg-amber-500/20"
															>
																<Clock class="h-3.5 w-3.5" />
															</Tooltip.Trigger>
															<Tooltip.Content>
																<p>Expires in {formatExpiration(email.expires_at)}</p>
															</Tooltip.Content>
														</Tooltip.Root>
													{/if}
												</div>
												<span class="flex-shrink-0 whitespace-nowrap text-xs/snug">
													{formatEmailDate(email.sent_at)}
												</span>
											</div>
										</div>
									</div>
								</div>
								{#if email.snooze_until && new Date(email.snooze_until) > new Date()}
									<TimeUntil date={email.snooze_until} />
								{/if}
								{#if showStatus && email.status}
									<div class="flex items-center gap-2">
										{#if email.status === 'sent'}
											<span
												class="bg-primary/10 text-primary inline-flex items-center rounded-md px-2 py-1 text-xs font-medium"
											>
												Sent
											</span>
										{:else if email.status === 'sending' || email.status === 'pending'}
											<span
												class="bg-accent/10 text-accent-foreground inline-flex items-center rounded-md px-2 py-1 text-xs font-medium"
											>
												{email.status === 'sending' ? 'Sending...' : 'Pending'}
											</span>
										{:else if email.status === 'scheduled'}
											<span
												class="bg-accent/10 text-accent-foreground inline-flex items-center rounded-md px-2 py-1 text-xs font-medium"
											>
												Scheduled
											</span>
											{#if email.scheduled_at}
												<span class="text-muted-foreground text-xs italic">
													(scheduled for {formatScheduledDate(email.scheduled_at)})
												</span>
											{/if}
										{:else}
											<span
												class="bg-destructive/10 text-destructive inline-flex items-center rounded-md px-2 py-1 text-xs font-medium"
											>
												{email.status === 'failed' ? 'Failed' : 'Rejected'}
											</span>
											{#if email.error_message}
												<span class="text-destructive/80 text-xs italic">
													({email.error_message})
												</span>
											{/if}
										{/if}
									</div>
								{/if}
							</button>
							{#if email.id !== emails[emails.length - 1].id}
								<div class="bg-border/50 mx-2 h-px md:mx-4"></div>
							{/if}
						{/each}
					{/if}
				</div>
			</ScrollArea>
		</Resizable.Pane>

		{#if selectedEmail}
			<Resizable.Handle withHandle class="hidden md:flex" />
			<Resizable.Pane class="bg-background fixed inset-0 z-20 md:relative md:z-0">
				<div class="h-full md:border-l">
					<EmailViewer email={selectedEmail} onClose={() => (selectedEmail = null)} />
				</div>
			</Resizable.Pane>
		{/if}
	</Resizable.PaneGroup>
</div>

<style>
	:global(html) {
		scrollbar-width: none;
		-ms-overflow-style: none;
	}
	:global(html::-webkit-scrollbar) {
		display: none;
	}
</style>
