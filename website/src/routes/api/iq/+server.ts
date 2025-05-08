import { json, error } from '@sveltejs/kit';
import type { RequestEvent } from './$types';
import { createIQSession, getCurrentQuestion, submitAnswer } from '$lib/server/iq';

export async function POST({ request }: RequestEvent) {
    const sessionId = await createIQSession();
    return json({ sessionId });
}

export async function GET({ url }: RequestEvent) {
    const sessionId = url.searchParams.get('sessionId');
    if (!sessionId) {
        throw error(400, 'Session ID is required');
    }

    const result = await getCurrentQuestion(sessionId);
    if ('error' in result) {
        throw error(404, result.error);
    }

    return json({ question: result.question });
}

export async function PUT({ request }: RequestEvent) {
    const { sessionId, answer } = await request.json();
    
    if (typeof sessionId !== 'string' || typeof answer !== 'number') {
        throw error(400, 'Invalid input');
    }

    const result = await submitAnswer(sessionId, answer);
    if ('error' in result) {
        throw error(400, result.error);
    }

    return json(result);
}
