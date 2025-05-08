<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Card, CardContent } from '$lib/components/ui/card';
	import { Alert, AlertDescription, AlertTitle } from '$lib/components/ui/alert';
	import { AlertCircle, Check } from 'lucide-svelte';
	import { Progress } from '$lib/components/ui/progress';
	import DomainInput from '$lib/components/self/DomainInput.svelte';
	import { debounce, validateUsername } from '$lib/utils';
	import { PUBLIC_DOMAIN } from '$env/static/public';
	import { page } from '$app/stores';

	type Question = {
		question: string;
		options: string[];
		imageUrls?: string[];
	};

	type IQResponse = {
		completed: boolean;
		nextSection?: 'brainrot' | 'math' | 'literacy';
		score?: number;
		questionIndex: number;
	};

	let { form }: { form: ActionData } = $props();

	let initialUsername = $page.url.searchParams.get('username') || '';
	let username = $state(initialUsername);
	let password = $state('');
	let confirmPassword = $state('');
	let isSubmitting = $state(false);
	let clientError = $state('');
	let showTest = $state(false);
	let currentQuestion = $state<Question | null>(null);
	let sessionId = $state('');
	let testCompleted = $state(false);
	let currentTestSection = $state<'brainrot' | 'math' | 'literacy' | ''>('');
	let formValidated = $state(false);
	let iqScore = $state(0);

	let sessionData = $state<{
		questionIndex: number;
		section: string;
	} | null>(null);

	let usernameError = $state('');
	let usernamePending = $state(false);
	let isUsernameValid = $state(false);

	let currentSectionProgress = $derived(
		!currentQuestion ? 0 : (Math.min(sessionData?.questionIndex ?? 0, 4) + 1) * 20
	);

	const debouncedCheck = debounce(async (value: string) => {
		if (!value) {
			usernameError = '';
			isUsernameValid = false;
			return false;
		}

		if (!validateUsername(value)) {
			usernameError = 'Username contains invalid characters (or is over 20 characters)';
			isUsernameValid = false;
			return false;
		}
	
		usernamePending = true;
		const response = await fetch(`/api/username/check?username=${encodeURIComponent(value)}`);
		const data = await response.json();
		usernamePending = false;

		if (!data.available) {
			usernameError = data.error;
			isUsernameValid = false;
			return false;
		}

		usernameError = '';
		isUsernameValid = true;
		return true;
	}, 300);

	async function checkUsername() {
		return debouncedCheck(username);
	}

	function validateForm() {
		clientError = '';
		if (!username || !password || !confirmPassword) {
			return false;
		}
		if (usernameError) {
			return false;
		}
		if (password !== confirmPassword) {
			return false;
		}
		if (password.length < 8) {
			return false;
		}
		return true;
	}

	function handleSubmit() {
		if (!validateForm()) {
			return;
		}
		isSubmitting = true;
	}

	async function checkFormAndStartTest() {
		if (!formValidated) {
			if (!(await checkUsername()) || !validateForm()) return;

			formValidated = true;
			initIQTest();
		}
	}

	async function initIQTest() {
		const response = await fetch('/api/iq', {
			method: 'POST'
		});
		const data = await response.json();
		sessionId = data.sessionId;
		showTest = true;
		currentTestSection = 'brainrot';
		await loadNextQuestion();
	}

	async function loadNextQuestion() {
		const response = await fetch(`/api/iq?sessionId=${sessionId}`);
		const data = await response.json();
		currentQuestion = data.question as Question;
	}

	async function handleAnswer(answerIndex: number) {
		const response = await fetch('/api/iq', {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ sessionId, answer: answerIndex })
		});
		const data = (await response.json()) as IQResponse;

		if (data.completed) {
			testCompleted = true;
			iqScore = data.score ?? 0;
		} else {
			currentTestSection = data.nextSection || '';
			sessionData = {
				questionIndex: data.questionIndex,
				section: data.nextSection || ''
			};
			await loadNextQuestion();
		}
	}

	$effect(() => {
		if (form) {
			isSubmitting = false;
			password = '';
			confirmPassword = '';
			if (form.success) {
				username = '';
			}
		}
	});

	$effect(() => {
		if (
			username &&
			password &&
			confirmPassword &&
			password === confirmPassword &&
			password.length >= 8
		) {
			checkFormAndStartTest();
		} else {
			formValidated = false;
			showTest = false;
		}
	});

	$effect(() => {
		if (username) {
			debouncedCheck(username);
		} else {
			isUsernameValid = false;
			usernameError = '';
		}
	});

	let cardVisible = $state(true);

	$effect(() => {
		if (showTest) {
			cardVisible = false;
			setTimeout(() => {
				cardVisible = true;
			}, 50);
		}
	});

	function scrambleText(text: string) {
		return text
			.split('')
			.map((char) => {
				if (char === ' ') return ' ';
				return `<span class="relative">${char}<span class="select-none absolute left-0 opacity-0">${String.fromCharCode(
					8203
				)}${String.fromCharCode(Math.random() * 1000 + 8000)}</span></span>`;
			})
			.join('');
	}
