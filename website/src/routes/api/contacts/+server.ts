import { json } from '@sveltejs/kit';
import { sql } from '$lib/server/db';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals, url }) => {
    if (!locals.user) {
        return new Response('Unauthorized', { status: 401 });
    }

    const search = url.searchParams.get('search');

    const contacts = await sql`
        SELECT c.*
        FROM contacts c
        WHERE c.user_id = ${locals.user.id}
        ${search ? sql`AND (
            c.full_name ILIKE ${`%${search}%`} OR 
            c.email_address ILIKE ${`%${search}%`} OR 
            c.tag ILIKE ${`%${search}%`}
        )` : sql``}
        ORDER BY c.full_name ASC
    `;

    return json({ contacts });
};

export const POST: RequestHandler = async ({ request, locals }) => {
    if (!locals.user) {
        return new Response('Unauthorized', { status: 401 });
    }

    const contact = await request.json();

    try {
        const result = await sql`
            INSERT INTO contacts (user_id, full_name, email_address, tag)
            VALUES (${locals.user.id}, ${contact.fullName}, ${contact.email}, ${contact.tag})
            RETURNING id
        `;

        return json({ id: result[0].id });
    } catch (error) {
        if (typeof error === 'object' && error && 'code' in error && error.code === '23505') {
            return json({ error: 'Contact with this email already exists' }, { status: 400 });
        }
        throw error;
    }
};

export const PUT: RequestHandler = async ({ request, locals, url }) => {
    if (!locals.user) {
        return new Response('Unauthorized', { status: 401 });
    }

    const contact = await request.json();
    const id = url.searchParams.get('id');
    if (!id) return new Response('Missing contact ID', { status: 400 });
    
    try {
        await sql`
            UPDATE contacts 
            SET 
                full_name = ${contact.fullName}, 
                email_address = ${contact.email}, 
                tag = ${contact.tag},
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ${id} 
            AND user_id = ${locals.user.id}
        `;

        return json({ success: true });
    } catch (error) {
        console.error('Failed to update contact:', error);
        return json({ error: 'Failed to update contact' }, { status: 500 });
    }
};

export const DELETE: RequestHandler = async ({ locals, url }) => {
    if (!locals.user) {
        return new Response('Unauthorized', { status: 401 });
    }

    const id = url.searchParams.get('id');
    if (!id) return new Response('Missing contact ID', { status: 400 });
    
    try {
        await sql`
            DELETE FROM contacts 
            WHERE id = ${id} 
            AND user_id = ${locals.user.id}
        `;

        return json({ success: true });
    } catch (error) {
        console.error('Failed to delete contact:', error);
        return json({ error: 'Failed to delete contact' }, { status: 500 });
    }
};