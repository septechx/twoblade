import { createClient } from 'redis';
import type { TestSession } from './iq';
import { REDIS_URL } from '$env/static/private';

const redisUrl = REDIS_URL || 'redis://localhost:6379';

const client = createClient({
  url: redisUrl
});

client.on('error', (err:any) => console.error('Redis Client Error:', err));

await client.connect();

export async function setSession(session: TestSession): Promise<void> {
  await client.set(
    `iq:session:${session.id}`,
    JSON.stringify(session),
    {
      EX: 60 * 60 // Expire after 1 hour
    }
  );
}

export async function getSession(sessionId: string): Promise<TestSession | null> {
  const data = await client.get(`iq:session:${sessionId}`);
  return data ? JSON.parse(data) : null;
}

export async function deleteSession(sessionId: string): Promise<boolean> {
  const result = await client.del(`iq:session:${sessionId}`);
  return result === 1;
}