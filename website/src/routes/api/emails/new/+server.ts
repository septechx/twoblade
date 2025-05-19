import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { PUBLIC_DOMAIN } from '$env/static/public';
import { sql } from '$lib/server/db';
import { checkVocabulary } from '$lib/utils';

export const POST: RequestHandler = async ({ request, cookies }) => {
    try {
        const authToken = cookies.get('auth_token');
        if (!authToken) {
            return json({
                status: 'error',
                message: 'Authentication required'
            }, { status: 401 });
        }

        const emailData = await request.json();
        const { turnstileToken, ...restData } = emailData;

        if (!turnstileToken) {
            return json({
                status: 'error',
                message: 'Security verification required (Turnstile token missing)'
            }, { status: 400 });
        }

        let {
            from, to, subject, body,
            content_type = 'text/plain',
            html_body,
            scheduled_at = null,
            reply_to_id = null,
            thread_id = null,
            attachments = [],
            expires_at = null,
            self_destruct = false,
            hashcash
        } = restData;

        const targetDomain = to && to.includes('#')
            ? to.split('#')[1]
            : PUBLIC_DOMAIN;

        const statusUrl = `https://${targetDomain}/sharp/api/server/health`;
        const statusResponse = await fetch(statusUrl);
        console.log('Status response:', statusResponse.status, "url: ", statusUrl);
        if (!statusResponse.ok) {
            return json({
                status: 'error',
                message: 'Server is not available'
            }, { status: 503 });
        }

        try {
            const username = from.split('#')[0];
            if (username) {
                const users = await sql`
                    SELECT iq FROM users WHERE username = ${username}
                `;
                const userIQ = users[0]?.iq;

                if (content_type === 'text/plain' && body) {
                    const { isValid, limit } = checkVocabulary(body, userIQ);
                    if (!isValid) {
                        return json({
                            status: 'error',
                            message: `Your message contains words longer than the allowed ${limit} characters for your IQ level. Please simplify your language.`
                        }, { status: 400 });
                    }
                }
            } else {
                console.warn("Could not extract username from 'from' address:", from);
            }
        } catch (dbError) {
            console.error("Error fetching user IQ or checking vocabulary:", dbError);

            return json({
                status: 'error',
                message: 'Could not verify vocabulary requirements due to a server error.'
            }, { status: 500 });
        }

        const apiUrl = `https://${targetDomain}/sharp/api/send`;

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
                from, to, subject, body,
                content_type, html_body,
                scheduled_at,
                reply_to_id, thread_id,
                attachments,
                expires_at,
                self_destruct,
                hashcash,
                turnstileToken
            })
        });

        console.log('Response status:', response.status);
        const responseText = await response.text();
        console.log('Response body:', responseText);

        if (response.status === 429) {
            return json({
                status: 'error',
                message: responseText,
                retryWithHigherDifficulty: true
            }, { status: 429 });
        }

        if (!response.ok) {
            return json({
                status: 'error',
                message: `Server responded with ${response.status}: ${responseText}`
            }, { status: response.status });
        }

        try {
            const result = JSON.parse(responseText);
            return json({ status: 'success', result }, { status: 200 });
        } catch (e) {
            return json({
                status: 'error',
                message: 'Invalid JSON response from server'
            }, { status: 500 });
        }
    } catch (error: any) {
        console.error('Fetch error:', error);
        return json({
            status: 'error',
            message: 'Failed to connect to SHARP server:\n' + error.message
        }, { status: 500 });
    }
};