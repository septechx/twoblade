<script lang="ts">
	import { io } from 'socket.io-client';
	import { onMount, onDestroy } from 'svelte';
	import { debounce, checkVocabulary, cn, getInitials, getRandomColor } from '$lib/utils';
	import { USER_DATA } from '$lib/stores/user';
	import { toast } from 'svelte-sonner';
	import { PUBLIC_WEBSOCKET_URL } from '$env/static/public';
	import { ScrollArea } from '$lib/components/ui/scroll-area';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import { Send, Hammer } from 'lucide-svelte';
	import { activeUsers } from '$lib/stores/users';

	let { data } = $props();
	let isAdmin = $state(data.isAdmin || false);

	type ChatMessage = {
		id: string;
		text: string;
		fromUser: string;
		fromIQ: number;
		timestamp: string;
	};

	let socket: any;
	let messages = $state<ChatMessage[]>([]);
	let messageInput = $state('');
	let vocabularyError = $state('');
	let isConnected = $state(false);
	let messagesDiv: HTMLDivElement;
	let messagesContainer: HTMLDivElement;
	let initialScrollDone = $state(false);
	let shakeScreen = $state(false);
	let isBanned = $state($USER_DATA?.is_banned || false);

	const debouncedCheckVocabulary = debounce(async () => {
		const userIQ = $USER_DATA?.iq ?? 100;
		if (messageInput) {
			const { isValid, limit } = checkVocabulary(messageInput, userIQ);
			if (!isValid) {
				vocabularyError = `Word length exceeds limit (${limit}) for IQ ${userIQ}.`;
			} else {
				vocabularyError = '';
			}
		} else {
			vocabularyError = '';
		}
	}, 300);

	function isScrolledToBottom(): boolean {
		if (!messagesContainer) return true;
		const threshold = 20;
		return messagesContainer.scrollHeight - messagesContainer.scrollTop - messagesContainer.clientHeight <
			threshold;
	}

	function scrollToBottom() {
		setTimeout(() => {
			if (messagesDiv) {
				messagesDiv.scrollIntoView({ behavior: 'smooth', block: 'end' });
			}
		}, 0);
	}

	function setupSocket() {
		socket = io(PUBLIC_WEBSOCKET_URL, {
			path: '/ws/socket.io',
			auth: { token: data.token },
			transports: ['websocket']
		});

		socket.on('connect', () => {
			isConnected = true;
		});

		socket.on('disconnect', () => {
			isConnected = false;
		});

		socket.on('users_count', (count: number) => {
			activeUsers.set(count);
		});

		socket.on('recent_messages', (recentMessages: ChatMessage[]) => {
			messages = recentMessages;
			scrollToBottom();
		});

		socket.on('message', (message: ChatMessage) => {
			// auto‐scroll if we were already at the bottom
			const wasAtBottom = isScrolledToBottom();
			messages = [...messages.slice(-199), message];
			if (wasAtBottom) scrollToBottom();
		});

		socket.on('error', (error: { message: string }) => {
			toast.error(error.message);
		});

		socket.on('user_banned', (bannedUserIdentifier: string) => {
			messages = messages.filter((m) => m.fromUser !== bannedUserIdentifier);

			const currentUserIdentifier = `${$USER_DATA?.username}#${$USER_DATA?.domain}`;
			if (bannedUserIdentifier === currentUserIdentifier) {
				isBanned = true;
				toast.error('You have been banned from chat.');
			}
		});
	}

	onMount(() => {
		setupSocket();
	});

	onDestroy(() => {
		if (socket) socket.disconnect();
	});

	$effect(() => {
		if (messageInput) {
			debouncedCheckVocabulary();
		} else {
			vocabularyError = '';
		}
	});

	let messageRateLimit = $state({
		lastSent: 0,
		cooldown: false
	});

	const MESSAGE_COOLDOWN = 500; // ~3 messages in 2s

	function handleSendMessage() {
		if (isBanned) {
			toast.error('You are banned from chat.');
			return;
		}

		if (!messageInput.trim() || !isConnected || vocabularyError) return;

		if (messageRateLimit.cooldown) {
			shakeScreen = true;
			setTimeout(() => (shakeScreen = false), 500);
			return;
		}

		socket.emit('message', messageInput);
		messageInput = '';

		messageRateLimit.cooldown = true;
		messageRateLimit.lastSent = Date.now();

		setTimeout(() => {
			messageRateLimit.cooldown = false;
		}, MESSAGE_COOLDOWN);
	}

	function formatTime(date: string) {
		return new Date(date).toLocaleTimeString([], {
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	const channel = {
		name: 'Twoblade Chat',
		description: 'Global chat room for IQ-based discussions'
	};

	$effect(() => {
		if (messages.length && messagesContainer && !initialScrollDone) {
			messagesContainer.scrollIntoView({ block: 'end' });
			initialScrollDone = true;
		}
	});

	function handleBanUser(userId: string) {
		if (!isAdmin) return;
		socket.emit('ban_user', userId);
	}
</script>

<div class="flex h-[calc(100vh-6rem)] w-full flex-col" class:shake={shakeScreen}>
	<ScrollArea class="flex-1">
		<div class="flex flex-col p-4" bind:this={messagesContainer}>
			<div bind:this={messagesDiv}>
				{#each messages as message}
					<div
						class="animate-message-appear hover:bg-muted/50 group mb-2 flex max-w-full items-start gap-3 rounded-lg p-2 transition-colors"
					>
						<div
							class={cn(
								'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full',
								getRandomColor(message.fromUser)
							)}
						>
							<span class="text-xs font-medium">{getInitials(message.fromUser.split('#')[0])}</span>
						</div>
						<div class="flex min-w-0 flex-1 overflow-hidden">
							<div class="min-w-0 flex-1">
								<div class="flex flex-wrap items-center gap-2">
									<span class="break-all text-sm font-medium">{message.fromUser}</span>
									<span
										class="bg-primary/10 text-primary whitespace-nowrap rounded px-2 py-0.5 text-xs"
									>
										{message.fromIQ} IQ
									</span>
									<span class="text-muted-foreground whitespace-nowrap text-xs">
										{formatTime(message.timestamp)}
									</span>
								</div>
								<p class="overflow-wrap-anywhere overflow-hidden break-words text-sm">
									{message.text}
								</p>
							</div>
							{#if isAdmin && !message.fromUser.includes($USER_DATA?.username ?? '')}
								<Button
									variant="destructive"
									size="sm"
									onclick={() => handleBanUser(message.fromUser)}
									class="flex items-center gap-1.5 self-center opacity-0 transition-opacity group-hover:opacity-100"
								>
									<Hammer class="h-4 w-4" />
									<span>Ban</span>
								</Button>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		</div>
	</ScrollArea>

	<div class="bg-background w-full border-t p-4">
		<div class="flex gap-2">
			<Input
				bind:value={messageInput}
				placeholder={isBanned ? 'You are banned' : 'Write a message...'}
				class="h-10"
				onkeydown={(e) =>
					!isBanned &&
					e.key === 'Enter' &&
					!e.shiftKey &&
					(e.preventDefault(), handleSendMessage())}
				disabled={isBanned}
			/>
			<Button
				variant="default"
				onclick={handleSendMessage}
				disabled={isBanned || !isConnected || !!vocabularyError || messageRateLimit.cooldown}
			>
				<Send />
			</Button>
		</div>
		{#if vocabularyError && !isBanned}
			<p class="text-destructive mt-2 text-xs">{vocabularyError}</p>
		{/if}
	</div>
</div>

<style>
	.animate-message-appear {
		animation: message-appear 0.3s ease-out forwards;
	}

	@keyframes message-appear {
		from {
			opacity: 0;
			transform: translateY(10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.shake {
		animation: shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
		transform: translate3d(0, 0, 0);
	}

	@keyframes shake {
		10%,
		90% {
			transform: translate3d(-1px, 0, 0);
		}
		20%,
		80% {
			transform: translate3d(2px, 0, 0);
		}
		30%,
		50%,
		70% {
			transform: translate3d(-4px, 0, 0);
		}
		40%,
		60% {
			transform: translate3d(4px, 0, 0);
		}
	}

	.overflow-wrap-anywhere {
		overflow-wrap: anywhere;
		word-break: break-word;
		min-width: 0;
	}
</style>
