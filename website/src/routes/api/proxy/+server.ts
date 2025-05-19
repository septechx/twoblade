import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
  const imageUrl = url.searchParams.get('url');

  if (!imageUrl) {
    throw error(400, 'Missing URL parameter');
  }

  try {
    const response = await fetch(imageUrl);

    if (!response.ok) {
      throw error(response.status, 'Failed to fetch image');
    }

    const contentType = response.headers.get('content-type');
    if (!contentType?.startsWith('image/')) {
      throw error(400, 'URL does not point to an image');
    }

    const headers: Record<string, string> = {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=31536000',
      'Access-Control-Allow-Origin': '*'
    };

    if (contentType.startsWith('image/svg+xml')) {
      headers['Content-Disposition'] = 'attachment; filename="image.svg"';
    }

    return new Response(response.body, { headers });
  } catch (e) {
    console.error('Proxy error:', e);
    throw error(500, 'Failed to proxy image');
  }
};