</script>

<div class="flex min-h-screen items-center justify-center p-4">
	<Card
		class={`${cardVisible ? 'opacity-100' : 'opacity-0'} ${
			showTest ? 'w-[95vw] max-w-[850px]' : 'w-[95vw] max-w-[400px]'
		} min-w-[320px]`}
		style="transition: all 0.3s ease-in-out;"
	>
		<CardContent
			class="scrollbar-thin scrollbar-thumb-primary/10 hover:scrollbar-thumb-primary/20 max-h-[85vh] overflow-y-auto overflow-x-hidden p-4 md:p-6"
		>
			<div class="flex flex-col gap-4 md:flex-row md:gap-8">
				<div class="w-full flex-shrink-0 md:w-[350px]">
					<div class="mb-6 flex flex-col space-y-1.5">
						<div
							role="heading"
							aria-level={3}
							class="text-2xl font-semibold leading-none tracking-tight"
						>
							Create Account
						</div>
						<p class="text-muted-foreground text-sm">Enter your details to get started.</p>
					</div>

					<form
						method="POST"
						use:enhance={() => {
							handleSubmit();
							return async ({ result, update }) => {
								if (result.type === 'success') {
									await update();
								} else {
									isSubmitting = false;
									await update();
								}
							};
						}}
					>
						{#if form?.success}
							<Alert
								variant="default"
								class="mb-4 border-green-300 bg-green-100 dark:border-green-700 dark:bg-green-900"
							>
								<AlertTitle>Success</AlertTitle>
								<AlertDescription>
									Account created successfully! You can now <a href="/login" class="underline"
										>log in</a
									>.
								</AlertDescription>
							</Alert>
						{/if}

						{#if form?.error}
							<Alert variant="destructive" class="mb-4">
								<AlertCircle class="h-4 w-4" />
								<AlertTitle>Error</AlertTitle>
								<AlertDescription>{form.error}</AlertDescription>
							</Alert>
						{/if}

						<div class="grid gap-4">
							<!-- Hidden inputs for IQ data -->
							{#if testCompleted}
								<input type="hidden" name="sessionId" value={sessionId} />
								<input type="hidden" name="iqScore" value={iqScore} />
							{/if}

							<div class="grid gap-2">
								<Label for="username">Username</Label>
								<DomainInput
									domain={PUBLIC_DOMAIN}
									id="username"
									name="username"
									bind:value={username}
									required
									disabled={isSubmitting}
									onblur={() => checkFormAndStartTest()}
								/>
								{#if usernamePending}
									<p class="text-muted-foreground text-xs">Checking availability...</p>
								{:else if usernameError}
									<p class="text-destructive text-xs">{usernameError}</p>
								{:else if isUsernameValid}
									<p class="text-xs text-green-600 dark:text-green-500">
										This will be your display name
									</p>
								{/if}
							</div>
							<div class="grid gap-2">
								<Label for="password">Password</Label>
								<Input
									id="password"
									name="password"
									type="password"
									bind:value={password}
									required
									minlength={8}
									disabled={isSubmitting}
								/>
								<p class="text-muted-foreground text-xs">Must be at least 8 characters long</p>
							</div>
							<div class="grid gap-2">
								<Label for="confirmPassword">Confirm Password</Label>
								<Input
									id="confirmPassword"
									name="confirmPassword"
									type="password"
									bind:value={confirmPassword}
									required
									minlength={8}
									disabled={isSubmitting}
									onblur={() => checkFormAndStartTest()}
								/>
							</div>

							<Button type="submit" class="w-full" disabled={isSubmitting || !testCompleted}>
								{isSubmitting ? 'Creating Account...' : 'Create Account'}
							</Button>
							<div class="text-center text-xs">
								By signing up, you agree to our{' '}
								<a href="/legal/privacy" class="text-primary hover:underline">Privacy Policy</a>
								and{' '}
								<a href="/legal/terms" class="text-primary hover:underline">Terms of Service</a>.
							</div>
							<div class="mt-2 text-center text-sm">
								Already have an account?
								<a href="/login" class="text-primary hover:underline"> Log in </a>
							</div>
						</div>
					</form>
				</div>

				{#if showTest}
					<!-- IQ Test section with flexible width on desktop -->
					<div
						class="animate-slide-up md:animate-fade-in w-full pl-0 md:w-[400px] md:border-l md:pl-8"
					>
						<div class="mb-4 flex flex-col space-y-1">
							<div
								role="heading"
								aria-level={3}
								class="text-xl font-semibold leading-none tracking-tight md:text-2xl"
							>
								IQ Test
							</div>
							<p class="text-muted-foreground mb-2 text-sm">
								{#if testCompleted}
									Test completed successfully!
								{:else}
									<span class="capitalize">{currentTestSection}</span> Section
								{/if}
							</p>

							{#if !testCompleted}
								<div class="mt-1 flex items-center gap-1">
									<Progress
										value={currentTestSection === 'brainrot'
											? currentSectionProgress
											: currentTestSection === 'math' || currentTestSection === 'literacy'
												? 100
												: 0}
										class="h-2"
									/>

									<Progress
										value={currentTestSection === 'math'
											? currentSectionProgress
											: currentTestSection === 'literacy'
												? 100
												: 0}
										class="h-2"
									/>

									<Progress
										value={currentTestSection === 'literacy' ? currentSectionProgress : 0}
										class="h-2"
									/>
								</div>
							{/if}
						</div>

						{#if testCompleted}
							<div class="bg-primary/5 rounded-lg p-4 text-center">
								<Check class="text-primary mx-auto h-8 w-8 md:h-12 md:w-12" />
								<div class="mt-2 text-lg font-medium md:text-xl">Completed</div>
								<p class="text-muted-foreground mt-1">
									IQ: <span class="text-foreground text-lg font-bold md:text-xl">{iqScore}</span>
								</p>
							</div>
						{:else if currentQuestion}
							<div class="space-y-3">
								<div class="select-none text-base font-medium md:text-lg">
									{@html scrambleText(currentQuestion.question)}
								</div>

								{#if currentQuestion?.imageUrls}
									<div class="grid max-h-[40vh] grid-cols-2 gap-2 md:max-h-none md:gap-4">
										{#each currentQuestion.imageUrls as imageUrl, i}
											<button
												type="button"
												class="border-muted hover:border-primary relative aspect-square cursor-pointer overflow-hidden rounded-lg border-2 p-0 transition-colors"
												onclick={() => handleAnswer(i)}
												aria-label={`Select option ${i + 1}`}
											>
												<img
													src={imageUrl}
													alt={`Option ${i + 1}`}
													class="h-full w-full object-cover"
												/>
											</button>
										{/each}
									</div>
								{:else}
									<div class="grid gap-2">
										{#each currentQuestion.options as option, i}
											<Button
												variant="outline"
												class="h-auto min-h-[2.5rem] w-full select-none justify-start whitespace-normal py-1 text-left text-sm md:py-2 md:text-base"
												onclick={() => handleAnswer(i)}
											>
												{option}
											</Button>
										{/each}
									</div>
								{/if}
							</div>
						{/if}
					</div>
				{/if}
			</div>
		</CardContent>
	</Card>
</div>

<style>
	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	@keyframes slideUp {
		from {
			transform: translateY(100%);
			opacity: 0;
		}
		to {
			transform: translateY(0);
			opacity: 1;
		}
	}

	:global(.animate-slide-up) {
		animation: slideUp 0.5s ease-out forwards;
	}

	:global(.animate-fade-in) {
		animation: fadeIn 0.5s ease-out forwards;
	}

	@media (min-width: 768px) {
		:global(.animate-slide-up) {
			animation: none;
		}
	}

	span {
		user-select: none;
		-webkit-user-select: none;
		-moz-user-select: none;
		-ms-user-select: none;
	}

	/* Custom scrollbar styling */
	:global(.scrollbar-thin) {
		scrollbar-width: thin;
	}

	:global(.scrollbar-thumb-primary\/10) {
		scrollbar-color: rgba(var(--primary) / 0.1) transparent;
	}

	:global(.hover\:scrollbar-thumb-primary\/20:hover) {
		scrollbar-color: rgba(var(--primary) / 0.2) transparent;
	}

	/* Add smooth width transition */
	:global(.transition-all) {
		transition-property: all;
		transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
	}
</style>
