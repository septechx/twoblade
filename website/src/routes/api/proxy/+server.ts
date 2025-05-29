import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
  const mediaUrl = url.searchParams.get('url');

  if (!mediaUrl) {
    throw error(400, 'Missing URL parameter');
  }

  try {
    const response = await fetch(mediaUrl);

    if (!response.ok) {
      throw error(response.status, 'Failed to fetch media');
    }

    const contentType = response.headers.get('content-type');
    if (!contentType?.startsWith('image/') && !contentType?.startsWith('video/')) {
      throw error(400, 'URL does not point to an image or video');
    }

    const mediaType = contentType.startsWith('image/') ? 'image' : 'video';
    const extension = contentType.substring(contentType.indexOf('/') + 1);

    const headers: Record<string, string> = {
      'Content-Type': contentType!,
      'Cache-Control': 'public, max-age=31536000',
      'Access-Control-Allow-Origin': '*',
      'Content-Disposition': `attachment; filename="${mediaType}.${extension}"`
    };

    return new Response(response.body, { headers });
  } catch (e) {
    console.error('Proxy error:', e);
    throw error(500, 'Failed to proxy media');
  }
};
