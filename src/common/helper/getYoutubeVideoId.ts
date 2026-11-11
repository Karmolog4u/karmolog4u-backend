
interface YoutubePlaylistItemsResponse {
  items?: Array<{
    contentDetails?: { videoId?: string };
    snippet?: { resourceId?: { videoId?: string } };
  }>;
  error?: { message?: string };
}

export interface YoutubeVideo {
  video: string;
  playlist: string;
}

/** Returns the first video ID in a public YouTube playlist. */
export async function getYoutubeVideoId(
  playlistId: string,
): Promise<YoutubeVideo> {
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey) {
    throw new Error('YOUTUBE_API_KEY is not configured');
  }

  if (!playlistId?.trim()) {
    throw new Error('playlistId is required');
  }

  const url = new URL('https://www.googleapis.com/youtube/v3/playlistItems');
  url.searchParams.set('part', 'contentDetails,snippet');
  url.searchParams.set('playlistId', playlistId.trim());
  url.searchParams.set('maxResults', '1');
  url.searchParams.set('key', apiKey);

  const response = await fetch(url);
  const data = (await response.json()) as YoutubePlaylistItemsResponse;

  if (!response.ok) {
    throw new Error(
      `YouTube API error (${response.status}): ${
        data.error?.message ?? response.statusText
      }`,
    );
  }

  const firstItem = data.items?.[0];
  return {
    video:
      firstItem?.contentDetails?.videoId ??
      firstItem?.snippet?.resourceId?.videoId ??
      '',
    playlist: playlistId.trim(),
  };
}
