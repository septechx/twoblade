<script lang="ts">
	import { USER_DATA } from '$lib/stores/user';
	import { Button } from '$lib/components/ui/button';
	import {
		Moon,
		Sun,
		Hash,
		Server,
		Shield,
		Clock,
		Zap,
		Lock,
		Star,
		ClockFading,
		Users,
		MessageCircle,
		Sparkles,
		FileText
	} from 'lucide-svelte';
	import { mode, setMode } from 'mode-watcher';
	import DomainInput from '$lib/components/self/DomainInput.svelte';
	import { PUBLIC_DOMAIN } from '$env/static/public';
	import { goto } from '$app/navigation';

	const features = [
		{
			id: 'addressing',
			icon: 'Hash',
			title: '# Addressing',
			description: 'Simple addresses like user#domain.com'
		},
		{
			id: 'self-hosting',
			icon: 'Server',
			title: 'Self Hosting',
			description: 'Run your own email server under your domain'
		},
		{
			id: 'anti-spam',
			icon: 'Shield',
			title: 'Smart Anti-Spam',
			description: 'Hashcash and IQ-based vocabulary controls, paired with Outpoot Nullmark™'
		},
		{
			id: 'scheduling',
			icon: 'Clock',
			title: 'Scheduling',
			description: 'Plan emails with precision timing'
		},
		{
			id: 'self-destruct',
			icon: 'Lock',
			title: 'Self-Destruct',
			description: 'Set expiration dates for sensitive emails'
		},
		{
			id: 'stars',
			icon: 'Star',
			title: 'Stars & Snoozing',
			description: 'Organize emails your way'
		},
		{
			id: 'contacts',
			icon: 'Users',
			title: 'Contacts',
			description: 'Manage your network effectively'
		},
		{
			id: 'chat',
			icon: 'MessageCircle',
			title: 'Real-time Chat',
			description: 'Instant messaging between Twoblade users, for the funnies'
		},
		{
			id: 'classification',
			icon: 'Sparkles',
			title: 'Smart Classification',
			description: 'Auto-sorts emails into categories'
		},
		{
			id: 'fast',
			icon: 'Zap',
			title: 'Lightning Fast',
			description: 'Built for speed and efficiency'
		},
		{
			id: 'rich-text',
			icon: 'FileText',
			title: 'Rich Text Support',
			description: 'Full HTML email support with reactive styling'
		}
	];

	const testimonials = [
		{
			id: 'tovade',
			avatar: '/testimonials/tovade.webp',
			name: 'Tovade',
			role: 'Internet Addict',
			quote:
				"I use twobwade.com, it no googlie~ ✨ It vewy good!! I wike it sooo much~ 💖 A design which doesn't make me feew wike an ancient stony-wony 🗿💦 Awso, suuuuper easy to use~! 10/10 woud wecommend using dis, makes u feew vewy coow and pwoerfuw~!! 💪😤💫"
		},
		{
			id: 'linker',
			avatar: '/testimonials/linker.webp',
			name: 'Linker',
			role: 'Ragebaiter',
			quote:
				"Twoblade transformed the way I launder money, with the anti spam features I was able to ignore any messages from the IRS and the CIA regarding my activities. It's simply an amazing platform for a young entrepreneur like me"
		},
		{
			id: 'papaya',
			avatar: '/testimonials/papaya.webp',
			name: 'Acoustic papaya',
			role: 'Professional Gambler',
			quote:
				'Me use Twoblade.com for send many email. Before email make cry now, me smile. Its fast like zoom zoom Button go click, email go.  No crash yet (only once, but i  press the wrong thing). Best email I use since yesterday ✅ 10/10 maybe even 11. Twoblade is blade twice so sharp :D'
		}
	];

	const founder = {
		name: 'FaceDev',
		title: 'Founder & CEO',
		avatar: '/testimonials/facedev.png',
		quote:
			'I created Twoblade because I believe email should be under your control, not in the hands of big corporations that mine your data. Our mission is to man this shit is boring! Can I get back to watching Clash Royale gameplay? Probably not until I finish writing this shit. Anyway, where was I? Twoibalfea is faeveyr interesting aang aeyou know you shouDLa nake an account right nwo FUCK i cannot fuckin TYPE WITHTHIS KEYBOARD'
	};

	const trustedCompanies = [
		{ name: 'Lyntr', logo: '/companies/lyntr.svg', title: 'fuck fuck fuck fuck' },
		{ name: 'Bliptext', logo: '/companies/bliptext.svg', title: 'fuck fuck fuck fuck' },
		{
			name: 'Real Bitch Solutions',
			logo: '/companies/realbitch.png',
			title: 'Enterprise Consulting'
		},
		{ name: 'Vyntr', logo: '/companies/vyntr.svg', title: 'fuck fuck fuck fuck' },
		{ name: 'GriddyCode', logo: '/companies/griddycode.png', title: 'fuck fuck fuck fuck' },
		{
			name: 'The Outpoot Directive of New York',
			logo: '/companies/outpoot.svg',
			title: 'fuck fuck fuck fuck'
		},
		{ name: 'Bussin Web X', logo: '/companies/webx.png', title: 'fuck fuck fuck fuck' },
		{ name: 'Bussin Wattesigma', logo: '/companies/wattesigma.png', title: 'fuck fuck fuck fuck' }
	];

	function getIconComponent(iconName: string) {
		const iconMap = {
			Hash,
			Server,
			Shield,
			Clock,
			Zap,
			Lock,
			Star,
			ClockFading,
			Users,
			MessageCircle,
			Sparkles,
			FileText
		};
		return iconMap[iconName as keyof typeof iconMap];
	}

	function handleModeToggle() {
		setMode(mode.current === 'light' ? 'dark' : 'light');
	}

	let username = $state('');
	let usernameError = $state('');

	function handleClaimAddress() {
		console.log('Claiming address:', username);
		goto(`/signup?username=${encodeURIComponent(username)}`);
	}

	let aboutText = $state('About');
	let docsText = $state('Docs');
	let pricingText = $state('Pricing');

	function handleNavLinkClick(linkState: { set: (val: string) => void }) {
		linkState.set('sybau');
		setTimeout(() => {
			if (linkState === aboutTextState) {
				aboutText = 'About';
			} else if (linkState === docsTextState) {
				docsText = 'Docs';
			} else {
				pricingText = 'Pricing';
			}
		}, 1000);

		return false;
	}

	const aboutTextState = { set: (val: string) => (aboutText = val) };
	const docsTextState = { set: (val: string) => (docsText = val) };
	const pricingTextState = { set: (val: string) => (pricingText = val) };
