export type SpotifyLink = {
  type: "track" | "album" | "playlist" | "artist" | "episode" | "show";
  id: string;
  url: string;
  embedUrl: string;
};

const spotifyPattern = /open\.spotify\.com\/(track|album|playlist|artist|episode|show)\/([A-Za-z0-9]+)/;

export function parseSpotifyUrl(value: string): SpotifyLink | null {
  const match = value.match(spotifyPattern);
  if (!match) return null;
  const [, type, id] = match;
  return {
    type: type as SpotifyLink["type"],
    id,
    url: `https://open.spotify.com/${type}/${id}`,
    embedUrl: `https://open.spotify.com/embed/${type}/${id}?utm_source=generator&theme=0`
  };
}

export function isSpotifyUrl(value: string) {
  return Boolean(parseSpotifyUrl(value));
}
