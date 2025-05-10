import postgres from 'postgres';
import { jwtVerify } from 'jose';
import fetch from 'node-fetch';

export const sql = postgres(process.env.DATABASE_URL);
const secret = new TextEncoder().encode(process.env.JWT_SECRET);
const alg = 'HS256';

async function verifyTurnstile(token) {
    if (!token) return false;
    try {
        const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                secret: process.env.PRIVATE_TURNSTILE_SECRET_KEY,
                response: token
            })
        });
        const data = await response.json();
        return data.success;
    } catch (error) {
        console.error('Turnstile verification error:', error);
        return false;
    }
}

export async function validateAuthToken(req, res, next) {
    const token = req.headers['authorization']?.split(' ')[1];
    const turnstileToken = req.body?.turnstileToken;
    
    req.turnstileVerified = await verifyTurnstile(turnstileToken);
    
    if (!token) {
        return res.status(401).json({ 
            success: false, 
            message: 'Authentication required' 
        });
    }

    try {
        const { payload } = await jwtVerify(token, secret, {
            algorithms: [alg]
        });

        // check if code is still valid
        const codes = await sql`
            SELECT user_id FROM user_secret_codes 
            WHERE code = ${payload.code}
        `;

        if (!codes.length) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid or expired session' 
            });
        }

        // get user data
        const users = await sql`
            SELECT id, username, domain, is_banned
            FROM users 
            WHERE id = ${payload.userId}
        `;

        if (!users.length || users[0].is_banned) {
            return res.status(403).json({
                success: false,
                message: 'Account not found or banned'
            });
        }

        req.user = users[0];
        next();
    } catch (error) {
        console.error('Auth error:', error);
        return res.status(401).json({ 
            success: false, 
            message: error.code === 'ERR_JWT_EXPIRED' ? 'Token expired' : 'Invalid token'
        });
    }
}
