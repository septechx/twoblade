<script lang="ts">
	import { Separator } from '$lib/components/ui/separator';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import ShieldCheck from 'lucide-svelte/icons/shield-check';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';

	const LAST_UPDATED = 'May 5, 2025';
	const CONTACT_EMAIL = 'admin#twoblade.com';
</script>

<svelte:head>
	<title>Privacy Policy | Twoblade</title>
	<meta
		name="description"
		content="Learn how Twoblade protects your privacy and handles your email data."
	/>
	<meta name="keywords" content="privacy, policy, data protection, email, twoblade" />
	<meta property="og:title" content="Privacy Policy | Twoblade" />
	<meta
		property="og:description"
		content="Learn how Twoblade protects your privacy and handles your email data."
	/>
	<meta property="og:type" content="website" />
	<meta property="og:url" content={page.url.href} />
</svelte:head>

<div
	class="container mx-auto max-h-screen max-w-4xl overflow-y-auto py-10 [-ms-overflow-style:'none'] [scrollbar-width:'none'] [&::-webkit-scrollbar]:hidden"
>
	<Card.Root class="mb-20 p-6">
		<div class="mb-8 flex items-center gap-3">
			<ShieldCheck class="text-primary h-10 w-10" />
			<div>
				<h1 class="text-4xl font-bold">Privacy Policy</h1>
				<p class="text-muted-foreground">Last updated: {LAST_UPDATED}</p>
			</div>
		</div>

		<Separator class="my-6" />

		<div class="space-y-6">
			<Card.Content>
				<h2 class="mb-4 text-2xl font-semibold">1. Our Privacy Commitment</h2>
				<p class="mb-4">
					At Twoblade, we prioritize the privacy and security of your email communications. Our
					platform uses the SHARP protocol and is designed to provide secure, efficient email
					management while protecting your data. This policy outlines how we collect, use, and
					protect your information.
				</p>
			</Card.Content>

			<Card.Content>
				<h2 class="mb-4 text-2xl font-semibold">2. Information We Collect</h2>
				<p class="mb-4">We collect various types of information to provide and improve our services:</p>
				<div class="space-y-4">
					<div>
						<h3 class="mb-2 text-lg font-medium">2.1 Account Information</h3>
						<p>When you register, we collect:</p>
						<ul class="ml-6 list-disc space-y-1">
							<li>Username and Domain (forming your unique Twoblade address)</li>
							<li>Hashed Password (we never store your plain text password)</li>
							<li>Intelligence Quotient (IQ) score (used for vocabulary features)</li>
							<li>Account status flags (e.g., admin, banned)</li>
							<li>Creation timestamp</li>
						</ul>
					</div>

					<div>
						<h3 class="mb-2 text-lg font-medium">2.2 Email Data</h3>
						<p>When you send, receive, or store emails, we process:</p>
						<ul class="ml-6 list-disc space-y-1">
							<li>Sender and Recipient Addresses (including domains)</li>
							<li>Subject Line</li>
							<li>Email Body Content (both plain text and HTML)</li>
							<li>Attachments (metadata and content, see section 2.5)</li>
							<li>Metadata: Timestamps (sent, received, read, snoozed), status (pending, sent, failed, etc.), reply/thread IDs, content type</li>
							<li>Classification Labels (e.g., primary, promotions)</li>
							<li>Expiration and Self-Destruct settings</li>
							<li>Hashcash Headers (for spam analysis)</li>
							<li>Outpoot Nullmark™ data (for spam analysis and content moderation)</li>
						</ul>
					</div>

					<div>
						<h3 class="mb-2 text-lg font-medium">2.3 Drafts and Contacts</h3>
						<ul class="ml-6 list-disc space-y-1">
							<li>Email Drafts: Content saved before sending.</li>
							<li>Contacts: Names, email addresses, and tags you save.</li>
						</ul>
					</div>

					<div>
						<h3 class="mb-2 text-lg font-medium">2.4 Settings and Preferences</h3>
						<ul class="ml-6 list-disc space-y-1">
							<li>Notification Preferences (enabled/disabled)</li>
							<li>Storage Limits</li>
							<li>Starred Email flags</li>
						</ul>
					</div>

					<div>
						<h3 class="mb-2 text-lg font-medium">2.5 Attachments</h3>
						<p>When you upload or receive attachments:</p>
						<ul class="ml-6 list-disc space-y-1">
							<li>File Content (stored securely)</li>
							<li>Metadata: Filename, size, type (MIME type), unique key, status, timestamps</li>
						</ul>
						<p class="mt-2 text-sm text-muted-foreground">Attachments are subject to size limits (currently 25MB) and storage quotas.</p>
					</div>

					<div>
						<h3 class="mb-2 text-lg font-medium">2.6 Usage and Technical Data</h3>
						<ul class="ml-6 list-disc space-y-1">
							<li>IP Address and User Agent: Collected during authentication token generation for security purposes.</li>
							<li>General Usage Data: Non-identifiable patterns to improve service performance and reliability.</li>
						</ul>
					</div>
				</div>
			</Card.Content>

			<Card.Content>
				<h2 class="mb-4 text-2xl font-semibold">3. How We Use Your Information</h2>
				<p class="mb-4">We use the collected information for the following purposes:</p>
				<ul class="ml-6 list-disc space-y-2">
					<li><strong>Providing Email Services:</strong> Delivering emails locally and to remote SHARP servers, storing emails and attachments, managing contacts and drafts.</li>
					<li><strong>Security and Authentication:</strong> Verifying your identity, protecting against unauthorized access, detecting and preventing spam using Hashcash analysis and Outpoot Nullmark™ technology.</li>
					<li><strong>Service Improvement:</strong> Analyzing usage patterns (in aggregate, non-identifiable ways) to enhance features and performance.</li>
					<li><strong>Feature Provision:</strong> Enabling features like scheduled sending, email expiration, self-destruct, snoozing, notifications, and vocabulary checks based on IQ.</li>
					<li><strong>Email Classification:</strong> Automatically categorizing emails based on keywords and structure (see Section 4).</li>
					<li><strong>Enforcing Limits:</strong> Managing storage quotas and attachment size limits.</li>
					<li><strong>Troubleshooting:</strong> Diagnosing and resolving technical issues.</li>
				</ul>
				<p class="mt-4 font-medium">We do not sell your personal data to third parties.</p>
			</Card.Content>

			<Card.Content>
				<h2 class="mb-4 text-2xl font-semibold">4. AI Features and Data Processing</h2>
				<p class="mb-4">We use automated systems (including keyword analysis and HTML structure analysis) for email classification (e.g., Promotions, Updates). Currently, this does not involve external AI providers.</p>
				<ul class="ml-6 list-disc space-y-2">
					<li>Email content is processed securely within our system for classification.</li>
					<li>No personal data from your emails is used to train external AI models, except for Twoblade's own proprietary AI models that may be used to improve our services.</li>
					<li>Classification primarily helps organize your inbox based on predefined rules.</li>
					<li>Any AI features developed by Twoblade process your data internally and securely.</li>
				</ul>
			</Card.Content>

			<Card.Content>
				<h2 class="mb-4 text-2xl font-semibold">5. Data Sharing and Third Parties</h2>
				<p class="mb-4">We limit data sharing but may share information in specific circumstances:</p>
				<ul class="ml-6 list-disc space-y-2">
					<li><strong>Other SHARP Servers:</strong> When you send an email to an address on a different SHARP server, we transmit the necessary email data (sender, recipient, subject, body, attachments) via the SHARP protocol.</li>
					<li><strong>Legal Requirements:</strong> We may disclose information if required by law, subpoena, or other legal process, or if we believe in good faith that disclosure is necessary to protect our rights, your safety, or the safety of others.</li>
				</ul>
			</Card.Content>

			<Card.Content>
				<h2 class="mb-4 text-2xl font-semibold">6. Data Security</h2>
				<p class="mb-4">We implement technical and organizational measures to protect your data:</p>
				<ul class="ml-6 list-disc space-y-2">
					<li><strong>Password Hashing:</strong> Storing user passwords securely using strong hashing algorithms.</li>
					<li><strong>Access Controls:</strong> Limiting access to data based on roles and responsibilities.</li>
					<li><strong>Encryption:</strong> While the SHARP protocol itself is basic TCP, we encourage secure connections for API access (HTTPS). Data at rest in the database and object storage is protected by provider security measures.</li>
					<li><strong>Spam Mitigation:</strong> Utilizing Hashcash proof-of-work to reduce spam.</li>
					<li><strong>Regular Audits:</strong> Periodically reviewing security practices (though specific measures like end-to-end encryption are not currently implemented for all data).</li>
					<li><strong>Attachment Limits:</strong> Enforcing size limits on attachments.</li>
				</ul>
			</Card.Content>

			<Card.Content>
				<h2 class="mb-4 text-2xl font-semibold">7. Your Rights and Choices</h2>
				<p class="mb-4">You have control over your data:</p>
				<ul class="ml-6 list-disc space-y-2">
					<li><strong>Access and Rectification:</strong> You can access and update most of your account information and settings through the platform.</li>
					<li><strong>Data Export:</strong> You can request an export of your data (including emails, settings, contacts, and attachment metadata) via the Settings page. Exports are typically available as a JSON file.</li>
					<li><strong>Account Deletion:</strong> You can request to delete your account via the Settings page. Please see Section 8 for details on data retention after deletion.</li>
					<li><strong>Opt-out of Features:</strong> While core email functionality is required, you implicitly opt-out of features like notifications by not enabling them.</li>
				</ul>
			</Card.Content>

			<Card.Content>
				<h2 class="mb-4 text-2xl font-semibold">8. Data Retention and Deletion</h2>
				<ul class="ml-6 list-disc space-y-2">
					<li><strong>Email Expiration:</strong> Emails may be automatically deleted if they have an `expires_at` timestamp set, or if the `self_destruct` flag is enabled (details on self-destruct trigger TBD).</li>
					<li><strong>Account Deletion:</strong> When you delete your account:
						<ul class="ml-6 list-disc space-y-1">
							<li>Your account is marked as deleted (`deleted_at` timestamp is set), effectively deactivating it.</li>
							<li>Personal data like settings, drafts, and contacts are permanently deleted.</li>
							<li>Your username is reserved to prevent impersonation.</li>
							<li>Emails you participated in (sent or received) are generally preserved for other users involved in those conversations unless they also expire.</li>
						</ul>
					</li>
					<li><strong>Logs:</strong> Technical logs (like IP/User Agent) may be retained for a limited period for security and auditing purposes.</li>
					<li><strong>Failed/Stale Data:</strong> Emails that fail to send after a certain period may be marked as 'failed'. Attachments associated with failed operations may be cleaned up.</li>
				</ul>
			</Card.Content>

			<Card.Content>
				<h2 class="mb-4 text-2xl font-semibold">9. Updates to This Policy</h2>
				<p class="mb-4">
					We may update this Privacy Policy periodically. We will notify you of significant changes
					by posting the new policy on our website or through other communication channels. Your
					continued use of Twoblade after changes constitutes acceptance of the updated policy.
				</p>
			</Card.Content>

			<div class="text-muted-foreground text-sm">
				<p>Last Updated: {LAST_UPDATED}</p>
				<p>Contact: <span class="text-primary">{CONTACT_EMAIL}</span></p>
			</div>
		</div>

		<Separator class="my-8" />

		<div class="flex justify-center">
			<Button variant="outline" size="lg" onclick={() => goto('/legal/terms')}>
				Read our Terms of Service →
			</Button>
		</div>
	</Card.Root>
</div>