</script>

<nav
	class="bg-background/80 fixed left-1/2 top-2 z-50 flex -translate-x-1/2 items-center justify-between rounded-full border px-3 py-1.5 shadow-lg backdrop-blur-lg sm:px-4 sm:py-2 md:px-6 md:py-3"
>
	<div class="mr-6 md:mr-0 flex items-center gap-1.5 sm:gap-2">
		<img src="/logo.svg" alt="Twoblade Logo" class="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
		<span class="text-xs font-semibold sm:text-sm md:text-base">Twoblade</span>
	</div>

	<div class="mx-2 mr-6 flex items-center gap-3 md:mx-6 md:gap-6">
		<a
			href="javascript:void(0)"
			class="text-muted-foreground hover:text-primary text-xs transition-colors sm:text-sm md:text-base"
			onclick={() => handleNavLinkClick(aboutTextState)}>{aboutText}</a
		>
		<a
			href="javascript:void(0)"
			class="text-muted-foreground hover:text-primary text-xs transition-colors sm:text-sm md:text-base"
			onclick={() => handleNavLinkClick(docsTextState)}>{docsText}</a
		>
		<a
			href="javascript:void(0)"
			class="text-muted-foreground hover:text-primary text-xs transition-colors sm:text-sm md:text-base"
			onclick={() => handleNavLinkClick(pricingTextState)}>{pricingText}</a
		>
	</div>

	<div class="flex items-center gap-1.5 sm:gap-2 md:gap-3">
		<Button
			variant="ghost"
			size="icon"
			class="h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9"
			onclick={handleModeToggle}
		>
			{#if mode.current === 'light'}
				<Moon class="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5" />
			{:else}
				<Sun class="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5" />
			{/if}
		</Button>
		{#if $USER_DATA}
			<Button
				href="/inbox"
				variant="default"
				class="px-2 py-1 text-xs sm:px-3 sm:py-1.5 sm:text-sm md:px-4 md:py-2 md:text-base"
				>Open</Button
			>
		{:else}
			<Button
				href="/signup"
				variant="outline"
				class="hidden px-2 py-1 text-xs sm:inline-flex sm:px-3 sm:py-1.5 sm:text-sm md:px-4 md:py-2 md:text-base"
				>Sign up</Button
			>
			<Button
				href="/login"
				variant="default"
				class="px-2 py-1 text-xs sm:px-3 sm:py-1.5 sm:text-sm md:px-4 md:py-2 md:text-base"
				>Login</Button
			>
		{/if}
	</div>
</nav>

<div
	class="from-background to-primary/5 flex min-h-screen flex-col items-center justify-center bg-gradient-to-b p-8 pt-48 text-center"
>
	<h1 class="text-6xl font-bold">
		A sharp new way to
		<span class="relative mx-2 inline-block">
			<span
				class="bg-primary/20 absolute inset-0 origin-center translate-y-[5px] -rotate-[4deg] scale-110 transform rounded-md"
			></span>
			<span class="text-primary relative px-2">email</span>
		</span>
	</h1>
	<p class="text-muted-foreground mb-12 mt-6 max-w-2xl text-xl">
		Run your own email server, control your data, and join a network of self-hosted instances. Built
		for privacy, simplicity and giggles.
	</p>

	<div class="flex flex-col items-center gap-6">
		{#if $USER_DATA}
			<Button href="/inbox" size="lg">Open Inbox</Button>
		{:else}
			<div class="flex flex-col items-center gap-2">
				<div class="flex w-full max-w-md flex-col gap-4 sm:flex-row">
					<div class="relative flex-1">
						<DomainInput
							id="claim-username"
							domain={PUBLIC_DOMAIN}
							bind:value={username}
							placeholder="yourname"
							class="h-12 text-lg"
						/>
						{#if usernameError}
							<p class="text-destructive mt-1 text-xs">{usernameError}</p>
						{/if}
					</div>
					<Button size="lg" onclick={handleClaimAddress}>Create</Button>
				</div>
			</div>
		{/if}
	</div>

	<div class="mt-24 grid max-w-7xl grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-4">
		{#each features as feature}
			<div
				class="bg-card hover:border-primary group flex flex-col overflow-hidden rounded-lg border p-6 transition-all duration-150 hover:shadow-lg"
			>
				<div class="mb-4 flex items-center gap-4">
					<div
						class="bg-primary/10 group-hover:bg-primary/20 rounded-lg p-3 transition-all duration-150"
					>
						<svelte:component this={getIconComponent(feature.icon)} class="text-primary h-6 w-6" />
					</div>
					<h3 class="text-xl font-semibold">{feature.title}</h3>
				</div>

				<p class="text-muted-foreground text-base leading-relaxed">
					{feature.description}
				</p>
			</div>
		{/each}
	</div>

	<div class="py-24">
		<div class="container mx-auto px-4">
			<h2 class="mb-16 text-center text-4xl font-bold">What Our Users Say</h2>

			<div class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
				{#each testimonials as testimonial}
					<div class="bg-card rounded-lg p-8 shadow-md transition-all hover:shadow-lg">
						<div class="mb-6 flex flex-col items-center text-center">
							<div class="mb-3 h-20 w-20 overflow-hidden rounded-full">
								<img
									src={testimonial.avatar}
									alt={testimonial.name}
									class="h-full w-full object-cover"
								/>
							</div>
							<div>
								<h3 class="text-lg font-semibold">{testimonial.name}</h3>
								<p class="text-muted-foreground text-sm">{testimonial.role}</p>
							</div>
						</div>
						<div class="relative">
							<div class="text-primary absolute left-0 top-0 text-6xl opacity-20">"</div>
							<p class="text-muted-foreground relative z-10 pl-6">
								{testimonial.quote}
							</p>
						</div>
					</div>
				{/each}
			</div>
		</div>
	</div>

	<div class="border-border/40 bg-muted/50 rounded-md border-y py-16">
		<div class="container mx-auto px-4">
			<h2 class="mb-12 text-center text-2xl font-medium">Trusted by companies worldwide</h2>

			<div class="mx-auto grid max-w-5xl grid-cols-2 gap-8 md:grid-cols-4">
				{#each trustedCompanies as company}
					<div class="flex flex-col items-center justify-center text-center">
						<img
							src={company.logo}
							alt={company.name}
							class="mb-3 max-h-12 w-auto grayscale transition-all duration-150 hover:grayscale-0"
						/>
						<p class="text-sm font-medium">{company.name}</p>
						<p class="text-muted-foreground text-xs">{company.title}</p>
					</div>
				{/each}
			</div>
		</div>
	</div>

	<div class="container mx-auto px-4 py-16">
		<h2 class="mb-4 text-center text-4xl font-bold">Not convinced yet?</h2>
		<p class="text-muted-foreground mb-16 text-center text-xl">
			Hear what our founder has to say about us!
		</p>

		<div class="mx-auto max-w-3xl">
			<div class="bg-card flex flex-col overflow-hidden rounded-lg border shadow-lg sm:flex-row">
				<div class="flex h-64 w-full items-center justify-center sm:h-auto sm:w-1/3">
					<img src={founder.avatar} alt={founder.name} class="h-48 w-48" />
				</div>
				<div class="flex flex-1 flex-col justify-between p-6 sm:p-8">
					<div>
						<div class="text-primary mb-4 font-serif text-6xl opacity-20">"</div>
						<p class="text-muted-foreground mb-6 text-lg font-light italic leading-relaxed">
							{founder.quote}
						</p>
					</div>
					<div>
						<p class="text-lg font-semibold">{founder.name}</p>
						<p class="text-muted-foreground text-sm">{founder.title}</p>
					</div>
				</div>
			</div>

			<div class="mt-12 text-center">
				<Button href="/signup" size="lg" variant="default">Join Twoblade Today</Button>
			</div>
		</div>
	</div>
</div>

<style>
	.hero {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		text-align: center;
		padding: 2rem;
		gap: 2rem;
		background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
		color: white;
	}

	.logo {
		width: 128px;
		height: 128px;
	}

	h1 {
		font-size: 4rem;
		font-weight: 700;
		margin: 0;
	}

	.tagline {
		font-size: 1.5rem;
		color: #ccc;
		max-width: 600px;
	}

	.cta-buttons {
		display: flex;
		gap: 1rem;
		margin: 2rem 0;
	}

	.button {
		padding: 1rem 2rem;
		border-radius: 8px;
		font-weight: 600;
		text-decoration: none;
		transition: all 0.2s;
	}

	.primary {
		background: #007aff;
		color: white;
	}

	.secondary {
		border: 2px solid #007aff;
		color: #007aff;
	}

	.features {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 2rem;
		max-width: 1200px;
		width: 100%;
		margin-top: 4rem;
	}

	.feature {
		padding: 2rem;
		background: rgba(255, 255, 255, 0.05);
		border-radius: 12px;
	}

	.feature h3 {
		color: #007aff;
		margin: 0 0 1rem 0;
	}

	.feature p {
		color: #ccc;
		margin: 0;
	}

	@media (max-width: 768px) {
		.cta-buttons {
			flex-direction: column;
		}
	}
</style>
