import { json } from '@sveltejs/kit';
import { sql } from '$lib/server/db';
import type { RequestEvent } from './$types';
import { checkHardcore } from '../../../../../websocket/src/moderation';

export async function GET({ url }: RequestEvent) {
    const username = url.searchParams.get('username');

    if (!username) {
        return json({ available: false, error: 'Username is required' });
    }

    if (username.length > 20) {
        return json({ available: false, error: 'Username must be 20 characters or less' });
    }

    if (checkHardcore(username)) {
        return json({
            available: false,
            error: 'Username contains inappropriate content'
        });
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
        return json({
            available: false,
            error: 'Username can only contain letters, numbers, underscores, and hyphens'
        });
    }

    const result = await sql`
        SELECT EXISTS(
            SELECT 1 FROM users 
            WHERE username = ${username}
        ) as taken
    `;

    return json({
        available: !result[0].taken,
        error: result[0].taken ? 'Username is already taken' : null
    });
}
